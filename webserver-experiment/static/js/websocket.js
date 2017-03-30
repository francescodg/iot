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

app.controller("temperatureGraph", function($scope, $http, $interval) {
    console.log("temperatureGraph()")

    var chart = new CanvasJS.Chart("chartContainer", {
	title: {
	    text: "Temperature History",
	    fontSize: 30
	},
	axisX: {
	    gridColor: "silver",
	    tickColor: "silver",
	    interval: 5
	},
	toolTip: {
	    shared: true
	},
	axisY: {
	    gridColor: "silver",
	    tickColor: "silver"
	},
	legend: {
	    cursor: "pointer",
	    itemclick: function (e) {
		if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible)
		    e.dataSeries.visible = false;
		else
		    e.dataSeries.visible = true;
		chart.render();
	    },
	},
	animationEnabled: true,
	data: new Array()
    });
    
    function update() {
    	$http.get(WEBSERVER + "/temperature/sensors/history")
    	    .then(onNewData)
    }

    function onNewData(response) {
	chart.options.data = new Array();

    	var collection = response.data;
	for (var s in collection) {
	    // Define series style
	    var series;
	    if (collection[s].id == "Temperature_Average") {
		series = {
		    type: "line",
		    showInLegend: true,
		    lineThickness: 2,
		    markerType: "circle",
		    color: "green",
		    name: "Average",
		    dataPoints: new Array()
		};
	    } else {
		series = {
		    type: "line",
		    showInLegend: true,
		    lineThickness: 2,
		    markerType: "circle",
		    color: "grey",
		    name: collection[s].id,
		    dataPoints: new Array()
		};
	    }

	    for (var h in collection[s].history) {
		var value = collection[s].history[h].value;	    
		series.dataPoints.push({x: parseInt(h), y: value});
	    }
	    
	    chart.options.data.push(series);
	}
	chart.render();
    }

    update();
    $interval(update, 10000);
});
