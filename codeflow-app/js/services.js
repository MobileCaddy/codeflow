var underscore = angular.module('underscore', []);
  underscore.factory('_', function() {
    return window._; // assumes underscore has already been loaded on the page
  });

angular.module('force', [])
  .factory('force', function() {
  return window.force;
});

angular.module('starter.services', ['underscore', 'force'])


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


  /**
   * Gets info about current GIT state by querying the .git dir
   * @return {object}
   */
  function getGitInfo(){
    console.debug("getGitInfo");
    return new Promise(function(resolve, reject) {
    var details = {};
    $timeout(function() {
        $http.get('../.git/COMMIT_EDITMSG').success(function(gitCommitMsg) {
          console.debug('gitCommitMsg', gitCommitMsg);
          resolve({'gitCommitMsg' : gitCommitMsg});
        }).catch(function(err){
          console.error(err);
        });
    }, 30);
    });
  }


  return {
    getAppDetails: function(){
      return getAppDetails();
    },
    getGitInfo: function(){
      return getGitInfo();
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


/*
 * C O N N    S E R S S I O N S
 */
.factory('csService', ['force', 'userService', function(force, userService){


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


  var formatCsRec = function(el){

    var sfNamespace =  sessionStorage.getItem('sfNamespace');
    return new Promise(function(resolve, reject) {

      var iconClass = "";
      switch (el[sfNamespace + '__Session_Type__c']) {
        case "Sync - Refresh" :
          iconClass = "ion-ios-cloud-download-outline";
          break;
        case "Sync - Update" :
          iconClass = "ion-ios-cloud-upload-outline";
          break;
        case "New Install":
          iconClass = "ion-ios-plus-outline";
          break;
        default :
          iconClass = "ion-oops";
          break;
      }
      el.SessionIconClass = iconClass;
      if (el[sfNamespace + '__Session_Type__c'] == "Sync - Update") {
        var totalFail = el[sfNamespace + '__Insert_Failure_Duplication_Count__c'] +
                        el[sfNamespace + '__Insert_Failure_Match_Failures_Count__c'] +
                        el[sfNamespace + '__Insert_Failures_Count__c'] +
                        el[sfNamespace + '__Update_Failure_Match_Failures_Count__c'] +
                        el[sfNamespace + '__Soft_Delete_Update_Count__c'] +
                        el[sfNamespace + '__Update_Failures_Count__c'];
        var totalSucc = el[sfNamespace + '__Insert_Successes_Count__c'] +
                        el[sfNamespace + '__Update_Successes_Count__c'] ;
        if (totalFail > 0) {
          el.rowClass = "fail";
        }
        el.totalFail = totalFail;
        el.totalSucc = totalSucc;
      }
      el.Mobile_Table_Name__c = el[sfNamespace + '__Mobile_Table_Name__c'];
      el.Session_Type__c = el[sfNamespace + '__Session_Type__c'];
      if (typeof(el.CreatedById) == "undefined") {
        resolve(el);
      } else {
        userService.getUser(el.CreatedById).then(function(userRec){
          el.UsersName = userRec.Name;
          resolve(el);
        }).catch(function(e){
          console.error(e);
          resolve(el);
        });
      }
    });
  };

  function filterAndStoreCS(recs) {
    var filteredCs = [];
    recs.forEach(function(el){
      if (sessionStorage.getItem(el.Name)) {
        console.debug('SFDC sent a duplicate', el.Name);
      } else {
        sessionStorage.setItem(el.Name, JSON.stringify(el));
        filteredCs.push(el);
      }
    });
    return filteredCs;
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
        if ( res.totalSize > 0 ) {
          sessionStorage.setItem('latestCsName', res.records[0].Name);
          return Promise.all(res.records.map(formatCsRec));
        } else {
          console.debug('no entries');
          return Promise.resolve([]);
        }
      }).then(function(res){
        resolve(filterAndStoreCS(res));
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
          return Promise.all(res.records.map(formatCsRec));
        } else {
          resolve([]);
        }
      }).then(function(res){
        resolve(filterAndStoreCS(res));
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