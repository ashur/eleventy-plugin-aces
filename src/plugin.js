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
	 * @param {string} [options.category]
	 * @param {string} options.identifier
	 * @param {string} options.style
	 * @param {string} options.scope
	 */
	addStyle( {category="uncategorized", identifier, scope, style} )
	{
		if( !this.styles[scope] )
		{
			throw new Error( `Unsupported scope: '${scope}'` );
		}

		if( !this.styles[scope][category] )
		{
			this.styles[scope][category] = {};
		}

		if( !this.styles[scope][category][identifier] )
		{
			this.styles[scope][category][identifier] = [];
		}

		this.styles[scope][category][identifier].push( style );
	}

	/**
	 * @param {Object} options
	 * @param {string} [options.category]
	 * @param {string} options.identifier
	 * @param {string} options.scope
	 * @param {string} options.stylesheet
	 */
	addStylesheet( {category="uncategorized", identifier, scope, stylesheet} )
	{
		if( !this.styles[scope] )
		{
			throw new Error( `Unsupported scope: '${scope}'` );
		}

		if( !this.stylesheets[scope][category] )
		{
			this.stylesheets[scope][category] = {};
		}

		if( !this.stylesheets[scope][category][identifier] )
		{
			this.stylesheets[scope][category][identifier] = [];
		}

		this.stylesheets[scope][category][identifier].push( stylesheet );
	}

	/**
	 * Return all async styles associated with the requested identifier
	 *
	 * @param {string} identifier
	 * @param {string} category
	 * @returns {string}
	 */
	async( identifier, category="uncategorized" )
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
	 * @param {string} identifier
	 * @param {string} category
	 * @returns {string}
	 */
	critical( identifier, category="uncategorized" )
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
		let stylesheets = this.stylesheets?.[scope]?.[category]?.[identifier];
		if( stylesheets )
		{
			stylesheets.forEach( stylesheet =>
			{
				let style = fs.readFileSync( stylesheet );
				allStyles.push( style.toString() );
			});
		}

		/* Styles */
		let styles = this.styles?.[scope]?.[category]?.[identifier];
		if( styles )
		{
			allStyles = allStyles.concat( styles );
		}

		return allStyles.join( "\n" );
	}
}

module.exports = Plugin;
