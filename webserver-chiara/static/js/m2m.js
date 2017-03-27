var m2m = {
    getTemperatureDataPlot: function(callback) {
	var data = [
	    {a: 1, b: 1, c: 4},
	    {a: 2, b: 2, c: 3},
	    {a: 3, b: 3, c: 2},
	    {a: 4, b: 4, c: 1}]
	callback(data)
    },

    getAverageTemperature: function(callback) {
	// $.get('/temperature/average', callback);
	var averageTemperature = 128;
	callback(averageTemperature)
    },

    getTemperatureReadings: function(callback) {
	var readings = Array()
	for (var i = 0; i < 10; i++)
	    readings[i] = Math.random() * 100
	callback(readings)
    }
}
