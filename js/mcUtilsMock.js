// ======================== //
// Main Function Definition //
// ======================== //
;(function() {

	// =============================== //
	// Local Require.js Implementation //
	// =============================== //
	var require,define;

	(function () {
	    var modules = {};
	    // Stack of moduleIds currently being built.
	    var requireStack = [];
	    // Map of module ID -> index into requireStack of modules currently being built.
	    var inProgressModules = {};

	    function build(module) {
	        var factory = module.factory;
	        module.exports = {};
	        delete module.factory;
	        factory(require, module.exports, module);
	        return module.exports;
	    }

	    require = function (id) {
	        if (!modules[id]) {
	        	mobileLogger.logMessageAndThrow("module " + id + " not found");
	        } else if (id in inProgressModules) {
	            var cycle = requireStack.slice(inProgressModules[id]).join('->') + '->' + id;
	            mobileLogger.logMessageAndThrow("Cycle in require graph: " + cycle);
	        }
	        if (modules[id].factory) {
	            try {
	                inProgressModules[id] = requireStack.length;
	                requireStack.push(id);
	                return build(modules[id]);
	            } finally {
	                delete inProgressModules[id];
	                requireStack.pop();
	            }
	        }
	        return modules[id].exports;
	    };

	    define = function (id, factory) {
	        if (modules[id]) {
	        	mobileLogger.logMessageAndThrow("module " + id + " already defined");
	        }

	        modules[id] = {
	            id: id,
	            factory: factory
	        };
	    };

	    define.remove = function (id) {
	        delete modules[id];
	    };

	})();

	//Export for use in node
	if (typeof module === "object" && typeof require === "function") {
		module.exports.require = require;
	    module.exports.define = define;
	}
	// ================================ //
	// End of Require.js Implementation //
	// ================================ //



	// ============================================================= //
	// Main MobileCaddy Module                                       //
	// This is created as a global (window.mobileCaddy) and is used  //
	// as an entry point - mainly to use 'require' and to access any //
	// variables                                                     //
	// ============================================================= //
	define("mobileCaddy", function(require, exports, module) {
		var mobileCaddy = {
			    define:define,
			    require:require,

				// Globals
				START_PAGE_CONTROLLER : '',
				QUERY_BUFFER_SIZE : 50,
				INITIAL_APPCACHE_INFO : []
		};

		// Expose the mobileCaddy class
		module.exports = mobileCaddy;
	}); // end mobileCaddy define



		// ================================ //
	// Developer Utilities              //
	// ================================ //
	define("mobileCaddy/devUtils", function(require, exports, module) {

		// Sub errors and errors
		var UNKONWN_TABLE     = 1;
		var UNKONWN_FIELD     = 2;
		var ACCESS_DENIED     = 3;
		var MANDATORY_MISSING = 4;
		var DATATYPE_MISMATCH = 5;
		var PROTECTED_FIELD   = 6;
		var SYNC_ALREADY_IN_PROCESS  = 98;
		var UNKONWN_ERR       = 99;
		// Base (offset) status codes
		var SYNC              = 100400;
		var SYNC_OK           = SYNC;
		var INSERT_RECS       = 100700;
		var READ_RECS         = 101000;
		var UPDATE_RECS       = 101100;

		var SYSTEM_TABLES = [
			'syncLib_system_data',
			'appSoup',
			'cacheSoup',
			'recsToSync',
			'SnapShot_Connection_Session__mc',
			//TMP lines for unit testing
			//'SnapShot_MC_Project__ap'
			];
		var PROTECTED_FIELDS = [
			'autonumber',
			'CreatedById',
			'CreatedDate',
			'IsDeleted',
			//'LastActivtyDate',
			'LastModifiedById',
			'LastModifiedDate',
			'LastReferencedDate',
			// TODO : 'LastViewedDate' - should this be local field that can be updated
			// explicitly (for 'recent items' type usage)
			//'LastViewedDate',
			'mobilecaddy1__MC_Proxy_ID',
			'MC_Proxy_ID',
			'OwnerId',
			'SystemModstamp',
			'Id'
			];

		var myNextReadRes = {};

		// Exposed functions
		module.exports = {
				// returnObject.status codes
				SYNC_OK : SYNC_OK,
				SYNC_ALREADY_IN_PROCESS : SYNC + SYNC_ALREADY_IN_PROCESS,
				SYNC_UNKONWN_TABLE: SYNC + UNKONWN_TABLE,
				INSERT_RECS_OK : INSERT_RECS,
				INSERT_RECS_UNKONWN_TABLE: INSERT_RECS + UNKONWN_TABLE,
				INSERT_RECS_UNKONWN_FIELD: INSERT_RECS + UNKONWN_FIELD,
				INSERT_RECS_ACCESS_DENIED: INSERT_RECS + ACCESS_DENIED,
				INSERT_RECS_MANDATORY_MISSING: INSERT_RECS + MANDATORY_MISSING,
				INSERT_RECS_DATATYPE_MISMATCH: INSERT_RECS + DATATYPE_MISMATCH,
				INSERT_RECS_PROTECTED_FIELD: INSERT_RECS + PROTECTED_FIELD,
				READ_RECS_OK: READ_RECS,
				READ_RECS_UNKONWN_TABLE: READ_RECS + UNKONWN_TABLE,
				READ_RECS_ACCESS_DENIED: READ_RECS + ACCESS_DENIED,
				UPDATE_RECS_OK: UPDATE_RECS,
				UPDATE_RECS_UNKONWN_TABLE: UPDATE_RECS + UNKONWN_TABLE,
				UPDATE_RECS_UNKONWN_FIELD: UPDATE_RECS + UNKONWN_FIELD,
				UPDATE_RECS_ACCESS_DENIED: UPDATE_RECS + ACCESS_DENIED,
				UPDATE_RECS_DATATYPE_MISMATCH: UPDATE_RECS + DATATYPE_MISMATCH,

				syncMobileTable : function(tableName,syncWithoutLocalUpdates) {
					// return readRecords(tableName,options);
					return new Promise(function(resolve, reject) {
            resolve([]);
          });
				},
				// getCurrentUserId: function(){
				// 	return getCurrentUserId();
				// },
				// insertRecord : function(tableName,rec) {
				// 	return insertRecords(tableName,[rec]);
				// },
				// insertRecords : function(tableName,recs) {
				// 	return insertRecords(tableName,recs);
				// },
				readRecords : function(tableName,options) {
					return new Promise(function(resolve, reject) {
            resolve(myNextReadRes[tableName]);
          });
				},
				setresponse : function(func, res, param){
					switch (func) {
						case 'readRecords':
							myNextReadRes[param] = res;
							return true;
					}
				}
				// updateRecord : function(tableName,rec, idField) {
				// 	return updateRecords(tableName,[rec], idField);
				// },
				// updateRecords : function(tableName,recs, idField) {
				// 	return updateRecords(tableName,recs, idField);
				// },
				// maybeReadTransformType : function(fieldVal,FromType,ToType) {
				// 	return maybeReadTransformType(fieldVal,FromType,ToType);
				// },
				// maybeWriteTransformType : function(fieldVal,FromType,ToType) {
				// 	return maybeWriteTransformType(fieldVal,FromType,ToType);
				// }
		}; // end export section
	}); // end devUtils

	// The mobileCaddy module becomes a global (and hence an entry point)
	window.mobileCaddy = require('mobileCaddy');
})();