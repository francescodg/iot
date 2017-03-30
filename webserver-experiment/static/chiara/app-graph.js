var data = [
	{
	    type: "line",
	    showInLegend: true,
	    lineThickness: 2,
	    name: "Visits",
	    markerType: "square",
	    color: "#F08080",
	    dataPoints: [
		{ x: new Date(2010, 0, 3), y: 650 },
		{ x: new Date(2010, 0, 5), y: 700 },
		{ x: new Date(2010, 0, 7), y: 710 },
		{ x: new Date(2010, 0, 9), y: 658 },
		{ x: new Date(2010, 0, 11), y: 734 },
		{ x: new Date(2010, 0, 13), y: 963 },
		{ x: new Date(2010, 0, 15), y: 847 },
		{ x: new Date(2010, 0, 17), y: 853 },
		{ x: new Date(2010, 0, 19), y: 869 },
		{ x: new Date(2010, 0, 21), y: 943 },
		{ x: new Date(2010, 0, 23), y: 970 }
	    ]
	},
	{
	    type: "line",
	    showInLegend: true,
	    name: "Unique Visits",
	    color: "#20B2AA",
	    lineThickness: 2,	    
	    dataPoints: [
		{ x: new Date(2010, 0, 3), y: 510 },
		{ x: new Date(2010, 0, 5), y: 560 },
		{ x: new Date(2010, 0, 7), y: 540 },
		{ x: new Date(2010, 0, 9), y: 558 },
		{ x: new Date(2010, 0, 11), y: 544 },
		{ x: new Date(2010, 0, 13), y: 693 },
		{ x: new Date(2010, 0, 15), y: 657 },
		{ x: new Date(2010, 0, 17), y: 663 },
		{ x: new Date(2010, 0, 19), y: 639 },
		{ x: new Date(2010, 0, 21), y: 673 },
		{ x: new Date(2010, 0, 23), y: 660 }
	    ]
	}
    ]

window.onload = function () {
    var chart = new CanvasJS.Chart("chartContainer", {
	title: {
	    text: "Hello world",
	    fontSize: 30
	},
	axisX: {
	    gridColor: "silver",
	    tickColor: "silver"
	    // valueFormatString: "DD/MMM"
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
	    itemclick: toggleSeries
	},
	animationEnabled: true,
	data: data
    });

    function toggleSeries(e) {
	if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible)
	    e.dataSeries.visible = false;
	else
	    e.dataSeries.visible = true;
	chart.render();
    }

    // chart.render();

    // chart.options.data = [{type: "line", showInLegend: true, dataPoints: [{x: 0, y: 0}, {x: 1, y: 1}]}];
    // chart.render();

    chart.options.data[0].dataPoints = [{x: new Date(2010, 0, 3), y: 200}, {x: new Date(2010, 0, 4), y: 120}]
    chart.options.data[1].dataPoints = [{x: new Date(2010, 0, 3), y: 150}, {x: new Date(2010, 0, 4), y: 120}]
    
    chart.render()
}
