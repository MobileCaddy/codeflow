var underscore = angular.module('underscore', []);
  underscore.factory('_', function() {
    return window._; // assumes underscore has already been loaded on the page
  });

angular.module('starter.services', ['underscore'])

/*
 * D A S H B O A R D
 */
.factory('DashService', function($rootScope, $http, $timeout){

  /**
   * Gets high level details about the app and it's state
   * @return {object} Basically the package.json
   */
  function getAppDetails(){
    console.debug("getAppDetails");
    return new Promise(function(resolve, reject) {
    var details = {};
    $timeout(function() {
        $http.get('../package.json').success(function(appConfig) {
          console.debug('appConfig', appConfig);
          appConfig.sf_app_vsn = appConfig.version.replace(/\./g, '');
          resolve(appConfig);
        }).catch(function(err){
          console.error(err);
        });
    }, 30);
    });
  }

  return {
    getAppDetails: function(){
      return getAppDetails();
    }
  };
})



/*
 * T A B L E S
 */
.factory('TableService', function($rootScope){
  function all() {
    return new Promise(function(resolve, reject) {
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
      resolve($rootScope.tableDefs);
    });
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
    return new Promise(function(resolve, reject) {
    resolve(JSON.parse(localStorage.getItem(tableName)));
    });
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
})


.factory('csService', [ function(){


  function forceQuery(soql){
    return new Promise(function(resolve, reject) {
      force.query(soql,
        function(response) {
          resolve(response);
        },
        function(e) {
          console.error("An error has occurred.", e);
          reject(e);
        }
      );
    });
  }

  function getLatest() {
    return new Promise(function(resolve, reject) {
      var sfNamespace =  sessionStorage.getItem('sfNamespace');
      csSobject   = sfNamespace + '__Connection_Session__c';
      csSessType  = sfNamespace + '__Session_Type__c';
      csTableName = sfNamespace + '__Mobile_Table_Name__c';
      csIFD       = sfNamespace + '__Insert_Failure_Duplication_Count__c';
      csIFM       = sfNamespace + '__Insert_Failure_Match_Failures_Count__c';
      csIF        = sfNamespace + '__Insert_Failures_Count__c';
      csIS        = sfNamespace + '__Insert_Successes_Count__c';
      csUFM       = sfNamespace + '__Update_Failure_Match_Failures_Count__c';
      csSDUF      = sfNamespace + '__Soft_Delete_Update_Count__c';
      csUF        = sfNamespace + '__Update_Failures_Count__c';
      csUS        = sfNamespace + '__Update_Successes_Count__c';
      latestCsName = sessionStorage.getItem('latestCsName');
      var q = "";
      if (latestCsName) {
        q = 'select Id, CreatedById, Name, ' + csSessType + ',' + csTableName + ',' + csIFD + ',' + csIFM + ',' + csIF + ',' + csIS + ',' + csSDUF + ',' + csUFM + ',' + csUF + ',' + csUS + ', LastModifiedDate from ' + csSobject + ' WHERE Name > \'' + latestCsName + '\' ORDER BY Name DESC LIMIT 5';
      } else {
        q = 'select Id, CreatedById, Name, ' + csSessType + ',' + csTableName + ',' + csIFD + ',' + csIFM + ',' + csIF + ',' + csIS + ',' + csSDUF + ',' + csUFM + ',' + csUF + ',' + csUS + ', LastModifiedDate from ' + csSobject + ' ORDER BY Name DESC LIMIT 5';
      }
      forceQuery(q).then(function(res){
        // console.debug('res', res);
        if ( res.totalSize > 0 ) {
          sessionStorage.setItem('latestCsName', res.records[0].Name);
          resolve(res.records);
        } else {
          resolve([]);
        }
      }).catch(function(e){
        console.error(e);
        reject(e);
      });
    });
  }

  function getOlder(oldest){
      return new Promise(function(resolve, reject) {
      var sfNamespace =  sessionStorage.getItem('sfNamespace');
      csSobject = sfNamespace + '__Connection_Session__c';
      csSessType = sfNamespace + '__Session_Type__c';
      csTableName = sfNamespace + '__Mobile_Table_Name__c';
      csIFD = sfNamespace + '__Insert_Failure_Duplication_Count__c';
      csIFM = sfNamespace + '__Insert_Failure_Match_Failures_Count__c';
      csIF = sfNamespace + '__Insert_Failures_Count__c';
      csIS = sfNamespace + '__Insert_Successes_Count__c';
      csUFM = sfNamespace + '__Update_Failure_Match_Failures_Count__c';
      csSDUF      = sfNamespace + '__Soft_Delete_Update_Count__c';
      csUF = sfNamespace + '__Update_Failures_Count__c';
      csUS = sfNamespace + '__Update_Successes_Count__c';
      var q = 'select Id, CreatedById, Name, ' + csSessType + ',' + csTableName + ',' + csIFD + ',' + csIFM + ',' + csIF + ',' + csIS + ',' + csSDUF + ',' + csUFM + ',' + csUF + ',' + csUS + ', LastModifiedDate from ' + csSobject + ' WHERE Name < \'' + oldest.Name + '\' ORDER BY Name DESC LIMIT 5';
      forceQuery(q).then(function(res){
        // console.debug('res', res);
        if ( res.totalSize > 0 ) {
          resolve(res.records);
        } else {
          resolve([]);
        }
      }).catch(function(e){
        console.error(e);
        reject(e);
      });
    });
  }

  return {
    getLatest: function(){
      return getLatest();
    },
    getOlder: function(oldest) {
      console.log('oldest', oldest);
      return getOlder(oldest);
    }
  };
}])


.factory('userService', [ function(){

  function getUser(id) {
    console.log('getUser', id);
    return new Promise(function(resolve, reject) {
      var userDetailsSS = sessionStorage.getItem(id);
      if (userDetailsSS) {
        resolve(JSON.parse(userDetailsSS));
      } else {
        force.request({path: '/services/data/v34.0/sobjects/User/' + id},
          function(response) {
            sessionStorage.setItem(id, JSON.stringify(response));
            resolve(response);
          }
        );
      }
    });
  }

  return {
    getUser: function(id){
      return getUser(id);
    }
  };
}]);