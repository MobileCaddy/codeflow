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
  describe('getLatest no existing', function(){
    beforeEach(function() {
      sessionStorage.clear();
    });

    it('should fetch latest CS recs without filtering', function(done) {
      var testCsRecs = function(res) {
        expect(res.length).toBe(3);
        expect(res[0].Name).toBe("TMP-111");
        expect(JSON.parse(sessionStorage.getItem('TMP-111')).Name).toBe("TMP-111");
        done();
      };

      csService.getLatest()
        .then(testCsRecs);
    });

  }); // getLatest no existing


  describe('getLatest existing', function(){
    beforeEach(function() {
      sessionStorage.clear();
      sessionStorage.setItem('TMP-111', "MY TEST ENTRY");
    });

    it('should fetch latest CS recs and filter', function(done) {
      var testCsRecs = function(res) {
        expect(res.length).toBe(2);
        expect(res[0].Name).toBe("TMP-222");
        expect(sessionStorage.getItem('TMP-111')).toBe("MY TEST ENTRY");
        expect(JSON.parse(sessionStorage.getItem('TMP-222')).Name).toBe("TMP-222");
        done();
      };

      csService.getLatest()
        .then(testCsRecs);
    });
  }); // getLatest existing


});