
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

    xit('should have a correct initial state function', function() {
      expect(scope.pollingLabel).toEqual('Start');
      expect(scope.pollingStatus).toEqual(0);
      expect(scope.csRecs).toEqual([]);
    });
  });

  describe('conn sess toggle on', function() {

    beforeEach(inject(function(_$rootScope_, _$timeout_) {
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
      scope.sfNamespace = "";
      scope.togglePolling();
    }));

    xit('should have a correct initial state function', function(done) {
      expect(scope.pollingLabel).toEqual('Stop');
      expect(scope.pollingStatus).toEqual(1);
      $timeout.flush();
      expect(mockCsService.getLatest).toHaveBeenCalledWith();
      $timeout.flush();
      $rootScope.$digest();
      // TODO Not sure how to handle promises within the controller itself.
      // HMMMMMMMmmmmmmmmm.......
      // deferredGetLatest.resolve([{'a':1}]);
      // $timeout.flush();
      // //$rootScope.$digest();
      // expect(scope.csRecs).toEqual([1]);
      // expect(scope.myVal).toEqual([2]);

      deferredGetLatest.resolve([{'a':1}]);
      $rootScope.$apply();
      expect(scope.csRecs).toEqual([1]);
      expect(scope.myVal).toEqual([2]);
      done();
    });

  });

});