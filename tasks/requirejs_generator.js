/*
 * grunt-requirejs-generator
 * https://github.com/blueberry-media/grunt-requirejs-generator
 *
 * Copyright (c) 2014 BlueBerry Media
 * Licensed under the MIT license.
 * 
 * @author Martijn van Beek <martijn@blueberry.nl>
 */


'use strict';

var fs = require ('fs');

module.exports = function(grunt) {

	grunt.registerMultiTask('requirejs_generator', 'Grunt requirejs config generator', function() {

		var
			starttime       = Date.now(),
			date            = new Date(),
			watch           = ['extends','uses'],
			clean,
			paths           = {},
			shim            = {},
			classList       = [],
			lookup          = {},
			amd             = [],
			report = {
				unresolved :[],
				ignored : [],
				minify : []
			},

			totalFiles      = 0,
			jshint,
			app,
			cl ,
			name,
			n,
			de,
			className,
			list,
			sub,
			ext,
			q,
			i,
			file,
			data,
			classes,
			conf,

			json_conf,
			json_classes,
			json_amd,
			json_files,


			// Merge task-specific and/or target-specific options with these defaults.
			options = this.options({
				punctuation: '.',
				separator: ', '
			}),

			/**
			 * @method readFile
			 * @param  {String} writeFile
			 * @param  {String} content
			 */
			writeFile = function( file , content ){
				fs.writeFileSync( file , content );
				grunt.log.writeln("File written", file.magenta );
			},

			/**
			 * @method  readFile
			 * @param   {String} file
			 * @returns {String} string
			 */
			readFile = function( file ){
				return JSON.parse( fs.readFileSync( file ,{encoding:"utf8"}) );
			},

			/**
			 * @method  formatFileName
			 * @param   {String} path
			 * @returns {String}
			 */
			formatFileName = function( path ) {
				if (options.hasOwnProperty('remove') ) {
					path = path.replace( options.remove , '' );
				}
				if ( options.hasOwnProperty('replace') && options.replace.hasOwnProperty('that') && options.replace.hasOwnProperty('with') ) {
					path = path.replace( options.replace.that , options.replace.with );
				}
				/*if ( options.hasOwnProperty('replace') && options.replace.hasOwnProperty('prefix') ) {
					path = options.replace.prefix+path;
				}*/
				return path;
			},

			/**
			 * @method  shouldIgnore
			 * @param   {String} file
			 * @returns {boolean}
			 */
			shouldIgnore = function( file ) {
				var i, len = options.ignore.length;
				for ( i = 0 ; i < len ; i++ ) {
					if ( file.indexOf( options.ignore[i] ) !== -1 ) {
						return true;
					}
				}
				return false;
			},

			/**
			 * First get all files that has no dependency
			 *
			 * @method  createStartFileList
			 * @returns {Array}
			 */
			createStartFileList = function(){
				var name,element;
				for ( name in shim ) {
					element = shim[name];
					if ( ( !element.hasOwnProperty('deps') || element.deps.length === 0 ) && !shouldIgnore ( name ) ) {
						classList.push ( name );
					}
				}
				//grunt.log.writeln("	> Root classes: "+classList );
				createFilelist();
			},

			/**
			 * @method  createFilelist
			 * @returns {Array}
			 */
			createFilelist = function() {
				var name, i,
					total,
					index,
					match,
					validated = 0;

				for (name in shim) {
					if ( classList.indexOf(name) === -1) {
						if (shim[name].hasOwnProperty('deps')) {

							total = classList.length;
							match = shim[name].deps.length;
							validated = 0;
							for (i = 0; i < total; i++) {
								index = shim[name].deps.indexOf( classList[i] );
								if (index > -1) {
									validated++;
								}
							}
							if (validated === match) {
							//	grunt.log.writeln("Added", name);
								classList.push(name);
								createFilelist();
								return;
							}
						}
					}
				}
			},

			/**
			 * @method  formatClassName
			 * @param   {String} name
			 * @returns {String}
			 */
			formatClassName =  function( name ){
				var cl = name.split(".");
				return cl[cl.length-1];
			},

			/**
			 * @method  removeExtension
			 * @param   {String} file
			 * @returns {String}
			 */
			removeExtension = function ( file ) {
				var s = file.split(".");
				s.splice( -1 );
				return s.join(".");
			},

			/**
			 *
			 */
			createRequireSetup = function( debug ){
				var app = [];
				app.push("/*! Generated with grunt-requirejs-generator @ "+date+" */\n\n");
				app.push("var classes = "+json_classes+";");
				app.push("requirejs.config("+json_conf+" );");
				if ( amd.length > 0 ) {
					app.push("define( " + json_amd + " , function( " + ( amd.join(",") ) + " ) {");
				}
				if ( debug ) {
					app.push("	var nextFile = function( c ){");
					app.push("		if ( c < classes.length ) {");
					app.push("			require([classes[c]],function(){");
					app.push("				$(document).trigger('class-loaded',[c,classes]);");
					app.push("				nextFile( ++ c );");
					app.push("			});");
					app.push("		}else{");
					app.push("			$(document).trigger('app-ready');");
					app.push("		}");
					app.push("	}");
					app.push("	nextFile(0);");
				}else{
					app.push("	require(classes,function(){");
					app.push("		$(document).trigger('app-ready');");
					app.push("	});");
				}
				if ( amd.length > 0 ) {
					app.push("});");
				}
				return app.join("\n");
			}
		;

		if ( !options.hasOwnProperty('build_dir')) {
			options.build_dir = "build";
		}

		if ( !options.hasOwnProperty('yuidoc_dir')) {
			options.build_dir = options.build_dir+"/apidocs";
		}

		// Check if yuidoc directory exists
		if ( !fs.existsSync( options.yuidoc_dir ) ) {
			throw new Error("options.yuidoc_dir is not a directory: "+options.yuidoc_dir);
		}
		// Check if data.json exists in yuidoc directory
		if ( !fs.existsSync( options.yuidoc_dir + '/data.json' ) ) {
			throw new Error("Yuidoc data.json is not generated: "+options.yuidoc_dir + '/data.json');
		}

		// Check if ignore is set, if not set it
		if ( !options.hasOwnProperty("ignore") ) {
			options.ignore = [];
		}



		// Read the require config for third party files
		if ( options.hasOwnProperty("config") ) {
			if ( options.config.hasOwnProperty("shim") ) {
				shim = options.config.shim;
			}else{
				grunt.log.writeln("	>> Shim not defined");
			}
			if ( options.config.hasOwnProperty("paths") ) {
				paths = options.config.paths;
			}else{
				grunt.log.writeln("	>> Paths not defined");
			}
			if ( options.config.hasOwnProperty("amd") ) {
				amd = options.config.amd;
			}else{
				grunt.log.writeln("	>> AMD not defined");
			}
		}else{
			grunt.log.writeln("No third party setup found");
		}

		data    = readFile(options.yuidoc_dir + '/data.json');
		classes = data.classes;

		for ( name in classes ) {
			cl    = classes[name];
			file  = cl.file;
			paths[ formatClassName(cl.name) ] = cl.file;
			name  = cl.name.replace(/\./g,"\/");
			lookup[name] = formatFileName( file );

		}

		for ( name in classes ) {
			cl    = classes[name];
			de    = {};
			className = formatClassName(cl.name);

			if ( !shouldIgnore ( className ) ) {

				for ( i = 0 ; i < watch.length ; i++ ) {
					if (cl.hasOwnProperty(watch[i])) {
						list = cl[watch[i]];
						if (typeof list === 'string') {
							list = [list];
						}

						for (q = 0; q < list.length; q++) {
							sub = list[q];

							// Remove brackets
							clean = sub.replace("{", "").replace("}", "");

							// Remove namespace
							ext  = formatClassName(clean);

							// Check if file is found
							if (paths.hasOwnProperty(ext)) {
								if (!shim.hasOwnProperty(cl.name)) {
									shim[className] = [];
								}

								if (!de.hasOwnProperty('deps')) {
									de.deps = [];
								}
								de.deps.push(ext);
								if (!shim.hasOwnProperty(ext)) {
									shim[ext] = [];
								}


								shim[className] = de;
							}else{
								report.unresolved.push ( ext );
							}

						}
					}
				}
			}else{
				report.ignored.push ( className );
			}
		};

		createStartFileList ();

		// On purpose this loop does not collect files for the minified version
		var exportPaths = {};
		for ( i = 0 ; i < classList.length ; i ++ ) {
			for (name in paths) {
				if ( name === classList[i] ) {
					file = formatFileName(paths[name]);
					totalFiles++;
					exportPaths[name] = removeExtension(file);
				}
			}
		}

		conf = {
			paths: exportPaths,
			shim:  shim
		};

		json_conf         = JSON.stringify( conf   , null, '\t');
		json_classes      = JSON.stringify( classList  , null, '\t');
		json_amd          = JSON.stringify( amd    , null, '\t');

		writeFile( options.output , createRequireSetup( options.hasOwnProperty('debug') ) );
		writeFile( options.build_dir + "/shim.json",         json_conf );
		writeFile( options.build_dir + "/amd.json",          json_amd );
		writeFile( options.build_dir + "/classes.json",      json_classes );


		if ( options.hasOwnProperty("minify") ) {


			/**
			 * MINIFIED VERSION
			 */


			var minify = {
				ignore: [],
				list: []
			};




			// Check if ignore is set, if not set it
			if (options.minify.hasOwnProperty("ignore")) {
				minify.ignore = options.minify.ignore;
			}

			var s;
			for (i = 0; i < classList.length; i++) {
				for (name in paths) {
					if (name === classList[i]) {
						file = formatFileName(paths[name]);

						// Check if file entry starts with slash, if so it is an external loaded file
						if (paths[name].indexOf("/") > 0) {
							if (minify.ignore.indexOf(name) === -1) {
								minify.list.push(paths[name]);
							} else {
								report.minify.push(name);
							}
						//}else{
						//	grunt.log.writeln("Full path file: "+paths[name]);
						}
					}
				}
			}

			json_files   = JSON.stringify( minify.list ,null, '\t' );
			writeFile( options.build_dir + "/files.json", json_files );


			// Read the require config for third party files
			if ( options.minify.hasOwnProperty("config") ) {
				if ( options.minify.config.hasOwnProperty("shim") ) {
					shim = options.minify.config.shim;
				}else{
					grunt.log.writeln("	>> Shim not defined");
				}
				if ( options.minify.config.hasOwnProperty("paths") ) {
					paths = options.minify.config.paths;
				}else{
					grunt.log.writeln("	>> Paths not defined");
				}
				if ( options.minify.config.hasOwnProperty("amd") ) {
					amd = options.minify.config.amd;
				}else{
					grunt.log.writeln("	>> AMD not defined");
				}
			}else{
				grunt.log.writeln("No third party setup found");
			}

			if (options.minify.hasOwnProperty('app')) {
				paths.App = options.minify.app;
			}else{
				grunt.log.writeln("No minified app found");
			}

			json_amd          = JSON.stringify( amd    , null, '\t');

			for ( name in paths ) {
				if (paths[name].indexOf("/") > 0 ) {
					paths[name] = formatFileName( paths[name] );
				}
			}

			minify.conf = {
				paths: paths,
				shim : shim
			};


			for ( name in minify.conf.paths ) {
				minify.conf.paths[name] = removeExtension( minify.conf.paths[name] );
			}


			if (options.minify.hasOwnProperty('output')) {

				json_classes = Object.keys( minify.conf.paths ).map(function(k){return k});
				json_classes = JSON.stringify(json_classes, null, '\t');
				json_conf    = JSON.stringify(minify.conf, null, '\t');

				writeFile(options.minify.output, createRequireSetup( options.minify.hasOwnProperty('debug') ) );
			}else{
				grunt.log.writeln("No minified require setup written");
			}
		}else{
			grunt.log.writeln("No minified setup found");
		}



		if ( fs.existsSync('.jshintrc') && options.hasOwnProperty("jshint") ) {
			jshint = readFile('.jshintrc');
			for ( i = 0 ; i < options.jshint.length; i++) {
				if ( classList.indexOf( options.jshint[i] ) === -1 ) {
					classList.push(options.jshint[i]);
				}
			}
			jshint.predef = classList;
			writeFile('.jshintrc', JSON.stringify( jshint , null, '\t') );
		}


		for ( name in report ) {
			if (report[name].length > 0) {
				grunt.log.writeln("	> "+name+":");
				for (i = 0; i < report[name].length; i++) {
					grunt.log.writeln("		- " + (report[name][i]).red);
				}
			}
		}

		grunt.log.writeln("Total files list: "+ (totalFiles.toString()).cyan+" of "+(classList.length.toString()).cyan );


		var endtime = Date.now();
		var time = ( ((endtime - starttime) / 1000).toString() ).green;
		grunt.log.writeln('Requirejs generator compile completed in ' + time + ' seconds');
	});

};
