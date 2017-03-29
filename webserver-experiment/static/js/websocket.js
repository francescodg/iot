app = angular.module("app", []);

app.controller("temperatureSensors", function($scope, $http) {
    $scope.temperatureSensors = new Object();
    $http.get('http://127.0.0.1:5000/temperature/sensors', null)
	.then(function success(response) {
	    var sensors = response.data;
	    for (var s in sensors) {
		var id = sensors[s].id;
		var value = sensors[s].lastValue;
		$scope.temperatureSensors[id] = value.toFixed(1);
	    }
	    waitForEvent();
	});

    function waitForEvent() {
	var socket = io.connect("http://127.0.0.1:5000");
	socket.on('new temperature', onNewTemperature);
    }

    function onNewTemperature(data) {
	console.log(data)
	$scope.temperatureSensors[data.id] = data.value.toFixed(1);
	$scope.$apply();
    }

    $scope.getCriticalLevel = function(temperature) {
	if (temperature >= 10 && temperature <= 30)
	    return "temperature-ok";
	else if (temperature < 10)
	    return "temperature-warning";
	else if (temperature > 30)
	    return "temperature-critical";
    }
});
