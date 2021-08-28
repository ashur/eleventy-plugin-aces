# eleventy-plugin-aces

An Eleventy utility plugin for building critical and asynchronous CSS stylesheets.

## Setup

To install this plugin, run the following command at the root of your Eleventy project:

```
npm install --save ashur/eleventy-plugin-aces
```

Next, create a file `aces.js` somewhere in your [global data folder](https://www.11ty.dev/docs/data-global/) — ex., `src/_data/plugins/css.js`:

```
+-- src/
  +-- _data/
	+-- plugins/
	  +-- css.js
  +-- _includes/
  +-- content/
+-- .eleventy.js
```

and paste the following into the new data file:

```javascript
const {Plugin} = require( "eleventy-plugin-aces" );

let acesOptions = {
    // See Options below
};

let acesPlugin = new Plugin( acesOptions );

module.exports = acesPlugin;
```

To specify a stylesheets directory:

```javascript
acesPlugin.addStylesheetsDirectory( "./src/_includes/css" );
```

### Options

The `Plugin` constructor accepts an options parameter with the following structure (shown with default values):

```javascript
let acesOptions = {
    dir: {
        components: "components"
        output: "/css",
    },

    fileExtensions: [".css"],

    pluginKey: "aces"
};
```

> 🌟 `pluginKey` is for use with `eleventyConfig.addPlugin`. See below.

### Eleventy 1.0.0

It hasn't shipped yet, but Eleventy 1.0.0 will add support for plugins to define global data. When that lands, you can add `eleventy-plugin-aces` in your `.eleventy.js` file instead:

```javascript
// .eleventy.js
const {eleventyPlugin: eleventyPluginAces} = require( "eleventy-plugin-aces" );

module.exports = eleventyConfig =>
{
    let acesOptions = {
        // See Options above
    };

    eleventyConfig.addPlugin( eleventyPluginDataCss, acesOptions );
}
```

## Usage

> @todo Document usage
