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
    var chart = _createGraph("chartContainer", "Temperature History");
    update();
    $interval(update, 10000);
    
    function update() {
    	$http.get(WEBSERVER + "/temperature/sensors/history")
    	    .then(onNewData)
    }

    function onNewData(response) {
	var sensors = response.data;

	chart.options.data = new Array();

	for (var s in sensors) {
	    var series;

	    if (sensors[s].id == "Temperature_Average") {
		series = _createSeries("green");
		series.name = "Average"
	    } else {
		series = _createSeries("grey");
		series.name = sensors[s].id;
	    }

	    for (var h in sensors[s].history) {
		var time =  parseInt(h);
		var value = sensors[s].history[h].value;	    
		series.dataPoints.push({x: time, y: value});
	    }
	    
	    chart.options.data.push(series);
	}

	chart.render();
    }
});

function _createGraph(container, title) {
    return new CanvasJS.Chart(container, {
	title: {
	    text: title,
	    fontSize: 30
	},
	axisX: {
	    gridColor: "silver",
	    tickColor: "silver"
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
}

function _createSeries(color) {
    return {
	type: "line",
	showInLegend: true,
	lineThickness: 2,
	markerType: "circle",
	color: color,
	dataPoints: new Array()
    };
}
