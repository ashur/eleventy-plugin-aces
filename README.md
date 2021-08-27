# eleventy-plugin-css

An Eleventy utility plugin for building critical and asynchronous CSS stylesheets.

## Setup

To install this plugin, run the following command at the root of your Eleventy project:

```
npm install --save ashur/eleventy-plugin-css
```

Next, create a file `css.js` somewhere in your [global data folder](https://www.11ty.dev/docs/data-global/) — ex., `src/_data/plugins/css.js`:

```
+-- src/
  +-- _data/
	+-- plugins/
	  +-- css.js
  +-- _includes/
  +-- content/
+-- .eleventy.js
```

Finally, paste the following into the new data file:

```javascript
// css.js
const Plugin = require( "eleventy-plugin-css/src/plugin" );

let cssPlugin = new Plugin();
cssPlugin.addStylesheetsDirectory( "./src/_includes/css" );

module.exports = cssPlugin;
```

> 🎈 Be sure to set the .


## Usage

> @todo Document usage
