module.exports = (eleventyConfig, options) =>
{
	/**
	 * Set a property on an object in Nunjucks
	 *
	 * @param {Object} object
	 * @param {string} key
	 * @param {mixed} value
	 * @example
	 * {{ scriptsObject | defineProperty( "keyName", "keyValue" ) }}
	 * @returns {Object}
	 */
	eleventyConfig.addFilter( "defineProperty", (object, key, value) =>
	{
		if( !object[key] )
		{
			object[key] = value;
		}
		return object;
	});

	/**
	 * Silence return values of JavaScript functions called in Nunjucks templates
	 *
	 * @param {Function}
	 * @example
	 * {{ array.push( templateVar ) | quiet }}
	 */
	eleventyConfig.addFilter( "quiet", input => {} );

	/**
	 * Filter array contents to unique items only
	 *
	 * @param {Array} array
	 * @example
	 * {{ array | unique | join( "\n" ) }}
	 */
	eleventyConfig.addFilter( "unique", array =>
	{
		let unique = (value, index, self) =>
		{
			return self.indexOf( value ) === index;
		};

		return array.filter( unique );
	});
};
