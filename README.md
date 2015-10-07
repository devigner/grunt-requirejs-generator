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
	 * @author    Martijn van Beek <martijn.vanbeek@gmail.com>
	 * @since     16 June 2014
	 * @namespace dv.package
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
	'requirejs_generator':{
		config: {
			options: {
				yuidoc_dir:  'build/apidocs',
				build_dir:   'build',
				debug:       true,
				config:      'config/requirejs/paths.json',
				output:      'html/assets/js/source/<%= pkg.main %>.js',
				main:        '<%= pkg.main %>',
				application: '<%= pkg.requirejs_generator.application %>',
				uml: true,
				replace:{
					that:'html/assets/',
					with:'/app-assets/media-manager/'
				},
				ignore: '<%= pkg.requirejs_generator.ignore %>',
				jshint: '<%= pkg.requirejs_generator.jshint %>',
				minify:{
					enabled:true,
					config: 'config/requirejs/paths-minify.json',
					outDir: 'html/assets/js/min',
					output: '<%= pkg.main %>.js',
					app:    'App-<%= pkg.main %>.js'
				}
			}
		}
	},
});
```

Your config could be inside your package.json:

```json
{
	"name":                       "<name>",
	"description":                "<description>",
	"version":                    "<version>",
	"main":                       "<name-of-js-file-to-create>",
	"homepage":                   "<your-homepage>",
	"devDependencies": {
		"grunt":                     "~0.4.2",
		"grunt-contrib-uglify":      "~0.6.0",
		"grunt-contrib-yuidoc":      "~0.5.0",
		"grunt-requirejs-generator": "~0.0.5"
	},
	"yuidoc":{
		"options": {
			"outdir": "build/apidocs",
			"paths": [
				"html/assets/js/source/"
			]
    	}
    },
	"requirejs_generator":{
		"application":"<start-class>",
		"ignore":[
			"IgnoreClass"
		],
		"jshint":[
			'Handlebars'
		]
	}
}
```

### Apploaders

The task generates a file that is not runnable, you need to create a Loader file, for example:

Your source version can differ from the minified version, this is a puzzle that cannot be resolved via the task (I'm still searching for a solution for this).

#### Source version:

```js
require(["MediaManagerRequire"], function(){
	require(["Export"], function(){
		require(["MediaManagerLoader"]);
	});
});
```

#### Minified version:

```js
require(["MediaManagerRequire"], function(){
	require(["Application"], function() {
		require(["jQuery"], function() {
			require(["App"], function() {
				require(["MediaManagerLoader"]);
			});
		});
	});
});
```

### AMD vs non-AMD modules

```json
{
  "paths": {
    "jQuery"                : "//code.jquery.com/jquery-2.1.1.js" ,
    "Class"                 : "html/assets/bower/classy/classy.js" ,
    "raphael"               : "html/assets/bower/raphael/raphael.js" ,
    "Bootstrap"             : "html/assets/bower/bootstrap-sass/dist/js/bootstrap.js",
    "Handlebars"            : "/app-assets/editor/bower/handlebars/handlebars.js"
  },
  "shim" : {
    "jQuery":{},
    "Class":{},
    "raphael": {
      "deps": [
        "jQuery"
      ]
    },
    "Handlebars": {
      "deps": [
        "jQuery"
      ]
    }
  },
  "external":[
  	"raphael"
  ]
}
```

The above setup will load jQuery from it's CDN in both versions, this is because the path is starting with a slash. 
Handlebars is therefor also loaded from the given location.

Do you have a AMD module that doesn't play nice you can define it in the "external" array and it will be copied to your 
directory that is defined in **options.minify.outDir** and loaded before the rest 
( **note: with it's dependencies, does need also be loaded external!** )

### Options

#### options.build_dir
Type: `String`
Default value: `build`

The location where all the files are stored for yuidoc and requirejs-config

#### options.yuidoc_dir
Type: `String`
Default value: `build/apidocs`

The location where the apidocs are generated

#### options.debug
Type: `Boolean`
Default value: `false`

Show more output

#### options.output
Type: `String`
Default value: ``

The file where requirejs-config will write it's result

#### options.main
Type: `String`
Default value: ``

The file name

#### options.uml
Type: `Boolean`
Default value: `false`

Create a file that can be read by umljs (copy resources/uml.html to your build dir and view it)

#### options.replace
Type: `Object`

Transform resolved paths by yuidoc to a format that is suitable for your project

#### options.replace.that
Type: `String`
Default value: ``

A string to replace in the resolved paths

#### options.replace.with
Type: `String`
Default value: ``

A string to put in place

#### options.ignore
Type: `Array`
Default value: `[]`

Class names that Yuidoc has found that you want to ignore (if everything is configured correctly this is not necessary)

#### options.jshint
Type: `Array`
Default value: `[]`

Enable jshint updating with resolved files and add this list

#### options.minify
Type: `Object`
Default value: `{}`

Settings for minifing your code

#### options.minify.enabled
Type: `Boolean`
Default value: `false`

Is minifing enabled?

#### options.minify.config  
Type: `Object`
Default value: `{}`

Override the require js with minified paths

#### options.minify.outDir
Type: `String`
Default value: ``

Directory to write the files

#### options.minify.output
Type: `String`
Default value: ``

The filename to write the require js setup for the minified version

#### options.minify.app
Type: `String`
Default value: ``

The filename to write the minified code

---

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

-  7 November  2014, version 0.0.1: check in of the task
-  7 November  2014, version 0.0.2: small tweaks for npm publishing
-  7 November  2014, version 0.0.3: a task cannot have a dash in it!
- 16 December  2014, version 0.0.7: Added special export for minified version
-  5 January   2015, version 0.0.9: Fully AMD support (testing)
- 15 January   2015, version 0.0.10: Testing minified version with AMD
-  6 March     2015, version 0.1.0: Documented the lastest version
- 22 September 2015, version 0.1.1: Owner change (I left BlueBerry).