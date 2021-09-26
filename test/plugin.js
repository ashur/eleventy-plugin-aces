/* global describe, it */

const {assert} = require( "chai" );
const CleanCSS = require( "clean-css" );
const {Plugin} = require( "../" );

describe( "Plugin", () =>
{
	describe( ".addScript()", () =>
	{
		it( "should throw if scope is unsupported", () =>
		{
			let plugin = new Plugin();
			let fn = () => plugin.addScript( { scope: "myCustomScope" } );

			assert.throws( fn, "Unsupported scope: 'myCustomScope'" );
		});
	});

	describe( ".addStyle()", () =>
	{
		it( "should throw if scope is unsupported", () =>
		{
			let plugin = new Plugin();
			let fn = () => plugin.addStyle( { scope: "myCustomScope" } );

			assert.throws( fn, "Unsupported scope: 'myCustomScope'" );
		});
	});

	describe( ".addStylesheet()", () =>
	{
		it( "should throw if scope is unsupported", () =>
		{
			let plugin = new Plugin();
			let fn = () => plugin.addStylesheet( { scope: "myCustomScope" } );

			assert.throws( fn, "Unsupported scope: 'myCustomScope'" );
		});
	});

	describe( ".addStylesheetsDirectory()", () =>
	{
		it( "should throw if directory does not exist", () =>
		{
			let plugin = new Plugin();
			let fn = () => plugin.addStylesheetsDirectory( "./test/fixtures/non-existent" );

			assert.throws( fn );
		});

		it( "should add top-level directories and files as categories", () =>
		{
			let plugin = new Plugin();

			assert.isUndefined( plugin.stylesheets.async.blocks );
			assert.isUndefined( plugin.stylesheets.async.composition );
			assert.isUndefined( plugin.stylesheets.async.global );

			assert.isUndefined( plugin.stylesheets.critical.blocks );
			assert.isUndefined( plugin.stylesheets.critical.composition );
			assert.isUndefined( plugin.stylesheets.critical.global );

			plugin.addStylesheetsDirectory( "./test/fixtures/" );

			assert.isArray( plugin.stylesheets.async.blocks );
			assert.isArray( plugin.stylesheets.async.composition );
			assert.isArray( plugin.stylesheets.async.global );

			assert.isArray( plugin.stylesheets.critical.blocks );
			assert.isArray( plugin.stylesheets.critical.composition );
			assert.isArray( plugin.stylesheets.critical.global );
		});

		it( "should add stylesheets alongside existing stylesheets", () =>
		{
			let plugin = new Plugin();

			plugin.addStylesheet({
				category: "global",
				scope: "async",
				stylesheet: "./test/fixtures/global/non-existent.css",
			});

			assert.equal( plugin.stylesheets.async.global.length, 1, "Number of items in stylesheets.async.global" );

			plugin.addStylesheetsDirectory( "./test/fixtures/" );

			assert.equal( plugin.stylesheets.async.global.length, 2, "Number of items in stylesheets.async.global" );
		});

		it( "should only add stylesheets with a .css extension by default", () =>
		{
			let plugin = new Plugin();

			plugin.addStylesheetsDirectory( "./test/fixtures/" );

			assert.equal( plugin.stylesheets.async.blocks.length, 1, "Number of items in stylesheets.async.blocks" );
			assert.equal( plugin.stylesheets.critical.blocks.length, 2, "Number of items in stylesheets.critical.blocks" );
		});

		it( "should support additional file extensions via .fileExtensions options constructor argument", () =>
		{
			let plugin = new Plugin({
				fileExtensions: [".txt"]
			});

			plugin.addStylesheetsDirectory( "./test/fixtures/" );

			assert.equal( plugin.stylesheets.async.blocks.length, 1, "Number of items in stylesheets.async.blocks" );
			assert.equal( plugin.stylesheets.critical.blocks.length, 3, "Number of items in stylesheets.critical.blocks" );
		});
	});

	["async", "critical"].forEach( scope =>
	{
		let method = `${scope}Styles`;

		describe( `.${method}()`, () =>
		{
			it( "should return empty string for undefined identifiers", () =>
			{
				let plugin = new Plugin();

				assert.equal( plugin[method]( "/contents/index" ), "" );
			});

			it( "should return styles added with addStyle concatenated as a single string", () =>
			{
				let plugin = new Plugin();
				plugin.stylePostProcessor = style => style;

				let identifier = "/contents/index";
				let styles = [
					`body {\n\tcolor: #333;\n}`,
					`.Example {\n\tbackground-color: #eee;\n}`,
				];

				styles.forEach( style =>
				{
					plugin.addStyle({
						scope: scope,
						identifier: identifier,
						style: style
					});
				});

				assert.equal(
					plugin[method]({
						identifier: identifier
					}),
					styles.join( "\n" ),
				);
			});

			it( "should return styles defined in stylesheets added with addStylesheet", () =>
			{
				let plugin = new Plugin();
				plugin.stylePostProcessor = style => style;

				plugin.addStylesheet({
					scope: scope,
					stylesheet: "./test/fixtures/composition.css",
					category: "composition",
				});

				assert.equal(
					plugin[method]({
						category: "composition"
					}),
					`.stack > * + * {\n	margin-top: var( --stack-size );\n}\n`
				);
			});

			it( "should return styles defined in stylesheets in the order defined by .categorySortOrder", () =>
			{
				let plugin = new Plugin({
					categorySortOrder: [
						"global",
						"composition",
						"utilities",	// not defined
						"blocks",
					],
				});
				plugin.stylePostProcessor = style => style;

				plugin.addStylesheet({
					scope: scope,
					stylesheet: "./test/fixtures/blocks/button.css",
					category: "blocks",
				});

				plugin.addStylesheet({
					scope: scope,
					stylesheet: "./test/fixtures/composition.css",
					category: "composition",
				});

				plugin.addStylesheet({
					scope: scope,
					stylesheet: "./test/fixtures/global/index.css",
					category: "global",
				});

				assert.equal(
					plugin[method](),
					[
						`:root {\n\t--color-black: #333;\n}\n`, // global/index.css
						`.stack > * + * {\n\tmargin-top: var( --stack-size );\n}\n`, // composition.css
						`.button {\n\tborder-radius: 0.5em;\n}\n`, // blocks/button.css
					].join( "\n" )
				);
			});

			it( "should return styles defined in stylesheets of different categories if no category is specified", () =>
			{
				let plugin = new Plugin();
				plugin.stylePostProcessor = style => style;

				plugin.addStylesheet({
					scope: scope,
					stylesheet: "./test/fixtures/composition.css",
					category: "composition",
				});

				plugin.addStylesheet({
					scope: scope,
					stylesheet: "./test/fixtures/blocks/card.css",
					category: "blocks",
				});

				assert.equal(
					plugin[method](),
					[
						".stack > * + * {\n\tmargin-top: var( --stack-size );\n}\n",
						".card {\n\tborder-radius: 0.5em;\n}\n",

					].join( "\n" )
				);
			});

			it( "should throw if stylesheet does not exist", () =>
			{
				let plugin = new Plugin();
				let identifier = "/contents/about";

				plugin.addStylesheet({
					scope: scope,
					stylesheet: "./test/fixtures/non-existent.css"
				});

				let fn = () => plugin[method]( identifier );

				assert.throws( fn );
			});

			it( "should return all stylesheets, only styles associated with identifier when identifier is specified", () =>
			{
				let plugin = new Plugin();
				plugin.stylePostProcessor = style => style;

				plugin.addStylesheet({
					scope: scope,
					stylesheet: "./test/fixtures/blocks/card.css",
					category: "blocks",
				});

				let indexIdentifier = "/contents/index";
				let indexStyle = ":root {\n\t--color-black: #333;\n}";

				plugin.addStyle({
					scope: scope,
					identifier: indexIdentifier,
					style: indexStyle
				});

				let aboutIdentifier = "/contents/about";
				let aboutStyle = ".stack > * + * {\n	margin-top: var( --stack-size );\n}";

				plugin.addStyle({
					scope: scope,
					identifier: aboutIdentifier,
					style: aboutStyle
				});

				assert.equal(
					plugin[method]({
						identifier: indexIdentifier
					}),
					[
						`.card {\n\tborder-radius: 0.5em;\n}\n`,
						indexStyle,

					].join( "\n" ),
				);
			});
		});
	});

	describe( ".asyncScripts()", () =>
	{
		it( "should return empty string for undefined identifiers", () =>
		{
			let plugin = new Plugin();

			assert.equal( plugin.asyncScripts( "/contents/index" ), "" );
		});

		it( "should return script tag with ", () =>
		{
			let plugin = new Plugin();

			let identifier = "/contents/index";
			let scripts = [
				{
					src: "/local/script.js",
					defer: true,
					"x-custom-attr": "foo",
				},
				{
					src: "https://example.com/remote/script.js",
					init: true,
					"x-custom-attr": "bar",
				},
			];

			scripts.forEach( script =>
			{
				plugin.addScript({
					scope: "async",
					identifier: identifier,
					script: script
				});
			});

			assert.equal(
				plugin.asyncScripts({
					identifier: identifier,
				}),

				[
					`<script src="/local/script.js" defer x-custom-attr="foo"></script>`,
					`<script src="https://example.com/remote/script.js" init x-custom-attr="bar"></script>`,
				].join( "\n" )
			);
		});

		it( "should return scripts added with addScript concatenated as a single string", () =>
		{
			let plugin = new Plugin();

			let identifier = "/contents/index";
			let scripts = [
				`console.log('hello')`,
				`console.log('world')`,
			];

			scripts.forEach( script =>
			{
				plugin.addScript({
					scope: "critical",
					identifier: identifier,
					script: script
				});
			});

			assert.equal(
				plugin.criticalScripts({
					identifier: identifier
				}),
				scripts.join( "\n" ),
			);
		});
	});

	describe( ".criticalScripts()", () =>
	{
		it( "should return empty string for undefined identifiers", () =>
		{
			let plugin = new Plugin();

			assert.equal( plugin.criticalScripts( "/contents/index" ), "" );
		});

		it( "should return scripts added with addScript concatenated as a single string", () =>
		{
			let plugin = new Plugin();

			let identifier = "/contents/index";
			let scripts = [
				`console.log('hello')`,
				`console.log('world')`,
			];

			scripts.forEach( script =>
			{
				plugin.addScript({
					scope: "critical",
					identifier: identifier,
					script: script
				});
			});

			assert.equal(
				plugin.criticalScripts({
					identifier: identifier
				}),
				scripts.join( "\n" ),
			);
		});
	});

	describe( ".hasAsyncStyles()", () =>
	{
		it( "should return false by default", () =>
		{
			let plugin = new Plugin();

			assert.isFalse( plugin.hasAsyncStyles() );
		});

		it( "should return true if any async stylesheets are defined", () =>
		{
			let plugin = new Plugin();

			plugin.addStylesheet({
				category: "blocks",
				scope: "async",
				stylesheet: "./test/fixtures/blocks/card.css",
			});

			assert.isTrue( plugin.hasAsyncStyles() );
		});

		it( "should return true if any async styles are defined", () =>
		{
			let plugin = new Plugin();
			let identifier = "/content/index";

			plugin.addStyle({
				identifier: identifier,
				scope: "async",
				style: "body {}",
			});

			assert.isTrue( plugin.hasAsyncStyles( identifier ) );
		});
	});

	describe( ".hasCriticalStyles()", () =>
	{
		it( "should return false by default", () =>
		{
			let plugin = new Plugin();

			assert.isFalse( plugin.hasCriticalStyles() );
		});

		it( "should return true if any critical stylesheets are defined", () =>
		{
			let plugin = new Plugin();

			plugin.addStylesheet({
				category: "blocks",
				scope: "critical",
				stylesheet: "./test/fixtures/blocks/card.css",
			});

			assert.isTrue( plugin.hasCriticalStyles() );
		});

		it( "should return true if any critical styles are defined", () =>
		{
			let plugin = new Plugin();
			let identifier = "/content/index";

			plugin.addStyle({
				identifier: identifier,
				scope: "critical",
				style: "body {}",
			});

			assert.isTrue( plugin.hasCriticalStyles( identifier ) );
		});
	});

	describe( ".hasAsyncScripts()", () =>
	{
		it( "should return false by default", () =>
		{
			let plugin = new Plugin();

			assert.isFalse( plugin.hasAsyncScripts() );
		});

		it( "should return true if any async scripts are defined", () =>
		{
			let plugin = new Plugin();
			let identifier = "/content/index";

			plugin.addScript({
				identifier: identifier,
				scope: "async",
				script: {
					src: "https://example.com/remote/script.js"
				},
			});

			assert.isTrue( plugin.hasAsyncScripts( identifier ), "plugin.hasAsyncScripts()" );
		});
	});

	describe( ".hasCriticalScripts()", () =>
	{
		it( "should return false by default", () =>
		{
			let plugin = new Plugin();

			assert.isFalse( plugin.hasCriticalScripts() );
		});

		it( "should return true if any critical scripts are defined", () =>
		{
			let plugin = new Plugin();
			let identifier = "/content/index";

			plugin.addScript({
				identifier: identifier,
				scope: "critical",
				script: "console.log('hello')",
			});

			assert.isTrue( plugin.hasCriticalScripts( identifier ), "plugin.hasCriticalScripts()" );
		});
	});

	describe( ".stylePostProcessor()", () =>
	{
		it( "should return beautified styles by default", () =>
		{
			let plugin = new Plugin();
			let originalStyle = "   body{\n\n\n color:red     }\n";

			plugin.addStyle({
				identifier: "/content/index",
				scope: "critical",
				style: originalStyle,
			});

			let expected = new CleanCSS(
					{
						format: "beautify",
					}
				)
				.minify( originalStyle )
				.styles;

			assert.equal( plugin.criticalStyles({
				identifier: "/content/index",
			}), expected );
		});

		it( "should return compressed styles if NODE_ENV === 'production'", () =>
		{
			let originalNodeEnv = process.env.NODE_ENV;

			process.env.NODE_ENV = "production";

			let plugin = new Plugin();
			let originalStyle = "   body{\n\n\n color:red     }\n";

			plugin.addStyle({
				identifier: "/content/index",
				scope: "critical",
				style: originalStyle,
			});

			let expected = new CleanCSS()
				.minify( originalStyle )
				.styles;

			assert.equal( plugin.criticalStyles({
				identifier: "/content/index",
			}), expected );

			process.env.NODE_ENV = originalNodeEnv;
		});

		it( "should apply user-defined rules if overridden", () =>
		{
			let plugin = new Plugin();
			let originalStyle = "   body{\n\n\n color:red     }\n";

			plugin.addStyle({
				identifier: "/content/index",
				scope: "critical",
				style: originalStyle,
			});

			let stylePostProcessor = (style) => style.toUpperCase();
			plugin.stylePostProcessor = stylePostProcessor;

			assert.equal(
				plugin.criticalStyles(
					{
						identifier: "/content/index",
					}
				),
				stylePostProcessor( originalStyle )
			);
		});
	});
});
