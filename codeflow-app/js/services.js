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

.factory('DeployService', function($rootScope, $q ,$http, $timeout){
    var apiVersionInt = 32;
    var apiVersion = "v" + 32 + ".0";

    return {
      checkVsn : checkVsn,

      getDetails : getDetails,

      deployBunlde : function(appConfig){
        return encodeAppBundle(appConfig).then(function(myBody, bundleFiles){
          return uploadAppBundle(appConfig, myBody);
        });
      },
      uploadCachePage : uploadCachePage,

      uploadStartPage : uploadStartPage,

      srDetails: function() {
        return encodeAppBundle().then(function(myBody){
          return uploadAppBundle(myBody);
        }).then(function(res){
          return uploadStartPage();
        });
      }
    };


    /**
     * checkVsn
     * @description Checks to see if the destination org has at least the min
     *              version on MobileCaddy installed
     * @param  {string} minMCPackVsn
     * @return {promise} Resolves if OK, rejects with object if fails
     */
    function checkVsn(minMCPackVsn) {
      return new Promise(function(resolve, reject) {
        var options = JSON.stringify({ "function":"versionInfo"});
        force.request(
          {
            method: 'POST',
            path:"/services/apexrest/mobilecaddy1/PlatformDevUtilsR001",
            contentType:"application/json",
            data:{startPageControllerVersion:'001', jsonParams:options}
          },
          function(response) {
            var respJson = JSON.parse(response);
            if (respJson.errorMessage == "success") {
              if ( respJson.packageVersion >= minMCPackVsn) {
                resolve();
              } else {
                reject({message : "Version of MobileCaddy on SFDC needs to be min version " + minMCPackVsn + ".\nCurrently running " + respJson.packageVersion + ".\nPlease upgrade.", type : "error"});
              }
            } else {
              if (respJson.errorNo == 48)
              {
                respJson.message = "Sorry, looks like you have not enabled a Remote Site on your destination org. Please see http://developer.mobilecaddy.net/docs/adding-remote-site/ for details";
                respJson.type = "error";
              } else {
                respJson.message = respJson.errorMessage;
                respJson.type = "error";
              }
              console.error(respJson);
              reject(respJson);
            }
          },
          function(error) {
            console.error(error);
            if (error[0].errorCode == "NOT_FOUND") {
              // we're likely running against an old package
              reject({message : "Version of MobileCaddy on SFDC needs to be min version " + minMCPackVsn + ".\nPlease upgrade.", type : "error"});
            } else {
              reject({message :'Deploy failed. See console for details.', type: 'error'});
            }
          }
        );
      });
    }


    function _arrayBufferToBase64( buffer ) {
      var binary = '';
      var bytes = new Uint8Array( buffer );
      var len = bytes.byteLength;
      for (var i = 0; i < len; i++) {
          binary += String.fromCharCode( bytes[ i ] );
      }
      return window.btoa( binary );
    }

    /**
     * Does the static resource already exist on the platform for this app/vsn
     */
    function doesBundleExist(appConfig){
      return new Promise(function(resolve, reject) {
      var dataName = appConfig.sf_app_name + '_' + appConfig.sf_app_vsn;
      // check if statid resource already exists
      force.request(
        {
          path: '/services/data/' + apiVersion + '/tooling/query/?q=select Id, Name, Description, LastModifiedDate from StaticResource WHERE Name=\'' + dataName + '\' LIMIT 1'
        },
        function(response) {
            console.debug('response' , response);
            resolve(response);
        },
        function(error) {
          console.error('Failed to check if app bundle already existed on platform');
          reject({message :"App bundle upload failed. See console for details.", type: 'error'});
        });
      });
    }

    /**
     * Does the static resource already exist on the platform for this app/vsn
     */
    function doesPageExist(pageName){
      return new Promise(function(resolve, reject) {
      // check if statid resource already exists
      force.request(
        {
          path: '/services/data/' + apiVersion + '/tooling/query/?q=select Id, Name, Description, LastModifiedDate from ApexPage WHERE Name=\'' + pageName + '\' LIMIT 1'
        },
        function(response) {
            console.debug('response' , response);
            resolve(response);
        },
        function(error) {
          console.error('Failed to check if page already existed on platform');
          reject({message :"Page upload failed. See console for details.", type: 'error'});
        });
      });
    }

    function getDetails () {
      return new Promise(function(resolve, reject) {
      var details = {};
      $timeout(function() {
          $http.get('../package.json').success(function(appConfig) {
            appConfig.sf_app_vsn = appConfig.version.replace(/\./g, '');
            resolve(appConfig);
          }).catch(function(err){
            console.error(err);
          });
      }, 30);
      });
    }

    function encodeAppBundle(appConfig){
      return new Promise(function(resolve, reject) {

        JSZipUtils.getBinaryContent('../' + appConfig.name + '-' + appConfig.version +'.zip', function(err, data) {
          if(err) {
            console.error(err);
            reject(err); // or handle err
          }
          var zipFileLoaded = new JSZip(data);
          $rootScope.deployFiles = zipFileLoaded.files;
          resolve(_arrayBufferToBase64(data));
        });
      });
    }

    function uploadAppBundle (appConfig, myBody) {
      return new Promise(function(resolve, reject) {
      var dataName = appConfig.sf_app_name + '_' + appConfig.sf_app_vsn;
      doesBundleExist(appConfig).then(function(response){
        if (response.records.length > 0) {
          // Update existing resource
          console.debug('resource exists... patching existing');
          var existingSR = response.records[0];
          force.request(
            {
              method: 'PATCH',
              contentType: 'application/json',
              path: '/services/data/' + apiVersion + '/tooling/sobjects/StaticResource/' + existingSR.Id + '/',
              data: {
                'Body':myBody
              }
            },
            function(response) {
                console.debug('response' , response);
                resolve('Existing app bundle updated');
            },
            function(error) {
              console.error('Failed to check if app bundle already existed on platform');
              reject({message :"App bundle upload failed. See console for details.", type: 'error'});
            }
          );
        } else {
          // Updload new resource
          force.request(
            {
              method: 'POST',
              contentType: 'application/json',
              path: '/services/data/' + apiVersion + '/tooling/sobjects/StaticResource/',
              data: {
                'Name': dataName,
                'Description' : 'App Bundle - auto-uploaded by MobileCaddy delopyment tooling',
                'ContentType':'application/zip',
                'Body':myBody,
                'CacheControl': 'Public'
              }
            },
            function(response) {
              console.debug('response' , response);
              resolve('App bundle uploaded');
            },
            function(error) {
              console.error(error);
              reject({message :"App bundle upload failed. See console for details.", type: 'error'});
            });
        }
      });
      });
    }

    function uploadCachePage(appConfig) {
      return new Promise(function(resolve, reject) {
        $timeout(function() {
          $http.get('../apex-templates/cachepage-template.apex').success(function(data) {
            var dataName = appConfig.sf_app_name + 'Cache_' + appConfig.sf_app_vsn;
            var cacheEntriesStr = '';
            _.each($rootScope.deployFiles, function(el){
              if (!el.dir) cacheEntriesStr += '{!URLFOR($Resource.' + appConfig.sf_app_name + '_' + appConfig.sf_app_vsn + ', \'' + el.name + '\')}\n';
            });
            var dataParsed = data.replace(/MC_UTILS_RESOURCE/g, appConfig.mc_utils_resource);
            dataParsed = dataParsed.replace(/MY_APP_FILE_LIST/g, cacheEntriesStr);
            delete $rootScope.deployFiles;

            var pageOptions = JSON.stringify({
              "function":"createApexPage",
              "pageApiName":dataName,
              "pageLabel":dataName,
              "pageContents":dataParsed,
              "apiVersion":apiVersionInt,
              "pageDescription":"MobileCaddy CachePage" });
            force.request(
              {
                method: 'POST',
                path:"/services/apexrest/mobilecaddy1/PlatformDevUtilsR001",
                contentType:"application/json",
                data:{startPageControllerVersion:'001', jsonParams:pageOptions}
              },
              function(response) {
                // we will get a response like this, is it fails
                // "{\"errorMessage\":\"Create Apex Page exception: Error occured processing component ShellAppCache_001. That page name is already in use, please choose a different one. (DUPLICATE_DEVELOPER_NAME). Fields Name.\",\"errorNo\":49}"
                var respJson = JSON.parse(response);
                if (respJson.errorMessage == "success") {
                  resolve('Cache manifest uploaded');
                } else {
                  respJson.message = respJson.errorMessage;
                  respJson.type = "error";
                  console.error(respJson);
                  reject(respJson);
                }
              },
              function(error) {
                console.error(error);
                reject({message :'Start page upload failed. See console for details.', type: 'error'});
              }
            );
          });
        }, 30);
      });
    }


    function uploadStartPage(appConfig) {
      return new Promise(function(resolve, reject) {
        $timeout(function() {
          $http.get('../apex-templates/startpage-template.apex').success(function(data) {
            var dataName = appConfig.sf_app_name + '_' + appConfig.sf_app_vsn;
            var dataParsed = data.replace(/MC_UTILS_RESOURCE/g, appConfig.mc_utils_resource);
            dataParsed = dataParsed.replace(/MY_APP_RESOURCE/g, appConfig.sf_app_name + '_' + appConfig.sf_app_vsn);
            dataParsed = dataParsed.replace(/MY_APP_CACHE_RESOURCE/g, appConfig.sf_app_name + 'Cache_' + appConfig.sf_app_vsn);


            var pageOptions = JSON.stringify({
              "function":"createApexPage",
              "pageApiName":dataName,
              "pageLabel":dataName,
              "pageContents":dataParsed,
              "apiVersion":apiVersionInt,
              "pageDescription":"MobileCaddy StartPage" });
            force.request(
              {
                method: 'POST',
                path:"/services/apexrest/mobilecaddy1/PlatformDevUtilsR001",
                contentType:"application/json",
                data:{startPageControllerVersion:'001', jsonParams:pageOptions}
              },
              function(response) {
                var respJson = JSON.parse(response);
                if (respJson.errorMessage == "success") {
                  resolve('Start page uploaded');
                } else {
                  respJson.message = respJson.errorMessage;
                  respJson.type = "error";
                  console.error(respJson);
                  reject(respJson);
                }
              },
              function(error) {
                console.error(error);
                reject({message :'Start page upload failed. See console for details.', type: 'error'});
              }
            );
          });
        }, 30);
      });
    }
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