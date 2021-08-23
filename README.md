# eleventy-plugin-css

An Eleventy utility plugin for building critical and asynchronous CSS stylesheets.

## Setup

To install this plugin, run the following command at the root of your Eleventy project:

```
npm install --save ashur/eleventy-plugin-find
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
const dotEleventy = require( "../../../.eleventy.js" );
module.exports = require( "eleventy-plugin-css" ).data( dotEleventy );
```

> 🎈 Be sure to check that the `dotEleventy` path is correct for your project structure.


## Usage

> @todo Document usage
