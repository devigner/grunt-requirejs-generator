# grunt-requirejs-config

> Grunt requirejs config generator

## Getting Started
This plugin requires Grunt `~0.4.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-requirejs-config --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-requirejs-config');
grunt.loadNpmTasks('grunt-contrib-yuidoc');
```

The plugin depends on YUIDoc, therefor you need to load that as well

## Document your code correctly

	/**
	 *
	 * @author    Martijn van Beek <martijn@blueberry.nl>
	 * @since     16 June 2014
	 * @namespace nl.blueberry
	 * @class     ClassNameExtended
	 * @extends   ClassName
	 * @uses      jQuery
	 */
	 
These comments are indexed with yuidoc and are used to determine the dependencies.


## The "requirejs-config" task

### Overview
In your project's Gruntfile, add a section named `requirejs-config` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
	'requirejs_update':{
		config: {
			options: {
				build_dir:  'build',
				yuidoc_dir: 'build/apidocs',
				output: 'assets/js/source/App.js',
				replace:{
					prefix: '',
					that:'',
					with:''
				},
				thirdParty:paths,
				ignore:[
					"StandaloneMediaManager"
				],
				jshint:[
					'requirejs',
					'require',
					'requestAnimationFrame',
					'CKEDITOR',
					"Mousetrap"
				]
			}
		}
	}
});
```

### Options

#### options.build_dir
Type: `String`
Default value: `build`

The location where all the files are stored for yuidoc and requirejs-config

#### options.yuidoc_dir
Type: `String`
Default value: `build/apidocs`

The location where the apidocs are generated

#### options.output
Type: `String`
Default value: ``

The file where requirejs-config will write it's result

#### options.replace
Type: `Object`

Transform resolved paths by yuidoc to a format that is suitable for your project

#### options.replace.prefix
Type: `String`
Default value: ``

Prepend a string before the resolved paths

#### options.replace.that
Type: `String`
Default value: ``

A string to replace in the resolved paths

#### options.replace.with
Type: `String`
Default value: ``

A string to put in place

#### options.thirdParty
Type: `Object`
Default value: `{}`

```js
{
	"paths": {
		"jQuery"                : "src/assets/bower/jquery/jquery.js" ,
		"Bootstrap"             : "src/assets/bower/bootstrap-sass/dist/js/bootstrap.js"
	},
	"shim" : {
		"jQuery":{},
		"Class":{},
		"Bootstrap": {
			"deps": [
				"jQuery"
			]
		}
	},
	"amd": [
		"jQuery"
	]
}
```


##### options.ignore
Type: `Array`
Default value: `[]`

Ignore certain filenames

#### options.jshint
Type: `Array`
Default value: `[]`

Enable jshint updating with resolved files and add this list

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

- 7 November 2014, version 0.0.1: check in of the task
- 7 November 2014, version 0.0.2: small tweaks for npm publishing
- 7 November 2014, version 0.0.3: a task cannot have a dash in it!
