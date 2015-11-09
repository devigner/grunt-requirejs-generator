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

var 
	         fs = require('fs'),
  OptionsReader = require('../lib/OptionsReader.js'),
GeneratorHelper = require('../lib/GeneratorHelper.js'),
      Collector = require('../lib/Collector.js'),
            UML = require('../lib/UML.js'),
       fsExtend = require('../lib/fsExtend.js')
;

module.exports = function( grunt ) {

	grunt.registerMultiTask('requirejs_generator', 'Grunt requirejs config generator', function() { 

		this.options = new OptionsReader( this.data );
		this.helper  = new GeneratorHelper( this.options );

		var
			p,
			name,
			starttime       = Date.now(),
			date            = new Date(),
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
			uml = ''
		;

		if ( !this.options.has('build_dir'))  this.options.set('build_dir','build');
		if ( !this.options.has('yuidoc_dir')) this.options.set('yuidoc_dir', this.options.get('build_dir')+"/apidocs");
		// Check if ignore is set, if not set it
		if ( !this.options.has("ignore") )    this.options.set('ignore',[]);
		
		// Check if yuidoc directory exists
		if ( !fs.existsSync( this.options.get('build_dir')  ) ) fs.mkdirSync( this.options.get('build_dir') , "777" );
		if ( !fs.existsSync( this.options.get('yuidoc_dir') ) ) fs.mkdirSync( this.options.get('yuidoc_dir') , "777" );
		
		// Check if data.json exists in yuidoc directory
		if ( !fs.existsSync( this.options.get('yuidoc_dir') + '/data.json' ) ) {
			throw new Error("Yuidoc data.json is not generated: "+this.options.get('yuidoc_dir') + '/data.json');
		}


		var config = {};
		// Read the require config for third party files
		if ( this.options.has("config") ) {
			if ( typeof this.options.get('config') === "string" ) {
				config = fsExtend.readFile( this.options.get('config') );
				grunt.log.writeln("Read config from file");
			}else{
				config = this.options.get('config');
			}
		}else{
			grunt.log.writeln("config not set");
		}


		String.prototype.repeat = function( num ) {
			return new Array( num + 1 ).join( this );
		};

		var collector = new Collector(
			fsExtend.readFile( this.options.get('yuidoc_dir') + '/data.json'),
			config,
			this.helper
		);
		collector.parse();

		var uml = new UML( this.options.get('application') , collector.getDependencies() );
		if ( uml.parse() ) {
			fsExtend.writeFile( this.options.get('build_dir') + "/uml.jumly", uml.getUml() );
		}

		classList = collector.getFilelist();
		conf = {
			paths: collector.getExportedPathlist(),
			shim:  collector.getShim()
		};

		var bootstrap = this.helper.createRequireSetup( 
			this.options.get('application') , JSON.stringify( conf , null, '\t') , date );

		grunt.log.writeln(bootstrap);


		fsExtend.writeJson( this.options.get('build_dir') + "/shim.json", collector.getShim()  );
		fsExtend.writeJson( this.options.get('build_dir') + "/classes.json", classList );
		fsExtend.writeFile( this.options.get('output') , bootstrap );



		if ( fs.existsSync('.jshintrc') && this.options.has("jshint") ) {
			jshint = readFile('.jshintrc');
			for ( i = 0 ; i < this.options.jshint.length; i++) {
				if ( classList.indexOf( this.options.jshint[i] ) === -1 ) {
					classList.push(this.options.jshint[i]);
				}
			}
			jshint.predef = classList;
			writeFile('.jshintrc', JSON.stringify( jshint , null, '\t') );
		}


		var endtime = Date.now();
		var time = ( ((endtime - starttime) / 1000).toString() ).green;
		grunt.log.writeln('Requirejs generator compile completed in ' + time + ' seconds');
	});

};
