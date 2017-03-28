var m2m = {
    getDataPlot: function () {
	return [
	    {a: 1, b: 1, c: 4},
	    {a: 2, b: 2, c: 3},
	    {a: 3, b: 3, c: 2},
	    {a: 4, b: 4, c: 1}]	
    }
}

function TemperatureGraph(element, data) {
    new Morris.Line({
	// ID of the element in which to draw the chart.
	element: element,
	// Chart data records -- each entry in this array corresponds to a point on the chart.
	data: data,
	// The name of the data record attribute that contains x-values.
	xkey: 'a',
	// A list of names of data record attributes that contain y-values.
	// ykeys: ['value'],
	ykeys: ['b', 'c'],
	labels: ["series 1", "series 2"],
	parseTime: false,
    });    
}
