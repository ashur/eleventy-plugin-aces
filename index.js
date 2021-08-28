const pkg = require( "./package.json" );
const Plugin = require( "./src/plugin" );

/**
 * @param {UserConfig} eleventyConfig
 * @param {Object} options
 * @param {Object} [options.dir]
 * @param {string} [options.dir.components] - Path to components directory, relative to Eleventy includes directory
 * @param {string} [options.dir.output] - Path to CSS output folder, relative to Eleventy output directory
 * @param {string[]} [options.fileExtensions] - Array of file extensions to support in addition to `.css`
 * @param {string} [options.pluginKey]
 * @param {string} [options.stylesheetsDirectory]
 */
module.exports.eleventyPlugin = (eleventyConfig, options={}) =>
{
	let pluginKey = options.pluginKey || "aces";

	// Support scheduled for Eleventy v1.0.0
	// https://www.11ty.dev/docs/data-global-custom/
	if( eleventyConfig.addGlobalData && typeof eleventyConfig.addGlobalData === "function" )
	{
		let plugin = new Plugin( options );
		if( options.stylesheetsDirectory )
		{
			plugin.addStylesheetsDirectory( options.stylesheetsDirectory );
		}

		eleventyConfig.addGlobalData( pluginKey, plugin );
	}
	else
	{
		throw new Error( `The current version of Eleventy doesn't support .addGlobalData(). See README for instructions on configuring your project to use ${pkg.name} as global data instead.` );
	}
};

module.exports.Plugin = Plugin;
