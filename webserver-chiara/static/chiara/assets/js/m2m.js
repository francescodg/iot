
// function getAverageTemperature(callback) {
//     $.get('/temperature/average', callback);
// }

// function getTemperatureReadings(callback) {
//     var readings = Array()
//     for (var i = 0; i < 10; i++)
// 	readings[i] = Math.random() * 100
//     callback(readings)
// }

var app = angular.module('GreenHouseApp', []);

app.controller('GreenHouseController', function($scope) {
    $scope.hello = "Hello world, my dear";

    (function init() {
	m2m.getTemperatureReadings(function(readings) { $scope.readings = readings })
    })();	
});
