
module.exports = function(){

	'use strict';
	
	var Options = function( options ){
		this.init( options );
	}
	Options.prototype = {

		/**
		 * @var array
		 */
		options:null,

		/**
		 * @param array options
		 */
		init:function ( options ) {
			this.options = options;
		},

		/**
		 * @param int key
		 */
		has:function ( key ) {
			grunt.log.writeln("has",key);
			return this.options.hasOwnProperty( key );
		},

		/**
		 * @param int key
		 */
		get:function ( key ) {
			grunt.log.writeln("get",key);
			return this.options[key];
		},

		/**
		 * @param string key
		 * @param string value
		 */
		set:function ( key , value ) {
			grunt.log.writeln("set",key,value);
			this.options[key] = value;
		}
	};

	return Options;
};