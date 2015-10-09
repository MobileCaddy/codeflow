  var PROTECTED_FIELDS = [
    'autonumber',
    'CreatedById',
    'CreatedDate',
    'IsDeleted',
    'LastModifiedById',
    'LastModifiedDate',
    'LastReferencedDate',
    'mc_package_002__MC_Proxy_ID__c',
    'OwnerId',
    'SystemModstamp',
    'RecordTypeId',
    'Id'
  ];

angular.module('starter', ['ionic', 'ui.grid', 'ui.grid.resizeColumns',  'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
  })

  .state('app.table', {
    url: '/table/:tableName',
    views: {
      'menuContent': {
        templateUrl: 'templates/table.html',
        controller: 'TableCtrl'
      }
    }
  })

  .state('app.dashboard', {
    url: '/dashboard',
    views: {
      'menuContent': {
        templateUrl: 'templates/dashboard.html',
        controller: 'DashCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/dashboard');
});