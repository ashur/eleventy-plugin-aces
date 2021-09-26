# eleventy-plugin-esc

An Eleventy utility plugin for building critical and asynchronous CSS stylesheets.

## Setup

To install this plugin, run the following command at the root of your Eleventy project:

```
npm install --save ashur/eleventy-plugin-esc
```

Next, create a file `esc.js` somewhere in your [global data folder](https://www.11ty.dev/docs/data-global/) — ex., `src/_data/plugins/esc.js`:

```
+-- src/
  +-- _data/
	+-- plugins/
	  +-- esc.js
  +-- _includes/
  +-- content/
+-- .eleventy.js
```

and paste the following into the new data file:

```javascript
const {Plugin} = require( "eleventy-plugin-esc" );

let escOptions = {
    // See Options below
};

let escPlugin = new Plugin( escOptions );

module.exports = escPlugin;
```

To specify a stylesheets directory:

```javascript
escPlugin.addStylesheetsDirectory( "./src/_includes/css" );
```

### Options

The `Plugin` constructor accepts an options parameter with the following structure (shown with default values):

```javascript
let escOptions = {
	categorySortOrder: [],

    dir: {
        components: "components"
        output: "/css",
    },

    fileExtensions: [".css"],

    pluginKey: "esc"
};
```

> 🌟 `pluginKey` is for use with `eleventyConfig.addPlugin`. See below.

### Eleventy 1.0.0

It hasn't shipped yet, but Eleventy 1.0.0 will add support for plugins to define global data. When that lands, you can add `eleventy-plugin-esc` in your `.eleventy.js` file instead:

```javascript
// .eleventy.js
const {eleventyPlugin: eleventyPluginEsc} = require( "eleventy-plugin-esc" );

module.exports = eleventyConfig =>
{
    let escOptions = {
        // See Options above
    };

    eleventyConfig.addPlugin( eleventyPluginDataCss, escOptions );
}
```

## Usage

> @todo Document usage
