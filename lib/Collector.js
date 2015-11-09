(function(){

	"use strict;"

	var Collector = function( data , config , helper ){
		this.data         = data;
		
		this.helper       = helper;
		this.classList    = [];

		this.config       = config;
		this.paths        = {};
		this.dependencies = {};

		this.shim         = config.hasOwnProperty('shim') ? config.shim : [];
	};
	Collector.prototype = {

		unresolved: function ( name ) {
			console.warn('unresolved',name);
		},

		ignored: function ( name ) {
			console.warn('ignored',name);
		},

		parse:function(){
			var 
				watch = ['extends','requires'],
				name,
				classes = this.data.classes,
				className,
				file,i,list,q,sub,clean,ext,de;



			if ( typeof this.paths == 'boolean' ) {
				this.paths = {};
			}


			for ( name in this.config.paths ) {
				this.paths[ name ] = this.config.paths[name];
				this.classList.push( name );
			}

			console.log ( this.paths );

			for ( name in classes ) {
				this.paths[ this.helper.formatClassName( classes[name].name) ] = classes[name].file;
			}


			

			for ( name in this.paths ) {
				this.classList.push( name );
			}


			for ( name in classes ) {

				de    = {};
				className = this.helper.formatClassName(classes[name].name);

				this.classList.push( className );

				if ( !this.helper.shouldIgnore ( className ) ) {

					for ( i = 0 ; i < watch.length ; i++ ) {
						if ( classes[name].hasOwnProperty(watch[i]) ) {
							list = classes[name][watch[i]];
							if (typeof list === 'string') {
								list = [list];
							}

							for (q = 0; q < list.length; q++) {
								sub = list[q];

								// Remove brackets
								clean = sub.replace("{", "").replace("}", "");

								// Remove namespace
								ext = this.helper.formatClassName(clean);

								// Check if file is found
								if ( this.paths.hasOwnProperty(ext)) {
									if (!this.dependencies.hasOwnProperty(classes[name].name)) {
										this.dependencies[className] = {};
									}
									if (!de.hasOwnProperty('deps')) {
										de.deps = [];
									}
									de.deps.push(ext);
									if (!this.dependencies.hasOwnProperty(ext)) {
										this.dependencies[ext] = {};
									}
									this.dependencies[className] = de;
								}else{
									this.unresolved ( ext );
								}
							}
						}
					}
				}else{
					this.ignored ( className );
				}

				console.log ( this.dependencies );


				this.createStartFileList();
			}
		},

		/**
		 * First get all files that has no dependency
		 *
		 * @method  createStartFileList
		 * @returns {Array}
		 */
		createStartFileList : function(){
			this.classList = [];
			var name,element;
			for ( name in this.dependencies ) {
				element = this.dependencies[name];
				if ( 
					( !element.hasOwnProperty('deps') || element.deps.length === 0 ) && 
					!this.helper.shouldIgnore ( name ) 
				) {
					this.classList.push ( name );
				}
			}
			this.createFilelist();
		},

		/**
		 * @method  createFilelist
		 * @returns {Array}
		 */
		createFilelist : function() {
			var name, i,
				total,
				index,
				match,
				validated = 0;

			for ( name in this.dependencies) {
				if ( this.classList.indexOf(name) === -1) {
					if ( this.dependencies[name].hasOwnProperty('deps')) {

						total = this.classList.length;
						match = this.dependencies[name].deps.length;
						validated = 0;
						for (i = 0; i < total; i++) {
							index = this.dependencies[name].deps.indexOf( this.classList[i] );
							if (index > -1) {
								validated++;
							}
						}
						if (validated === match) {
							this.classList.push(name);
							this.createFilelist();
							return;
						}
					}
				}
			}
		},

		getDependencies:function(){
			return this.dependencies;
		},

		getShim:function(){
			return this.shim;
		},

		getPaths:function(){
			return this.paths;
		},

		getExportedPathlist:function(){
				// On purpose this loop does not collect files for the minified version
			var exportPaths = {},i;
			for ( i = 0 ; i < this.classList.length ; i ++ ) {
				name = this.classList[i];
				file = this.helper.formatFileName( this.paths[name] );
				exportPaths[name] = this.helper.removeExtension(file);
			}
			return exportPaths;
		},

		getFilelist:function(){
			return this.classList;
		}
	};

	module.exports = Collector;
})();
