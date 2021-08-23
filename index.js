const fs = require( "fs" );
const path = require( "path" );
const UserConfig = require( "@11ty/eleventy/src/UserConfig" );

/**
 * @param {Function} dotEleventy
 * @returns {Object}
 */
module.exports.data = (dotEleventy) =>
{
	let projectConfig = dotEleventy( new UserConfig() );

	let inputDir = projectConfig.dir.input || "./";
	let includesDir = `${inputDir}/${projectConfig.dir.includes || '_includes'}`;
	let cssDir = `${includesDir}/${projectConfig.plugins.css.input || 'css'}`;

	let data = {
		output: projectConfig.plugins.css.output,
		stylesheets: listFiles( cssDir, includesDir ),
	};

	data.categories = Object.keys( data.stylesheets );

	return data;
}

/**
 * @param {string} dirPath
 * @param {string} relativeDir
 * @param {string} [category]
 * @returns {Promise<string[]>}
 */
function listFiles( dirPath, relativeDir, category )
{
	let stylesheets = {};

	let dirContents = fs.readdirSync( dirPath, { withFileTypes: true } );
	dirContents.forEach( child =>
	{
		let childPath = `${dirPath}/${child.name}`;
		let childCategory = category;

		if( childCategory === undefined )
		{
			if( child.isDirectory() )
			{
				childCategory = child.name.toLowerCase()
			}
			else
			{
				childCategory = path.basename( child.name, path.extname( child.name ) ) ;
			}
		}

		if( !stylesheets[childCategory] )
		{
			stylesheets[childCategory] = {
				async: [],
				critical: [],
			};
		}

		if( child.isDirectory() )
		{
			let categoryStylesheets = listFiles( childPath, relativeDir, childCategory );

			stylesheets[childCategory].async = stylesheets[childCategory].async.concat(
				categoryStylesheets[childCategory].async
			);

			stylesheets[childCategory].critical = stylesheets[childCategory].critical.concat(
				categoryStylesheets[childCategory].critical
			);
		}
		else
		{
			let relativePath = path.relative( relativeDir, childPath );
			if( path.basename( child.name ).includes( "-async" ) )
			{
				stylesheets[childCategory].async.push( relativePath );
			}
			else
			{
				stylesheets[childCategory].critical.push( relativePath );
			}
		}
	});

	return stylesheets;
}
