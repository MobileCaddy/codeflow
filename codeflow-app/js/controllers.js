angular.module('starter.controllers', [])


.controller('AppCtrl', function($scope, TableService) {
  TableService.all().then(function(tables){
    $scope.tables = tables;
  });
})

.controller('DashCtrl', function($scope, $timeout, $ionicLoading, csService, userService, DashService) {
  var appName = "",
    appVsn = "",
    gitStatus ="",
    curUserName = "",
    instanceId = "",
    orgId = "";

  $scope.log = {};
  $scope.log.level = (localStorage.getItem('logLevel')) ? localStorage.getItem('logLevel') : "";
  console.debug('$scope.log.level', $scope.log.level);

  DashService.getAppDetails().then(function(appDetails){
    $scope.appName = appDetails.name;
    $scope.appDesc = appDetails.description;
    $scope.appVersion = appDetails.version;
    $scope.$apply();
  });


  function getMcNamespace() {
    return new Promise(function(resolve, reject) {
      force.request({path: '/services/data/v34.0/sobjects'},
        function(response) {
          var str = (JSON.stringify(response));
          //console.log(str);
          var re = /sobjects\/(.{1,30})MC_Object_002__c\"/i;
          var found = str.match(re);
          //console.log('found', found);
          resolve(found[1].replace("__", ""));
        },
        function(error) {
          console.error("An error has occurred. See console for details.");

        }
      );
    });
  }


  var isLoggedIn = force.isLoggedIn();
  console.log('isLoggedIn', isLoggedIn);
  if (!isLoggedIn) force.init({
      appId:CONNECTED_APP_ID,
      apiVersion:"v30.0",
      loginUrl:SF_LOGIN_URL,
      tokenStore:localStorage,
      oauthRedirectURL:"http://localhost:3030/oauthcallback.html",
      proxyURL:CORS_PROXY_URL
    });
  isLoggedIn = force.isLoggedIn();
  $scope.loggedIn = isLoggedIn;

  $scope.csFilter = "";
  $scope.usernameFilter =  {checked : false};

  // Conn-sess stuff
  if (isLoggedIn) {
    $scope.userId = force.getUserId();

    $scope.instanceUrl = JSON.parse(localStorage.getItem('forceOAuth')).instance_url;

    sessionStorage.removeItem('latestCsName');
    $scope.pollingLabel = "Start";
    $scope.pollingClass = "button-balanced";
    $scope.pollingStatus = 0;

    userService.getUser($scope.userId).then(function(response){
      $scope.usersName = response.Name;
      $scope.username = response.Username;
      $scope.$apply();
      return getMcNamespace();
    }).then(function(sfNamespace){
      sessionStorage.setItem('sfNamespace', sfNamespace);
      $scope.sfNamespace = sfNamespace;
      $scope.$apply();
      return userService.getUser($scope.userId);
    }).then(function(response){
        $scope.usersName = response.Name;
        $scope.username = response.Username;
        $scope.$apply();
    }).catch(function(e){
      console.error(e);
      $scope.usersName = "-";
      $scope.username = "-";
      $scope.$apply();
    });

    var formatCsRec = function(el){
      return new Promise(function(resolve, reject) {
        var iconClass = "";
        switch (el[$scope.sfNamespace + '__Session_Type__c']) {
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
        if (el[$scope.sfNamespace + '__Session_Type__c'] == "Sync - Update") {
          var totalFail = el[$scope.sfNamespace + '__Insert_Failure_Duplication_Count__c'] +
                          el[$scope.sfNamespace + '__Insert_Failure_Match_Failures_Count__c'] +
                          el[$scope.sfNamespace + '__Insert_Failures_Count__c'] +
                          el[$scope.sfNamespace + '__Update_Failure_Match_Failures_Count__c'] +
                          el[$scope.sfNamespace + '__Soft_Delete_Update_Count__c'] +
                          el[$scope.sfNamespace + '__Update_Failures_Count__c'];
          var totalSucc = el[$scope.sfNamespace + '__Insert_Successes_Count__c'] +
                          el[$scope.sfNamespace + '__Update_Successes_Count__c'] ;
          if (totalFail > 0) {
            el.rowClass = "fail";
          }
          el.totalFail = totalFail;
          el.totalSucc = totalSucc;
        }
        el.Mobile_Table_Name__c = el[$scope.sfNamespace + '__Mobile_Table_Name__c'];
        el.Session_Type__c = el[$scope.sfNamespace + '__Session_Type__c'];
        if (typeof(el.CreatedById) == "undefined") {
          // console.log("el CreatedById== undefined-> ", JSON.stringify(el));
          resolve(el);
        } else {
          userService.getUser(el.CreatedById).then(function(userRec){
            el.UsersName = userRec.Name;
            // console.log("el -> ", JSON.stringify(el));
            resolve(el);
          }).catch(function(e){
            console.error(e);
            resolve(el);
          });
        }
      });
    };

    $scope.csRecs = [];
    var poll = function() {
        if ($scope.csRecs.length > 0) $ionicLoading.hide();
        $timeout(function() {
            if ($scope.pollingStatus == 1) {
              csService.getLatest().then(function(res){
                //console.debug('res ', res);
                $ionicLoading.hide();
                if (res.length > 0) {
                  // res.forEach(function(el){
                  //   el2 = formatCsRec(el);
                  //   $scope.csRecs.unshift(el2);
                  // });

                  var sequence = Promise.resolve();
                  res.forEach(function(el){
                    sequence = sequence.then(function() {
                      return formatCsRec(el);
                    }).then(function(el2){
                      $scope.csRecs.unshift(el2);
                      $scope.$apply();
                    });
                  });
                }
              });
              poll();
            }
        }, 3000);
    };
    poll();

    $scope.togglePolling = function(){
      if ($scope.pollingStatus === 0 ){
        $ionicLoading.show({
          duration: 30000,
          delay : 400,
          maxWidth: 600,
          noBackdrop: true,
          template: '<h1>Loading...</h1><p id="app-progress-msg" class="item-icon-left">Fetching Connection Sessions...<ion-spinner/></p>'
        });
        poll();
        $scope.pollingStatus = 1;
        $scope.pollingLabel = "Stop";
        $scope.pollingClass = "button-assertive";
      } else  {
        $scope.pollingStatus = 0;
        $scope.pollingLabel = "Start";
        $scope.pollingClass = "button-balanced";
      }
    };

    $scope.loadOlder = function() {
      var tempList = _.sortBy($scope.csRecs, 'Name');
      var oldest = tempList[0];
      // console.log('oldest', oldest);
      csService.getOlder(oldest).then(function(res){
        var sequence = Promise.resolve();
        res.forEach(function(el){
          sequence = sequence.then(function() {
            return formatCsRec(el);
          }).then(function(el2){
            $scope.csRecs.unshift(el2);
            $scope.$apply();
          });
        });
      });
    };

    $scope.usernameFilterChange = function(){
      console.log("usernameFilterChange", $scope.usernameFilter.checked);
      if ($scope.usernameFilter.checked) {
        $scope.csFilter = $scope.usersName;
      } else {
        $scope.csFilter = "";
      }
    };
  } else {
    // Not Logged In
    $scope.pollingLabel = "Start";
  }


  /**
   * Scrubs localStorage tables
   * @param  {string} 'partial' | 'full'
   */
  $scope.scrub = function(type){
    var numTables = localStorage.length;
    for (var i = (numTables -1); i >= 0 ; i--) {
        var name = localStorage.key( i );
        if ( name != 'forceOAuth' ) {
            localStorage.removeItem(name);
        }
    }
    if (type == "full") localStorage.removeItem('forceOAuth');
    var win = window.open("http://localhost:3030/www/#/app/home",'myApp');
    win.location.reload();
  };

  /**
   * Sets the current loggin level in the app
   */
  $scope.logLevelChange = function(){
    console.debug('$scope.log.level', $scope.log.level);
    if (!$scope.log.level) {
      localStorage.removeItem('logLevel');
    } else {
      localStorage.setItem('logLevel', $scope.log.level);
    }
  };

})

.controller('TableCtrl', function($scope, $stateParams, TableService) {
  var table = TableService.getDef($stateParams.tableName);
  $scope.table = table;

  // fields grid
  var tableFields = TableService.getFields($stateParams.tableName);

  $scope.fieldGridOptions = {
    enableSorting: true,
    enableColumnMenus: false,
    enableFiltering: true
  };
  $scope.fieldGridOptions.data = tableFields;

  // records grid
  $scope.recGridOptions = {
    enableSorting: true,
    enableColumnMenus: false,
    enableFiltering: true
  };

  $scope.recGridOptions.columnDefs = _.map(tableFields, function(el){
    if (PROTECTED_FIELDS.indexOf(el.Name) < 0){
      return {
        field: el.Name,
        visible: true,
        minWidth: 150 };
    } else {
      return {
        field: el.Name,
        visible: false,
        minWidth: 150};
    }
  });
  TableService.getRecords($stateParams.tableName).then(function(tableRecs){
    $scope.tableRecs = tableRecs;
    $scope.recGridOptions.data = tableRecs;
    $scope.$apply();
  });

});
