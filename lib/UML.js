(function(){

	"use strict;"

	var UML = function( application , shim ){
		this.application = application;
		this.shim        = shim;
		this.output      = "";
	};
	UML.prototype = {

		getUml:function(){
			return this.output;
		},
		
		parse: function(){
			if ( this.application !== false ){
				this.output = '@found "'+this.application+'.js", ->\n';
				this.createUMLDependencies( this.application , 0  );
				return true;
			}
			return false;
		},

		append:function( str ) {
			this.output += str;
		},

		/**
		 * Create a UML diagram based upon the http://jumly.tmtk.net/ api
		 *
		 * @method createUMLDependencies
		 * @param  {String} target
		 * @param  {Number} depth
		 * @param  {Boolean} write
		 */
		createUMLDependencies : function ( target , depth  ) {
			
			var name, i,d = false,tabs = '\t'.repeat(depth);
				//grunt.log.writeln("Target", tabs+target );
			this.append(  tabs + '@message "requires", "' + target + '.js"' );
			depth++;
			
			for ( name in this.shim ) {
				if ( name === target ) {
					if ( this.shim[name].hasOwnProperty("deps") && this.shim[name].deps.length > 0 ) {
						for ( i = 0 ; i < this.shim[name].deps.length ; i ++ ) {
							if ( !d  ) {
								this.append( ", ->\n" );
							}
							d = true;
							this.createUMLDependencies( this.shim[name].deps[i] , depth  );
						}
					}
				}
			}
			//this.classList.push ( target );
			if ( !d ) {
				this.append( "\n" );
			}
		}
	};

	module.exports = UML;
})();
