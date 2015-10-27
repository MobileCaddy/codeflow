// S T O R E    S E R V I C E
describe('csService Unit Tests', function(){

  var mockForce,
      rawCsSessResponse = {};

  beforeEach(module('starter.services'));

  beforeEach(function() {
      mockForce = jasmine.createSpyObj('force', ['query']);

      module(function($provide) {
          $provide.value('force', mockForce);
      });
  });

  beforeEach(inject(function (_$rootScope_, _csService_, _force_) {
    csService = _csService_;
    $rootScope = _$rootScope_;
    force = mockForce;
    sessionStorage.setItem('sfNamespace', "123");

    rawCsSessResponse = {
      'totalSize' : 3,
      'records' : [{'Name' : "TMP-111"}, {'Name' : "TMP-222"}, {'Name' : "TMP-333"}]
    };

    mockForce.query.and.callFake(function(soql, success, error) {
        success(rawCsSessResponse);
    });

  }));

  /*
   csService.getLatest()
   */
  it('should fetch latest CS recs', function(done) {

    var testCsRecs = function(res) {
      console.log(res);
      expect(res.length).toBe(2);
      expect(res[0].Name).toBe("TMP-111");
      done();
    };

    csService.getLatest()
      .then(testCsRecs);
  });


});