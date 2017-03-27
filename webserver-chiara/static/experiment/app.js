var app = angular.module('GreenHouseApp', []);

app.controller('GreenHouseController', function($scope) {
    $scope.hello = "Hello world, my dear";

    (function init() {
	m2m.getTemperatureReadings(function(readings) { $scope.readings = readings })
    })();	
});
