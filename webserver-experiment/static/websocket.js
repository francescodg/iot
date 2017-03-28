
$(document).ready(function(){		
    var socket = io.connect("http://127.0.0.1:5000");
    
    socket.on('new data', function(value) {
	console.log(value)
	// $('#subscribeTxt').val(logStr)
    });
		

    $('#startBtn').click(function() {
	$.get('http://127.0.0.1:5000/send')
    });
});
