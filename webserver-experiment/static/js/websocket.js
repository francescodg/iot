var WEBSERVER = "http://127.0.0.1:5000";

app = angular.module("app", []);

app.controller("temperatureSensors", function($scope, $http) {
    $scope.temperatureSensors = new Object();
    $http.get(WEBSERVER + '/temperature/sensors', null)
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
	var socket = io.connect(WEBSERVER);
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

app.controller("temperatureGraph", function($scope, $http) {
    var graph = Morris.Line({
    	element: 'line-chart',	
    	data: new Array(),
    	xkey: 'y',
    	ykeys: ['a', 'b', 'c'],
    	labels: ['Total Income', 'Total Outcome'],
    	fillOpacity: 0.6,
    	hideHover: 'auto',
    	behaveLikeLine: true,
    	resize: true,
    	stacked: true,
    	pointFillColors:['#ffffff'],
    	pointStrokeColors: ['black'],
    	lineColors:['gray', 'gray', '#27C00A'],
	parseTime: false
    });

    function update() {
	$http.get(WEBSERVER + "/temperature/sensors/history")
	    .then(onNewData)
    }

    function onNewData(response) {
	var data = new Array();
	var entries = response.data;
	for (var e in entries)
	    data.push(
		{y: entries[e].time,
		 a: entries[e].value,
		 b: 10 - entries[e].value,
		 c: (entries[e].value + 10 - entries[e].value) / 2});
	console.log(data);
	graph.setData(data);
    };

    setInterval(function() { update() }, 2000);
});
