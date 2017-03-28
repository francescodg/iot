var $_scope;

$(document).ready(function(){		
    var socket = io.connect("http://127.0.0.1:5000");
    
    socket.on('new data', function(value) {
	console.log(value)
	// $('#subscribeTxt').val(logStr)
    });

    socket.on('new temperature', function(data) {
    	console.log(data);
    	
    	var map = new Array();
    	map["Temperature_Sensor_0"] = 0;
    	map["Temperature_Sensor_1"] = 1;
    	
    	var i = map[data.id];
    	var value = data.value;	
    	$_scope.system.temperatureSensors[i] = value;    	
    	$_scope.$apply();
    });

    socket.on('new average temperature', function(data) {
    	console.log(data)
	
    	$_scope.system.averageTemperature = data
    	
    	$_scope.$apply();
    });
		

    $('#startBtn').click(function() {
	$.get('http://127.0.0.1:5000/send')
    });
});

app = angular.module("app", [])
app.controller("appCtrl", function($scope) {
    $_scope = $scope
    $_scope.system = {
    	temperatureSensors: new Array(),
	averageTemperature: null
    }
})
