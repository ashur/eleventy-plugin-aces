/* global describe, it */

const {assert} = require( "chai" );
const Plugin = require( "../src/plugin" );

describe( "Plugin", () =>
{
	describe( ".addStyle", () =>
	{
		it( "should throw if scope is unsupported", () =>
		{
			let plugin = new Plugin();
			let fn = () => plugin.addStyle( { scope: "myCustomScope" } );

			assert.throws( fn, "Unsupported scope: 'myCustomScope'" );
		});
	});

	describe( ".addStylesheet", () =>
	{
		it( "should throw if scope is unsupported", () =>
		{
			let plugin = new Plugin();
			let fn = () => plugin.addStylesheet( { scope: "myCustomScope" } );

			assert.throws( fn, "Unsupported scope: 'myCustomScope'" );
		});
	});

	["async", "critical"].forEach( scope =>
	{
		describe( `.${scope}`, () =>
		{
			it( "should return empty string for undefined identifiers", () =>
			{
				let plugin = new Plugin();

				assert.equal( plugin[scope]( "/contents/index" ), "" );
			});

			it( "should return styles added with addStyle concatenated as a single string", () =>
			{
				let plugin = new Plugin();
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
					plugin[scope]({
						identifier: identifier
					}),
					styles.join( "\n" ),
				);
			});

			it( "should return styles defined in stylesheets added with addStylesheet", () =>
			{
				let plugin = new Plugin();

				plugin.addStylesheet({
					scope: scope,
					stylesheet: "./test/fixtures/composition.css",
					category: "composition",
				});

				assert.equal(
					plugin[scope]({
						category: "composition"
					}),
					`.stack > * + * {\n	margin-top: var( --stack-size );\n}\n`
				);
			});

			it( "should return styles defined in stylesheets of different categories if no category is specified", () =>
			{
				let plugin = new Plugin();

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
					plugin[scope](),
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

				let fn = () => plugin[scope]( identifier );

				assert.throws( fn );
			});

			it( "should return all stylesheets, only styles associated with identifier when identifier is specified", () =>
			{
				let plugin = new Plugin();

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
					plugin[scope]({
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
});
