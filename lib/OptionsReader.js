(function(){

	"use strict;"

	var OptionsReader = function( input ){
		this._input = input;
		console.log ( input );
	};
	OptionsReader.prototype = {

		_input:null,

		/**
		 * @param Object obj
		 * @param Array keys
		 */
		_findKey:function ( obj, keys ) {
		//	console.log('find',obj,keys);
			if ( keys.length > 0 ) {
				var key = keys[0];
				if ( obj.hasOwnProperty ( key ) ) {
					var k = keys.splice(1);
					return this._findKey( obj[key] , k );
				}
				return false;
			}
			return obj;
		},

		/**
		 * @param int key
		 */
		has:function ( key ) {
			var bool = this._findKey( this._input, key.split(".") ) !== false;
		//	console.log("has",key,bool);
			return bool;
		},

		/**
		 * @param int key
		 */
		get:function ( key ) {
			var point = this._findKey( this._input, key.split(".") );
		//	console.log("get",key,point );
			return point;
		},

		/**
		 * @param string key
		 * @param string value
		 */
		set:function ( key , value ) {
			var point = this._findKey( this._input, key.split(".").splice(-1) );
			point[key] = value;
			console.log("set",key,value,this._input);
		}

	};

	module.exports = OptionsReader;
})();
