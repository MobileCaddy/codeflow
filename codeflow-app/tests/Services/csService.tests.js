
// S T O R E    S E R V I C E
describe('csService Unit Tests', function(){

  var mockForce;

  beforeEach(module('starter.services'));

  beforeEach(inject(function (_$rootScope_, _csService_, _force_) {
    // mockForce = {
    //   query: jasmine.createSpy('force spy')
    //                   .and.returnValue([])
    // };
    csService = _csService_;
    $rootScope = _$rootScope_;
    force = _force_;

    sessionStorage.setItem('sfNamespace', "123");


    // var devUtils = mobileCaddy.require('mobileCaddy/devUtils');
    // devUtils.setresponse('readRecords', {records: myStores}, 'Account__ap');

  }));

  /*
   csService.getLatest()
   */
  it('should fetch latest CS recs', function(done) {

    var testCsRecs = function(res) {
      console.log(res);
      expect(res).toBe("123");
      done();
    };

    csService.test()
      .then(testCsRecs);
  });

  xit('should call all on mockForce', function() {
      expect(mockForce.query).toHaveBeenCalled();
  });

});