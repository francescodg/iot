var WEBSERVER = "http://127.0.0.1:5000";

app = angular.module("app", []);

app.service('socket', function() {
    console.log("Called socket")
    return io.connect(WEBSERVER);
});

app.service('datasource', ['socket', function(socket) {
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
}]);

app.service('graphsource', function() {
    var chart;
    var uri;
    var color;
    var average;
    var http;
    var averageSeries;
    var averageSensor;
    var avgMin = -1;
    var avgMax = 0;

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
		    averageSeries = series;
		    averageSensor = sensors[s];
		} else {
		    series = _createSeries("grey");
		    series.name = sensors[s].id;
		}
		chart.options.data[s] = series;
	    } else {
		if (sensors[s].id == average)
		    averageSensor = sensors[s]
		if (sensors[s].id != average) {
		    series = chart.options.data[s];
		    series.dataPoints = new Array();
		}
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
		if (series)
	    	    series.dataPoints.push({x: time, y: value});
	    }
	}

	chart.render();
	
	if (averageSeries) {
	    var value = averageSensor.history[0].value
	    console.log(value)
	    var newMin = chart.axisX[0].minimum
	    var newMax = chart.axisX[0].maximum
	    if (Math.abs(avgMin - newMin) > 0.5)
		avgMin = newMin
	    if (Math.abs(avgMax - newMax) > 0.5)
		avgMax = newMax
	    averageSeries.dataPoints = new Array()
	    averageSeries.dataPoints.push({x: avgMin, y: value});
	    averageSeries.dataPoints.push({x: avgMax, y: value});		 
	}

	chart.render();
    }
});

app.controller("temperatureSensors", function($scope, $http, datasource) {
    datasource.register('temperature', $scope, $http)   
    
    $scope.getCriticalLevel = function(value) {
	if (value >= 18 && value <= 26)
	    return "value-ok";
	else if (value >= -4 && value < 18 || value > 26 && value <= 32)
	    return "value-warning";
	else if (value < -4 || value > 32)
	    return "value-critical";
    }
    
    $scope.deleteHistory = function(sensor) {
	datasource.clearHistory('temperature', sensor, $http)
    }
});

app.controller("humiditySensorCtrl", function($scope, $http, datasource) {
    
    datasource.register("humidity", $scope, $http)
    $scope.getCriticalLevel = function(value) {
	if (value >= 40 && value <= 65)
	    return "value-ok";
	else if (value >= 20 && value < 40 || value > 65 && value <= 80)
	    return "value-warning";
	else if (value < 20 || value > 80)
	    return "value-critical";
    }

    $scope.deleteHistory = function(sensor) {
	datasource.clearHistory('humidity', sensor, $http)
    }
});


