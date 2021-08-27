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

			assert.equal( plugin.async( "/contents/index" ), "" );
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
				plugin.async( identifier ),
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
				plugin.critical( identifier ),
				styles.join( "\n" ),
			);
		});

		it( "should return styles defined in stylesheets added with addStylesheet", () =>
		{
			let plugin = new Plugin();
			let identifier = "/contents/about";	

			plugin.addStylesheet({
				scope: "critical",
				identifier: identifier,
				stylesheet: "./test/fixtures/composition.css"
			});

			assert.equal(
				plugin.critical( identifier ),
				`.stack > * + * {\n	margin-top: var( --stack-size );\n}\n`
			);
		});

		it( "should throw if stylesheet does not exist", () =>
		{
			let plugin = new Plugin();
			let identifier = "/contents/about";	

			plugin.addStylesheet({
				scope: "critical",
				identifier: identifier,
				stylesheet: "./test/fixtures/non-existent.css"
			});

			let fn = () => plugin.critical( identifier );

			assert.throws( fn );
		});

		it( "should return only appropriate styles when is category specified", () =>
		{
			let plugin = new Plugin();
			let identifier = "/contents/about";	

			let globalStyle = ":root {\n\t--color-black: #333;\n}";
			let compositionStyle = ".stack > * + * {\n	margin-top: var( --stack-size );\n}";

			plugin.addStyle({
				scope: "critical",
				identifier: identifier,
				style: globalStyle,
				category: "global",
			});

			plugin.addStyle({
				scope: "critical",
				identifier: identifier,
				style: compositionStyle,
				category: "composition",
			});

			assert.equal(
				plugin.critical( identifier, "global" ),
				globalStyle,
			);
		});
	});
});
