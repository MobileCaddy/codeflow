describe('AppCtrl', function(){
  var scope,
    controller,
    deferredAll,
    mockTableService;

  // load the controller's module
  beforeEach(module('starter.controllers'));

  beforeEach(inject(function($rootScope, $controller, $q) {
    deferredAll = $q.defer();
    mockTableService = {
      all: jasmine.createSpy('all spy')
                      .and.returnValue(deferredAll.promise)
    };

    scope = $rootScope.$new();
    $controller('AppCtrl', {
      $scope: scope,
      'TableService' : mockTableService});
  }));

  describe('all tables', function() {
    beforeEach(inject(function(_$rootScope_) {
      $rootScope = _$rootScope_;
    }));

    it('should call all on TableService', function() {
      expect(mockTableService.all).toHaveBeenCalled();
    });

    it('should update the scope.tables', function(){
      deferredAll.resolve([{name: "table1"}]);
      $rootScope.$digest();
      expect(scope.tables[0].name).toEqual('table1');
    })
  });

});