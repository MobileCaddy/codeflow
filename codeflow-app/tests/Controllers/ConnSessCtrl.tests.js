
var force = {
  isLoggedIn: function() {
    return true;
  }
};

describe('ConnSessCtrl', function(){
  var scope,
    controller,
    deferredGetLatest,
    deferredGetOlder,
    deferredGetUser,
    mockCsService,
    mockUserService;

  // load the controller's module
  beforeEach(module('starter.controllers'));

  beforeEach(inject(function($rootScope, $controller, $q) {
    deferredGetLatest = $q.defer();
    deferredGetOlder = $q.defer();
    deferredGetUser = $q.defer();
    mockCsService = {
      getLatest: jasmine.createSpy('getLatest spy')
                      .and.returnValue(deferredGetLatest.promise),
      getOlder: jasmine.createSpy('getOlder spy')
                      .and.returnValue(deferredGetOlder.promise),
    };
    mockUserervice = {
      getUser: jasmine.createSpy('getUser spy')
                      .and.returnValue(deferredGetUser.promise)
    };

    ionicLoadingMock = jasmine.createSpyObj('$ionicLoading spy', ['show', 'hide']);

    scope = $rootScope.$new();

    controller = $controller('ConnSessCtrl', {
      $scope: scope,
      $ionicLoading : ionicLoadingMock,
      'csService' : mockCsService,
      'userService' : mockUserService});
  }));


  describe('conn sess logged in', function() {
    localStorage.setItem('forceOAuth', JSON.stringify({'instance_url' : 'http://123.com'}));

    beforeEach(inject(function(_$rootScope_) {
      $rootScope = _$rootScope_;
    }));

    it('should have a correct initial state function', function() {
      expect(scope.pollingLabel).toEqual('Start');
      expect(scope.pollingStatus).toEqual(0);
      expect(scope.csRecs).toEqual([]);
    });
  });

  describe('conn sess toggle on', function() {

    beforeEach(inject(function(_$rootScope_) {
      $rootScope = _$rootScope_;
      scope.sfNamespace = "";
      scope.togglePolling();
    }));

    it('should have a correct initial state function', function() {
      expect(scope.pollingLabel).toEqual('Stop');
      expect(scope.pollingStatus).toEqual(1);
      expect(mockCsService.getLatest).toHaveBeenCalledWith();
    });

    it('should update the scope.csRecs', function(){
      var myServiceResp = [{"attributes":{"type":"mobilecaddy1__Connection_Session__c","url":"/services/data/v30.0/sobjects/mobilecaddy1__Connection_Session__c/a0A2400000HyTQIEA3"},"Id":"a0A2400000HyTQIEA3","CreatedById":"00524000000EnWoAAK","Name":"CNS-0000087","mobilecaddy1__Session_Type__c":"Sync - Update","mobilecaddy1__Mobile_Table_Name__c":"Connection_Session__mc","mobilecaddy1__Insert_Failure_Duplication_Count__c":0,"mobilecaddy1__Insert_Failure_Match_Failures_Count__c":0,"mobilecaddy1__Insert_Failures_Count__c":0,"mobilecaddy1__Insert_Successes_Count__c":0,"mobilecaddy1__Soft_Delete_Update_Count__c":0,"mobilecaddy1__Update_Failure_Match_Failures_Count__c":0,"mobilecaddy1__Update_Failures_Count__c":0,"mobilecaddy1__Update_Successes_Count__c":2,"LastModifiedDate":"2015-10-27T14:58:36.000+0000","SessionIconClass":"ion-ios-cloud-upload-outline","totalFail":0,"totalSucc":2,"Mobile_Table_Name__c":"Connection_Session__mc","Session_Type__c":"Sync - Update","UsersName":"Todd Halfpenny"}]
      deferredGetLatest.resolve(myServiceResp);
      $rootScope.$digest();
      expect(scope.csRecs[0].Name).toEqual("CNS-0000087");
    })

  });

});