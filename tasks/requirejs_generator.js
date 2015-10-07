/*
 * grunt-requirejs-generator
 * https://github.com/devigner/grunt-requirejs-generator
 *
 * Copyright (c) 2015 Devigner
 * Licensed under the MIT license.
 * 
 * @author Martijn van Beek <martijn.vanbeek@gmail.com>
 */


'use strict';

var fs = require ('fs');

module.exports = function(grunt) {

	grunt.registerMultiTask('requirejs_generator', 'Grunt requirejs config generator', function() {

		var
			starttime       = Date.now(),
			date            = new Date(),
			watch           = ['extends','requires'],
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
				grunt.log.writeln("File written", file.magenta );
				fs.writeFileSync( file , content );
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
			 * @method  copyFile
			 * @param   {String} file
			 * @param   {String} destination
			 * @returns {String} string
			 */
			copyFile = function( file , destination ){
				if ( fs.existsSync( file ) ) {
					grunt.log.writeln("File copied", file.magenta, " -> ", destination.cyan);
					fs.writeFileSync( destination , fs.readFileSync( file ) );
				}else{
					grunt.log.writeln("File copied failed", file.magenta, " -> ", destination.cyan);
				}
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
			createRequireSetup = function(){
				var app = [];
					app.push("/*! Generated with grunt-requirejs-generator @ "+date+" */\n\n");
					app.push("define('"+options.main+"',function(){");
					app.push("	var c = "+json_conf+",");
					app.push("		f = Object.keys( c.shim );");
					app.push("	requirejs.config( c );");
					app.push("	require( f );");
					app.push("});");
				return app.join("\n");
			},

			/**
			 * Create a UML diagram based upon the http://jumly.tmtk.net/ api
			 *
			 * @method createUMLDependencies
			 * @param  {String} target
			 * @param  {Number} depth
			 * @param  {Boolean} write
			 */
			createUMLDependencies = function ( target , depth , write ) {
				var name, i,d = false,tabs;
				if ( write ) {
					tabs = '\t'.repeat(depth);
					//grunt.log.writeln("Target", tabs+target );
					uml += tabs + '@message "requires", "' + target + '.js"';
					depth++;
				}
				for ( name in shim ) {
					if ( name === target ) {
						if ( shim[name].hasOwnProperty("deps") && shim[name].deps.length > 0 ) {
							for ( i = 0 ; i < shim[name].deps.length ; i ++ ) {
								if ( !d && write ) {
									uml += ", ->\n";
								}
								d = true;
								createUMLDependencies( shim[name].deps[i] , depth , true );
							}
						}
					}
				}
				classList.push ( target );
				if ( !d && write ) {
					uml += "\n";
				}
			},
			uml = ''
		;

		String.prototype.repeat = function( num ) {
			return new Array( num + 1 ).join( this );
		};

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
			if ( !options.config instanceof Object ) {
				options.config = readFile( options.config );
			}
			if ( options.config.hasOwnProperty("shim") ) {
				//shim = options.config.shim;
			}else{
				grunt.log.writeln("	>> Shim not defined");
			}
			if ( options.config.hasOwnProperty("paths") ) {
				paths = [];
				for (name in options.config.paths) {
					paths[name] = options.config.paths[name];
				}
			}else{
				grunt.log.writeln("	>> Paths not defined");
			}
			/*if ( options.config.hasOwnProperty("amd") ) {
				amd = options.config.amd;
			}else{
				grunt.log.writeln("	>> AMD not defined");
			}*/
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

		// Copy all names to classList
		for (name in paths) {
			classList.push( name );
		}



		for ( name in classes ) {
			cl    = classes[name];
			de    = {};
			className = formatClassName(cl.name);

			classList.push( className );

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
									shim[className] = {};
								}
								if (!de.hasOwnProperty('deps')) {
									de.deps = [];
								}
								de.deps.push(ext);
								if (!shim.hasOwnProperty(ext)) {
									shim[ext] = {};
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

		writeFile( options.build_dir + "/shim.json", JSON.stringify( shim   , null, '\t') );

		// If application is defined a uml diagram is generated and the classList is filled with all classes used
		var application = '';
		if ( options.hasOwnProperty("application") ) {
			application = options.application;
			uml = '@found "'+application+'.js", ->\n';
			classList = [];
			for (name in options.config.paths) {
				classList.push( name );
			}
			createUMLDependencies(application,1, false );
			writeFile( options.build_dir + "/uml.jumly", uml );
		}



		createStartFileList ();

		if ( options.hasOwnProperty("config") ) {
			if (options.config.hasOwnProperty("shim")) {
				shim = options.config.shim;
			}
		}

		var temp = {};
		for ( i = 0 ; i < classList.length ; i ++ ) {
			temp[classList[i]] = 1;
		}
		classList = [];
		for ( name in temp ) {
			classList.push( name );
		}

		// On purpose this loop does not collect files for the minified version
		var exportPaths = {};
		for ( i = 0 ; i < classList.length ; i ++ ) {
			name = classList[i];
			file = formatFileName(paths[name]);
			totalFiles++;
			exportPaths[name] = removeExtension(file);
		}

		conf = {
			paths: exportPaths,
			shim:  shim
		};


		json_conf         = JSON.stringify( conf  ,      null, '\t');
		json_classes      = JSON.stringify( classList  , null, '\t');
//		json_amd          = JSON.stringify( amd    ,     null, '\t');

		writeFile( options.output , createRequireSetup( options.hasOwnProperty('debug') ) );

//		writeFile( options.build_dir + "/amd.json",          json_amd );
		writeFile( options.build_dir + "/classes.json",      json_classes );


		if ( options.hasOwnProperty("minify") && ( options.minify.hasOwnProperty("enabled") && options.minify.enabled ) ) {


			/**
			 * MINIFIED VERSION
			 */


			var minify = {
				ignore: [],
				copy: [],
				list: []
				}, p,filename, d = [], e = [];


			// Check if ignore is set, if not set it
			if (options.minify.hasOwnProperty("ignore")) {
				minify.ignore = options.minify.ignore;
			}
			// Check if ignore is set, if not set it
			//if (options.minify.hasOwnProperty("ignore")) {

			// Override paths with minified files

			if ( !options.minify.config instanceof Object ) {
				options.minify.config = readFile( options.minify.config );
			}

			var t = options.minify.config.paths;
			for (name in t) {
				paths[name] = t[name];
			}
			//}

			for (i = 0; i < classList.length; i++) {
				for (name in paths) {
					if (name === classList[i]) {
						p = paths[name];
						file = formatFileName(p);

					//	grunt.log.writeln('File: '+paths[name]);

						// Check if file entry starts with slash, if so it is an external loaded file
						if (p.indexOf("/") > 0) {
							if (minify.ignore.indexOf(name) === -1) {

								if ( options.minify.config.paths.hasOwnProperty(name) && p.indexOf("bower") !== -1) {
									filename = p.split("/").splice(-1).join("/");
									//copyFile( p , options.minify.outDir +"/"+ filename );
									p = formatFileName( options.minify.outDir +"/"+ filename );

									minify.copy.push({name: name, path: options.minify.config.paths[name]});
								}else {

									minify.list.push({name: name, path: p});
								}


							} else {
								report.minify.push(name);
							}
						}
					}
				}
			}



			var external = [];
			// Read the require config for third party files
			if ( options.minify.hasOwnProperty("config") ) {
				if ( options.minify.config.hasOwnProperty("shim") ) {
					shim = options.minify.config.shim;
				}else{
					grunt.log.writeln("	>> minify.shim not defined");
				}
				if ( options.minify.config.hasOwnProperty("external") ) {
					external = options.minify.config.external;
				}else{
					grunt.log.writeln("	>> minify.external not defined");
				}
				if ( options.minify.config.hasOwnProperty("paths") ) {
					paths = options.minify.config.paths;
				}else{
					grunt.log.writeln("	>> minify.paths not defined");
				}
			}else{
				grunt.log.writeln("No third party setup found");
			}


			var copy = [],f;
			for (i = 0; i < minify.copy.length; i++) {
				name = minify.copy[i].name;

				if ( external.indexOf( name ) === -1 ) {
					copy.push ( minify.copy[i] );
				}else{
					console.log( "external",name );

					p = paths[name];

					filename = p.split("/").splice(-1).join("/");

					f = options.minify.outDir +"/"+ filename;

					copyFile( p , f );
					//copyFile( p , options.minify.outDir +"/"+ filename );
					f = formatFileName( f );

					if ( !shim.hasOwnProperty(name)) {
						shim[name]  = {};
					}
					paths[name] = f;

				}
			}
			minify.copy = copy;

			for ( name in paths ) {
				if ( external.indexOf( name ) === -1 ) {
					if (paths[name].indexOf("/") === 0) {
						d.push('"' + name + '"');
						e.push(name.replace("-", ""));
					}
					if (paths[name].indexOf("/") > 0) {
						//paths[name] = formatFileName(paths[name]);
						delete paths[name];
					}
				}
			}



			if (options.minify.hasOwnProperty('app')) {
				paths.Application = formatFileName ( options.minify.outDir +"/"+options.minify.app );
			}else{
				grunt.log.writeln("No minified app found");
			}

			grunt.log.writeln("Create app");

			var c = '';
			var app  = '';


			app += 'define("App", [],function(){\n';
			for ( i = 0 ; i < minify.copy.length ; i ++ ) {
				app += "\n\t/***************** "+minify.copy[i].name+" *****************/\n";
				app += "\t"+fs.readFileSync( minify.copy[i].path,{encoding:"utf8"}).replace(/\n/g,"\n\t")+";\n\n";
			}
			/*app += "*//* \n";
			for ( i = 0 ; i < minify.list.length ; i++ ) {
				app += "\t - "+minify.list[i].path+"\n";
			}
			app += "*//*\n";*/
			for ( i = 0 ; i < minify.list.length ; i++ ) {
				name =  minify.list[i].name;

				app += "\n\t/***************** "+minify.list[i].name+" *****************/\n";
				c = fs.readFileSync( minify.list[i].path ,{encoding:"utf8"}).replace(/\n/g,"\n\t");
				app += "\t"+c+"\n\n";
			}
			app += '});\n';


			grunt.log.writeln("App created");

			//json_files   = JSON.stringify( minify.list ,null, '\t' );
			writeFile( options.minify.outDir +"/"+options.minify.app , app );

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

				writeFile( options.minify.outDir +"/"+options.minify.output, createRequireSetup( options.minify.hasOwnProperty('debug') ) );
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
