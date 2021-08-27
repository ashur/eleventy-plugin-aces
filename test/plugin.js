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

	describe( ".async", () =>
	{
		it( "should return empty string for undefined identifiers", () =>
		{
			let plugin = new Plugin();

			assert.equal( plugin.async({
				identifier: "/contents/index"
			}), "" );
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
					scope: "async",
					identifier: identifier,
					style: style
				});
			});

			assert.equal(
				plugin.async({
					identifier: identifier
				}),
				styles.join( "\n" ),
			);
		});
	});

	describe( ".critical", () =>
	{
		it( "should return empty string for undefined identifiers", () =>
		{
			let plugin = new Plugin();

			assert.equal( plugin.critical( "/contents/index" ), "" );
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
					scope: "critical",
					identifier: identifier,
					style: style
				});
			});

			assert.equal(
				plugin.critical({
					identifier: identifier
				}),
				styles.join( "\n" ),
			);
		});

		it( "should return styles defined in stylesheets added with addStylesheet", () =>
		{
			let plugin = new Plugin();

			plugin.addStylesheet({
				scope: "critical",
				stylesheet: "./test/fixtures/composition.css",
				category: "composition",
			});

			assert.equal(
				plugin.critical({
					category: "composition"
				}),
				`.stack > * + * {\n	margin-top: var( --stack-size );\n}\n`
			);
		});

		it( "should return styles defined in stylesheets of different categories if no category is specified", () =>
		{
			let plugin = new Plugin();

			plugin.addStylesheet({
				scope: "critical",
				stylesheet: "./test/fixtures/composition.css",
				category: "composition",
			});

			plugin.addStylesheet({
				scope: "critical",
				stylesheet: "./test/fixtures/blocks/card.css",
				category: "blocks",
			});

			assert.equal(
				plugin.critical(),
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
				scope: "critical",
				stylesheet: "./test/fixtures/non-existent.css"
			});

			let fn = () => plugin.critical( identifier );

			assert.throws( fn );
		});

		it( "should return all stylesheets, only styles associated with identifier when identifier is specified", () =>
		{
			let plugin = new Plugin();

			plugin.addStylesheet({
				scope: "critical",
				stylesheet: "./test/fixtures/blocks/card.css",
				category: "blocks",
			});

			let indexIdentifier = "/contents/index";
			let indexStyle = ":root {\n\t--color-black: #333;\n}";

			plugin.addStyle({
				scope: "critical",
				identifier: indexIdentifier,
				style: indexStyle
			});

			let aboutIdentifier = "/contents/about";
			let aboutStyle = ".stack > * + * {\n	margin-top: var( --stack-size );\n}";

			plugin.addStyle({
				scope: "critical",
				identifier: aboutIdentifier,
				style: aboutStyle
			});

			assert.equal(
				plugin.critical({
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