app.controller("luminositySensorCtrl", function($scope, $http, datasource) {
    datasource.register("luminosity", $scope, $http)

    $scope.getCriticalLevel = function(value) {
    	if (value >= 25 && value <= 35)
    	    return "value-ok";
    	else if (value >= 10 && value < 25 || value > 35 && value <= 55)
    	    return "value-warning";
    	else if (value < 10 || value > 55)
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

app.controller("overviewCtrl", function($scope, $http, $timeout, socket){

    console.log("overviewCtrl")

    $http.get(WEBSERVER + '/overview')
	.then(function(response) {
	    $timeout(function(){
		_updateScope(response.data)
	    }, 0);
	    socket.on('new overview', function(data) {		
		$timeout(function(){
		    var overview = JSON.parse(data);
		    _updateScope(overview)
		}, 0);
	    });
    });

    socket.on("new boiler state", function(data) {
	var pressure = parseFloat(data.pressure);
	var fuel = parseFloat(data.fuel);
	$timeout(function() {
	    $scope.boilerFuel = fuel.toFixed(2)
	    $scope.boilerPressure = pressure.toFixed(2)
	}, 0);
    });

    function _updateScope(overview) {
	$scope.averageTemperature = overview.averageTemperature
	    .toFixed(2)
	$scope.averageHumidity = overview.averageHumidity
	    .toFixed(2)
	$scope.averageLuminosity = overview.averageLuminosity
	    .toFixed(2)
    }
});


app.controller("heatingCtrl", function($scope, $http, socket, $timeout){
    var indicator;
    var boilerStatusIndicator;
    var boilerFuelIndicator;

    angular.element(function(){
	indicator = $('#averageTemperatureIndicator');
	indicator.industrial({low: 0, high: 40})
	boilerStatusIndicator = $("#boilerStatusIndicator");
	boilerPressureIndicator = $("#boilerPressureIndicator");
	boilerFuelIndicator = $("#boilerFuelIndicator");

	boilerPressureIndicator.industrial({low: 0, high: 40})
	boilerFuelIndicator.industrial({low: 0, high: 980})
	boilerStatusIndicator.industrial({})
    });

    $http.get(WEBSERVER + '/temperature/average')
	.then(function(response){
	    var value = response.data.average;	    
	    $scope.averageTemperature = value.toFixed(2);
	    if (indicator) 
	    	indicator.industrial(value);
	});

    socket.on('new boiler state', function(obj) {
	console.log('on new boiler state', obj)

	var pressure = obj.pressure;
	var fuel = obj.fuel;
	var status = obj.status;

	boilerStatusIndicator.industrial(status)
	boilerPressureIndicator.industrial(pressure)
	boilerFuelIndicator.industrial(fuel)

	$timeout(function() {
	    $scope.boilerPressure = pressure;
	    $scope.boilerFuel = fuel;
	}, 0);
	
    });

    socket.on('new temperature average', function(obj) {
	console.log('on new temperature average', obj.data)
	var value = parseFloat(obj.data);
	$timeout(function() {
	    $scope.averageTemperature = value.toFixed(2);
	}, 0);
	if (indicator) 
	    indicator.industrial(value);
    });

    var pressureBoiler = {
	min: -5,
	max: 36,
	unit: 'psi'
    }

    var fuelBoiler = {
	min: 0,
	max: 976,
	unit: 'liters'
    }

    $scope.setBoilerTemperature = function() {
	var value = $('#colorful').val();
	console.log('clicked', value)
	$http.post(WEBSERVER + "/boiler", value)
    }
    
});


app.controller("nebulizerCtrl", function($scope, $http, socket, $timeout){
    var indicator;

    angular.element(function(){
	plantInit(function() {
	    	humidityPlant.callback = function(id, status) {
		    var value = status ? 'on' : 'off';
		    $http.post(WEBSERVER + "/sprinkler?id=" + id, value)
		}
	})

	indicator = $('#averageHumidityIndicator');
	indicator.industrial({high: 85})

	// humidityPlant = new HumidityPlant()
	// humidityPlant.update()
    });

    $http.get(WEBSERVER + '/humidity/average')
	.then(function(response) {
	    var value = response.data.average
	    $scope.averageHumidity = value.toFixed(2);
	    if (indicator)
		indicator.industrial(value)
	});

    socket.on('new humidity average', function(obj) {	
	console.log('on new humidity average', obj.data)
	var value = parseFloat(obj.data);
	$timeout(function() {
	    $scope.averageHumidity = value.toFixed(2);
	}, 0);
	if (indicator) 
	    indicator.industrial(value);
    });
}); 

app.controller("shadingCtrl", function($scope, $http, socket, $timeout){
    var indicator;

    angular.element(function(){	
	indicator = $('#averageLuminosityIndicator');
	indicator.industrial({})
	$("#range-shader-1").asRange({					
	    step: 10,
	    range: false,
	    min: 0,
	    max: 100,
	    value: 0,
	    onChange: function(value) {
		onShaderChangeValue(1, value / 100.0);
		$http.post(WEBSERVER + '/shader?id=1', value)
	    }
	});
	
	$("#range-shader-0").asRange({
	    step: 10,
	    range: false,
	    min: 0,
	    max: 100,
	    value: 0,
	    onChange: function(value) {
		onShaderChangeValue(0, value / 100.0); 
		$http.post(WEBSERVER + '/shader?id=0', value)
	    }
	});	
    });

    $http.get(WEBSERVER + '/luminosity/average')
	.then(function(response) {
	    var value = response.data.average;
	    $scope.averageLuminosity = value.toFixed(2);
	    if (indicator)
		indicator.industrial(value)
	});

    socket.on('new luminosity average', function (obj) {
	console.log('on new luminosity average', obj.data)
	var value = parseFloat(obj.data);
	$timeout(function() {
	    $scope.averageLuminosity = value.toFixed(2);
	}, 0);
	if (indicator) 
	    indicator.industrial(value);
    });
}); 

app.controller("boilerCtrl", function($scope){
    var pressureBoiler = {
	min: -5,
	max: 36,
	unit: 'psi'
    }

    var fuelBoiler = {
	min: 0,
	max: 976,
	unit: 'liters'
    }

    var temperatureBoiler = {
	min: 10,
	max: 40
    }
});
