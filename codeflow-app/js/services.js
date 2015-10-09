var underscore = angular.module('underscore', []);
  underscore.factory('_', function() {
    return window._; // assumes underscore has already been loaded on the page
  });

angular.module('starter.services', ['underscore'])

/*
 * handles network events (online/offline) and kicks off tasks if needed
 */
.factory('TableService', function($rootScope){
  function all() {
    if ( typeof($rootScope.syncLib_system_data) == "undefined") $rootScope.syncLib_system_data = JSON.parse(localStorage.getItem('syncLib_system_data'));
    if ( typeof($rootScope.tableDefs) == "undefined") {
      $rootScope.tableDefs =_.chain($rootScope.syncLib_system_data)
        .where({"MC_Var_String_001":"Platform Table Definition"})
        .map(function(el){
          el.Name = el.MC_Var_String_002;
          delete el.MC_Var_String_002;
          el.SyncType = el.MC_Var_String_004;
          delete el.MC_Var_String_004;
          el.CRUD = el.MC_Var_String_012;
          delete el.MC_Var_String_012;
          return el;
        })
        .sortBy('Name')
        .value();
    }
    console.log('$rootScope.tableDefs', $rootScope.tableDefs);
    return $rootScope.tableDefs;
  }


  function getDef(tableName) {
    return _.findWhere($rootScope.tableDefs, {Name: tableName});
  }

  function getFields(tableName) {
    var varName = "tableDef-" + tableName;
    var fields =[];
    if ( typeof($rootScope[varName]) == "undefined") {
      fields =_.chain($rootScope.syncLib_system_data)
        .where({"MC_Var_String_001":"Platform Table Column", "MC_Var_String_002": tableName})
        .map(function(el){
          myEl = {};
          myEl.Name = el.MC_Var_String_003;
          myEl.CRUD = el.MC_Var_String_006;
          myEl.isNillable = el.MC_Var_String_013;
          myEl.mobileColumnType = el.MC_Var_String_004;
          myEl.platformColumnType = el.MC_Var_String_005;
          myEl.protectedField = (PROTECTED_FIELDS.indexOf(myEl.Name) < 0) ? "false" : "true";
          return myEl;
        })
        //.sortBy('Name')
        .value();
    }
    console.log('fields', fields);
    return fields;
  }

  function getRecords(tableName) {
    return JSON.parse(localStorage.getItem(tableName));
  }

  return {
    all: function(){
      return all();
    },
    getDef: function(tableName){
      return getDef(tableName);
    },
    getFields: function(tableName){
      return getFields(tableName);
    },
    getRecords: function(tableName){
      return getRecords(tableName);
    }
  };
});