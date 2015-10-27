angular.module('starter.controllers', [])


.controller('AppCtrl', function($scope, TableService) {
  TableService.all().then(function(tables){
    $scope.tables = tables;
  });
})

.controller('DashCtrl', function($scope, userService, DashService) {
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
    $scope.$digest();
    return DashService.getGitInfo();
  }).then(function(gitInfo){
    $scope.gitCommitMsg = gitInfo.gitCommitMsg;
    $scope.$digest();
  }).catch(function(e){
    console.error(e);
    $scope.gitCommitMsg = "-";
    $scope.$digest();
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

  $scope.usernameFilter =  {checked : false};

  if (isLoggedIn) {
    $scope.userId = force.getUserId();

    userService.getUser($scope.userId).then(function(response){
      $scope.usersName = response.Name;
      $scope.username = response.Username;
      $scope.$digest();
      return getMcNamespace();
    }).then(function(sfNamespace){
      sessionStorage.setItem('sfNamespace', sfNamespace);
      $scope.sfNamespace = sfNamespace;
      $scope.$digest();
      return userService.getUser($scope.userId);
    }).then(function(response){
        $scope.usersName = response.Name;
        $scope.username = response.Username;
        $scope.$digest();
    }).catch(function(e){
      console.error(e);
      $scope.usersName = "-";
      $scope.username = "-";
      $scope.$digest();
    });

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

.controller('ConnSessCtrl', function($scope, $timeout, $ionicLoading, csService, userService){

  $scope.csFilter = "";

  var isLoggedIn = force.isLoggedIn();
  if (isLoggedIn) {

    $scope.instanceUrl = JSON.parse(localStorage.getItem('forceOAuth')).instance_url;

    sessionStorage.removeItem('latestCsName');
    $scope.pollingLabel = "Start";
    $scope.pollingClass = "button-balanced";
    $scope.pollingStatus = 0;
  } else {
    // Not Logged In
    $scope.pollingLabel = "Start";
    $scope.pollingStatus = null;
  }


  $scope.csRecs = [];
  var poll = function() {
    $scope.myVal  = 0;
      if ($scope.csRecs.length > 0) $ionicLoading.hide();
      $timeout(function() {
          if ($scope.pollingStatus == 1) {
            csService.getLatest().then(function(res){
              //console.debug('res ', res);
              $ionicLoading.hide();
              if (res.length > 0) {
                $scope.myVal  = 9;
                var sequence = Promise.resolve();
                res.forEach(function(el){
                $scope.myVal  = 8;
                  var match = _.findWhere($scope.csRecs, {Name: el.Name});
                  if (!match) {
                    $scope.myVal  = 7;
                    sequence = sequence.then(function() {
                      $scope.myVal  = 6;
                      return formatCsRec(el);
                    }).then(function(el2){
                      $scope.myVal  = 5;
                      $scope.csRecs.unshift(el2);
                      $scope.$digest();
                    }).catch(function(e){
                      $scope.myVal  = 4;
                    });
                  } else {
                    console.debug('SF sent duplicate', el.Name);
                  }
                });
              }
            });
            poll();
          }
      }, 3000, false);
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
          $scope.$digest();
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
    $scope.$digest();
  });

});
