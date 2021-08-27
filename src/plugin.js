const fs = require( "fs" );

class Plugin
{
	/**
	 * @param {Object} options
	 */
	constructor( options )
	{
		this.stylesheets = {
			async: {},
			critical: {}
		};

		this.styles = {
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
}

module.exports = Plugin;
