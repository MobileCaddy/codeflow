angular.module('starter.controllers', [])


.controller('AppCtrl', function($scope, TableService) {
  var tables = TableService.all();
  $scope.tables = tables;
})

.controller('DashCtrl', function($scope) {

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
  var tableRecs = TableService.getRecords($stateParams.tableName);
  $scope.tableRecs = tableRecs;

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

 $scope.recGridOptions.data = tableRecs;
});
