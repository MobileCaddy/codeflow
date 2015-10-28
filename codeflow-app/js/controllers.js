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

  /*
    P O L L I N G
   */
  $scope.pollingStatus = 0;

  $scope.$on('togglePolling', function (event, data) {
    $scope.pollingStatus = data;
  });

  $scope.$on('$ionicView.enter', function(){
    console.debug('enter', $scope.pollingStatus);
    if ($scope.pollingStatus == 1){
      $scope.$broadcast('resumePolling');
    }
  });

  $scope.$on('$ionicView.beforeLeave', function(){
    console.debug('beforeLeave', $scope.pollingStatus);
    if ($scope.pollingStatus == 1){
      $scope.$broadcast('pausePolling');
    }
  });


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
    if ($scope.pollingStatus == 1) {
      if ($scope.csRecs.length > 0) $ionicLoading.hide();

      csService.getLatest().then(function(res){
        $ionicLoading.hide();
        if (res.length > 0) {
          res.forEach(function(el){
            $scope.csRecs.unshift(el);
          });
          // removed the digest as it caused issues in testing... seems to work
          //$scope.$digest();
        }
        $timeout(function() {poll();}, 3000, false);
      });
    } else {
      $timeout.cancel();
    }
  };

  $scope.togglePolling = function(){
    if ($scope.pollingStatus === 0 ){
      $ionicLoading.show({
        duration: 30000,
        delay : 400,
        maxWidth: 600,
        noBackdrop: true,
        template: '<h1>Loading...</h1><p id="app-progress-msg" class="item-icon-left">Fetching Connection Sessions...<ion-spinner/></p>'
      });
      $scope.pollingStatus = 1;
      $scope.pollingLabel = "Stop";
      $scope.pollingClass = "button-assertive";
      $scope.$emit('togglePolling', 1);
      poll();
    } else  {
      $scope.pollingStatus = 0;
      $scope.pollingLabel = "Start";
      $scope.pollingClass = "button-balanced";
      $scope.$emit('togglePolling', 0);
    }
  };

  /*
    Broadcast from parent - sets toggling when we enter/leave the page
   */
  $scope.$on('pausePolling', function (event, data) {
    console.log('pausePolling');
    $scope.pollingStatus = 0;
  });
  $scope.$on('resumePolling', function (event, data) {
    console.log('resumePolling');
    $scope.pollingStatus = 1;
    poll();
  });

  $scope.loadOlder = function() {
    var tempList = _.sortBy($scope.csRecs, 'Name');
    var oldest = tempList[0];
    // console.log('oldest', oldest);
    csService.getOlder(oldest).then(function(res){
      var sequence = Promise.resolve();
      res.forEach(function(el){
        $scope.csRecs.unshift(el);
        $scope.$digest();
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
