var $_scope;

app = angular.module("app", [])
app.controller("controller", function($scope) {

	console.log('Started controller, do stuff here')
	
	$_scope = $scope;
	$scope.status = true;
});

app.controller("controller2", function($scope) {
	
	console.log("Started controller2")
});
