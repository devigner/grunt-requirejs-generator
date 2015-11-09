

module.exports = (function(){

	"use strict;"

	var GeneratorHelper = function( options ){
		this.options = options;
		this.classList = [];
	};
	GeneratorHelper.prototype = {

		/**
		 * @method  formatFileName
		 * @param   {String} path
		 * @returns {String}
		 */
		formatFileName : function( path ) {
			var output = path;
			if ( this.options.has('remove') ) {
				output = path.replace( this.options.get('remove') , '' );
			}
			if ( this.options.has('replace.that') && this.options.has('replace.with') ) {
				output = path.replace( this.options.get('replace.that') , this.options.get('replace.with') );
			}
			return output;
		},

		/**
		 * @method  shouldIgnore

		 * @param   {String} file
		 * @returns {boolean}
		 */
		shouldIgnore : function( file ) {
			var i, ignore = this.options.get('ignore'), len = ignore.length;
			for ( i = 0 ; i < len ; i++ ) {
				if ( file.indexOf( ignore[i] ) !== -1 ) {
					return true;
				}
			}
			return false;
		},

		

		/**
		 * @method  formatClassName
		 * @param   {String} name
		 * @returns {String}
		 */
		formatClassName : function( name ){
			var cl = name.split(".");
			return cl[cl.length-1];
		},

		/**
		 * @method  removeExtension
		 * @param   {String} file
		 * @returns {String}
		 */
		removeExtension : function ( file ) {
			var s = file.split(".");
			s.splice( -1 );
			return s.join(".");
		},

		/**
		 *
		 */
		createRequireSetup : function(  app_name , conf , date ){
			var app = [];
				app.push("/*! Generated with grunt-requirejs-generator @ "+date+" */\n\n");
				app.push("define('"+app_name+"',function(){");
				app.push("var c = "+conf+",");
				app.push("	f = Object.keys( c.shim );");
				app.push("requirejs.config( c );");
				app.push("require( f );");
				app.push("});");
			return app.join("\n");
		}
	};

	return GeneratorHelper;

})();