var WEBSERVER = "http://127.0.0.1:5000";


app = angular.module("app", []);

app.service('datasource', function() {
    this.register = function(sensorType, $scope, $http) {
	$scope.sensors = new Object();
	$http.get(WEBSERVER + '/'+ sensorType + '/last', null)
	    .then(function success(response) {
		var sensors = response.data;
		for (var s in sensors) {
	    	    var id = sensors[s].id;
	    	    var value = parseFloat(sensors[s].lastValue);
	    	    $scope.sensors[id] = value;
		}
		var socket = io.connect(WEBSERVER);
		socket.on('new ' + sensorType, function(data){
		    console.log(data)
		    var value = parseFloat(data.value)
		    $scope.sensors[data.id] = value;
		    $scope.$apply();
		});
	    });	
    }

    this.clearHistory = function(sensorType, sensor, $http) {
	var uri = WEBSERVER + '/' + sensorType + '/history';
	$http.delete(uri, {params: {name: sensor}})
	    .then(function (){ console.log("Done delete")});
    }
});

app.service('graphsource', function() {
    var chart;
    var uri;
    var color;
    var average;
    var http;

    this.create = function(_chart, _uri, _average, _color, _http) {
	chart = _chart;
	uri = _uri;
	average = _average;
	color = _color;
	http = _http;
    }

    this.update = function() {
	http.get(WEBSERVER + uri).then(onNewData)
    }

    function onNewData(response) {
	console.log(response.data)
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
		if (sensors[s].id == average) {
		    series = _createSeries(color);
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

app.controller("temperatureSensors", function($scope, $http, datasource) {
    datasource.register('temperature', $scope, $http)

    $scope.getCriticalLevel = function(value) {
	if (value >= 10 && value <= 30)
	    return "value-ok";
	else if (value < 10)
	    return "value-warning";
	else if (value > 30)
	    return "value-critical";
    }
    
    $scope.deleteHistory = function(sensor) {
	datasource.clearHistory('temperature', sensor, $http)
    }
});

app.controller("humiditySensorCtrl", function($scope, $http, datasource) {
    
    datasource.register("humidity", $scope, $http)

    $scope.getCriticalLevel = function(value) {
	if (value >= 0.1 && value <= 0.6)
	    return "value-ok";
	else if (value < 0.1)
	    return "value-warning";
	else if (value > 0.6)
	    return "value-critical";
    }

    $scope.deleteHistory = function(sensor) {
	datasource.clearHistory('humidity', sensor, $http)
    }
});


app.controller("luminositySensorCtrl", function($scope, $http, datasource) {

    datasource.register("luminosity", $scope, $http)

    $scope.getCriticalLevel = function(value) {
    	if (value >= 0.1 && value <= 0.6)
    	    return "value-ok";
    	else if (value < 0.1)
    	    return "value-warning";
    	else if (value > 0.6)
    	    return "value-critical";
    }

    $scope.deleteHistory = function(sensor) {
	datasource.clearHistory('luminosity', sensor, $http)
    }
});


app.controller("temperatureGraph", function($http, $interval, graphsource) {
    var chart = _createGraph("chartContainer", 
			     "Temperature History",
			     function(){ chart.render(); });    
    graphsource.create(chart, "/temperature/history", "Temperature_Average", "green", $http);

    graphsource.update();
    $interval(graphsource.update, 10000);
});


app.controller("humidityGraph", function($http, $interval, graphsource) {
    var chart = _createGraph("chartContainer", 
			     "Humidity History",
			     function(){ chart.render(); });    
    graphsource.create(chart,
		       "/humidity/history", "Humidity_Average",
		       "blue", $http);
    graphsource.update();
    $interval(graphsource.update, 10000);
});


app.controller("luminosityGraph", function($http, $interval, graphsource) {
    var chart = _createGraph("chartContainer", 
			     "Luminosity History",
			     function(){ chart.render(); });    
    graphsource.create(chart, "/luminosity/history",
		       "Luminosity_Average", "orange", $http);
    graphsource.update();
    $interval(graphsource.update, 10000);
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
