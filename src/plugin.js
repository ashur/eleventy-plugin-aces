const deepmerge = require( "deepmerge" );
const fs = require( "fs" );
const path = require( "path" );

class Plugin
{
	/**
	 * @param {Object} options
	 * @param {Object} [options.dir]
	 * @param {Array} [options.fileExtensions]
	 */
	constructor( { dir={}, fileExtensions=[] } = {} )
	{
		this.dir = {
			components: "components",
			output: "/css",

			...dir
		};

		this.fileExtensions = [".css", ...fileExtensions];

		this.styles = {
			async: {},
			critical: {},
		};

		this.stylesheets = {
			async: {},
			critical: {},
		};
	}

	/**
	 * @param {Object} options
	 * @param {string} options.identifier
	 * @param {string} options.style
	 * @param {string} options.scope
	 */
	addStyle( {identifier, scope, style} = {} )
	{
		if( !this.styles[scope] )
		{
			throw new Error( `Unsupported scope: '${scope}'` );
		}

		if( !this.styles[scope][identifier] )
		{
			this.styles[scope][identifier] = [];
		}

		this.styles[scope][identifier].push( style );
	}

	/**
	 * @param {Object} options
	 * @param {string} [options.category]
	 * @param {string} options.scope
	 * @param {string} options.stylesheet
	 */
	addStylesheet( {category="uncategorized", scope, stylesheet} = {} )
	{
		if( !this.styles[scope] )
		{
			throw new Error( `Unsupported scope: '${scope}'` );
		}

		if( !this.stylesheets[scope][category] )
		{
			this.stylesheets[scope][category] = [];
		}

		this.stylesheets[scope][category].push( stylesheet );
	}

	/**
	 * @param {string} directoryPath
	 */
	addStylesheetsDirectory( directoryPath )
	{
		let directoryStylesheets = getStylesheetsFromDirectory({
			directoryPath: directoryPath,
			fileExtensions: this.fileExtensions,

		});
		this.stylesheets = deepmerge( this.stylesheets, directoryStylesheets );
	}

	/**
	 * Return all async styles associated with the requested identifier
	 *
	 * @param {Object} options
	 * @param {string} [options.identifier]
	 * @param {string} [options.category]
	 * @returns {string}
	 */
	async( {identifier, category} = {} )
	{
		return this.getStyles({
			category: category,
			scope: "async",
			identifier: identifier,
		});
	}

	/**
	 * Return all critical styles associated with the requested identifier
	 *
	 * @param {Object} options
	 * @param {string} [options.identifier]
	 * @param {string} [options.category]
	 * @returns {string}
	 */
	critical( {identifier, category} = {} )
	{
		return this.getStyles({
			category: category,
			scope: "critical",
			identifier: identifier,
		});
	}

	/**
	 * @param {Object} options
	 * @param {string} options.category
	 * @param {string} options.identifier
	 * @param {string} options.scope
	 */
	getStyles( {category, identifier, scope} )
	{
		let allStyles = [];

		/* Stylesheets */
		let stylesheets = [];
		if( category )
		{
			stylesheets = this.stylesheets[scope][category];
		}
		else
		{
			Object.keys( this.stylesheets[scope] ).forEach( category =>
			{
				stylesheets = stylesheets.concat(
					this.stylesheets[scope][category]
				);
			});
		}

		stylesheets.forEach( stylesheet =>
		{
			let style = fs.readFileSync( stylesheet );
			allStyles.push( style.toString() );
		});

		/* Styles */
		let styles = this.styles[scope][identifier];
		if( styles )
		{
			allStyles = allStyles.concat( styles );
		}

		return allStyles.join( "\n" );
	}

	/**
	 * @param {string} identifier
	 * @returns {boolean}
	 */
	hasAsync( identifier )
	{
		return this.hasScope({
			identifier: identifier,
			scope: "async",
		});
	}

	/**
	 * @param {string} identifier
	 * @returns {boolean}
	 */
	hasCritical( identifier )
	{
		return this.hasScope({
			identifier: identifier,
			scope: "critical",
		});
	}

	/**
	 * @param {Object} options
	 * @param {string} options.scope
	 * @param {string} options.identifier
	 * @returns {boolean}
	 */
	hasScope( { scope, identifier } = {} )
	{
		let hasScope = false;

		Object.keys( this.stylesheets[scope] ).forEach( category =>
		{
			hasScope = hasScope || this.stylesheets[scope][category].length > 0;
		});

		if( identifier )
		{
			hasScope = hasScope ||
				(this.styles[scope][identifier] && this.styles[scope][identifier].length > 0)
		}

		return hasScope;
	}
}

module.exports = Plugin;

/**
 * @param {Object} options
 * @param {string} options.directoryPath
 * @param {string[]} options.fileExtensions
 * @param {string} [options.category]
 * @returns {Object}
 */
function getStylesheetsFromDirectory( { directoryPath, fileExtensions, category } )
{
	let stylesheets = {
		async: {},
		critical: {},
	};

	let directoryContents = fs.readdirSync
	(
		directoryPath,
		{ withFileTypes: true }
	);

	directoryContents.forEach( child =>
	{
		let childPath = path.normalize( `${directoryPath}/${child.name}` );
		let childCategory = category;

		if( child.isFile() && !fileExtensions.includes( path.extname( child.name ) ) )
		{
			return;
		}

		if( childCategory === undefined )
		{
			if( child.isDirectory() )
			{
				childCategory = child.name.toLowerCase()
			}
			else
			{
				childCategory = path.basename(
					child.name,
					path.extname( child.name )
				);
			}
		}

		if( !stylesheets.async[childCategory] )
		{
			stylesheets.async[childCategory] = []
		}
		if( !stylesheets.critical[childCategory] )
		{
			stylesheets.critical[childCategory] = []
		}

		if( child.isDirectory() )
		{
			let categoryStylesheets = getStylesheetsFromDirectory({
				directoryPath: childPath,
				fileExtensions: fileExtensions,
				category: childCategory,
			});

			stylesheets.async[childCategory] = stylesheets.async[childCategory].concat(
				categoryStylesheets.async[childCategory]
			);

			stylesheets.critical[childCategory] = stylesheets.critical[childCategory].concat(
				categoryStylesheets.critical[childCategory]
			);
		}
		else
		{
			let scope = path
				.basename( child.name )
				.includes( "-async" )
				? "async"
				: "critical";

			stylesheets[scope][childCategory].push( childPath );
		}
	});

	return stylesheets;
}
