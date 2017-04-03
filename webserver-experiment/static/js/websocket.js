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
    var chart = _createGraph("chartContainer", "Temperature History", function(){ chart.render(); });
    
    update();
    $interval(update, 10000);
    
    function update() {
    	$http.get(WEBSERVER + "/temperature/history")
    	    .then(onNewData)
    }

    function onNewData(response) {
	console.log('temperatureGraph', response.data)

	// Sort sensors' id for cleaner legend 
	var sensors = response.data.sort(function(a, b){
	    if (a.id < b.id)
		return -1;
	    if (a.id > b.id)
		return 1;
	    else
		return 0;
	});

	for (var s in sensors) {
	    var series;	    
	    if (chart.options.data[s] == undefined) {
		if (sensors[s].id == "Temperature_Average") {
		    series = _createSeries("green");
		    series.name = "Average"
		} else {
		    series = _createSeries("grey");
		    series.name = sensors[s].id;
		}
		chart.options.data[s] = series;
	    } else {
		series = chart.options.data[s];
		series.dataPoints = new Array();
	    }

	    // Sort timestamp
	    var history = sensors[s].history.sort(function(a, b){
		if (a.time < b.time)
		    return -1;
		if (a.time > b.time)
		    return 1;
		else 
		    return 0;
	    });

	    for (var h in history) {
	    	var time =  parseInt(h);
	    	var value = parseFloat(sensors[s].history[h].value);
	    	series.dataPoints.push({x: time, y: value});
	    }
	}

	chart.render();
    }
});

function _createGraph(container, title, onItemClick) {
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
		onItemClick()
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

app.controller("overviewCtrl", function($scope, $http, $timeout){

    console.log("overviewCtrl")

    $http.get(WEBSERVER + '/overview')
	.then(function(response) {
	    $timeout(function(){
		_updateScope(response.data)
	    }, 0);
	    var socket = io.connect(WEBSERVER);
	    socket.on('new overview', function(data) {		
		$timeout(function(){
		    var overview = JSON.parse(data);
		    _updateScope(overview)
		}, 0);
	    });
    });

    function _updateScope(overview) {
	$scope.averageTemperature = overview.averageTemperature;
	$scope.averageHumidity = overview.averageHumidity;
	$scope.averageLuminosity = overview.averageLuminosity;
	$scope.boilerFuel = overview.boiler.fuel;
	$scope.boilerPressure = overview.boiler.pressure;
    }
});
