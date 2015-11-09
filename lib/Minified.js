		if ( this.options.has("minify.enabled") && this.options.get('minify.enabled') ) {


			/**
			 * MINIFIED VERSION
			 */


			var minify = {
				ignore: [],
				copy: [],
				list: []
				}, p,filename, d = [], e = [];


			// Check if ignore is set, if not set it
			if (this.options.minify.hasOwnProperty("ignore")) {
				minify.ignore = this.options.minify.ignore;
			}
			// Check if ignore is set, if not set it
			//if (this.options.minify.hasOwnProperty("ignore")) {

			// Override paths with minified files

			if ( !this.options.minify.config instanceof Object ) {
				this.options.minify.config = readFile( this.options.minify.config );
			}

			var t = this.options.minify.config.paths;
			for (name in t) {
				paths[name] = t[name];
			}
			//}

			for (i = 0; i < classList.length; i++) {
				for (name in paths) {
					if (name === classList[i]) {
						p = paths[name];
						file = this.helper.formatFileName( p );

					//	grunt.log.writeln('File: '+paths[name]);

						// Check if file entry starts with slash, if so it is an external loaded file
						if (p.indexOf("/") > 0) {
							if (minify.ignore.indexOf(name) === -1) {

								if ( this.options.minify.config.paths.hasOwnProperty(name) && p.indexOf("bower") !== -1) {
									filename = p.split("/").splice(-1).join("/");
									//copyFile( p , this.options.minify.outDir +"/"+ filename );
									p = this.helper.formatFileName( this.options.minify.outDir +"/"+ filename );

									minify.copy.push({name: name, path: this.options.minify.config.paths[name]});
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
			if ( this.options.minify.hasOwnProperty("config") ) {
				if ( this.options.minify.config.hasOwnProperty("shim") ) {
					shim = this.options.minify.config.shim;
				}else{
					grunt.log.writeln("	>> minify.shim not defined");
				}
				if ( this.options.minify.config.hasOwnProperty("external") ) {
					external = this.options.minify.config.external;
				}else{
					grunt.log.writeln("	>> minify.external not defined");
				}
				if ( this.options.minify.config.hasOwnProperty("paths") ) {
					paths = this.options.minify.config.paths;
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

					f = this.options.minify.outDir +"/"+ filename;

					copyFile( p , f );
					//copyFile( p , this.options.minify.outDir +"/"+ filename );
					f = this.helper.formatFileName( f );

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
						delete paths[name];
					}
				}
			}



			if (this.options.minify.hasOwnProperty('app')) {
				paths.Application = this.helper.formatFileName ( this.options.minify.outDir +"/"+this.options.minify.app );
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
			writeFile( this.options.minify.outDir +"/"+this.options.minify.app , app );

			minify.conf = {
				paths: paths,
				shim : shim
			};


			for ( name in minify.conf.paths ) {
				minify.conf.paths[name] = removeExtension( minify.conf.paths[name] );
			}


			if (this.options.minify.hasOwnProperty('output')) {

				json_classes = Object.keys( minify.conf.paths ).map(function(k){return k});
				json_classes = JSON.stringify(json_classes, null, '\t');
				json_conf    = JSON.stringify(minify.conf, null, '\t');

				writeFile( this.options.minify.outDir +"/"+this.options.minify.output, createRequireSetup( this.options.minify.hasOwnProperty('debug') ) );
			}else{
				grunt.log.writeln("No minified require setup written");
			}
		}else{
			grunt.log.writeln("No minified setup found");
		}