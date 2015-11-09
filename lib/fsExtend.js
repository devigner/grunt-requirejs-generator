var fs = require('fs');

module.exports = (function(){
	
	'use strict';

	return {
	
		/**
		 * @method readFile
		 * @param  {String} writeFile
		 * @param  {String} content
		 */
		writeFile : function( file , content ){
			console.log("File written", file.magenta );
			fs.writeFileSync( file , content );
		},

		writeJson: function ( file , data ){
			this.writeFile( file , JSON.stringify( data , null, '\t') );
		},

		/**
		 * @method  readFile
		 * @param   {String} file
		 * @returns {String} string
		 */
		readFile : function( file ){
			return JSON.parse( fs.readFileSync( file ,{encoding:"utf8"}) );
		},

		/**
		 * @method  copyFile
		 * @param   {String} file
		 * @param   {String} destination
		 * @returns {String} string
		 */
		copyFile : function( file , destination ){
			if ( fs.existsSync( file ) ) {
				console.log("File copied", file.magenta, " -> ", destination.cyan);
				fs.writeFileSync( destination , fs.readFileSync( file ) );
			}else{
				console.log("File copied failed", file.magenta, " -> ", destination.cyan);
			}
		}
	}
})();