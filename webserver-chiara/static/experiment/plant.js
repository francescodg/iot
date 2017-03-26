
function Led() {
    var $ = this;
    $.status = false;
    $.shape = new createjs.Shape();

    this.update = function() {
	if ($.status)
	    color = "green"
	else
	    color = "red"
	$.shape.graphics.beginFill(color).drawCircle(0, 0, 20).endFill()
    }

    this.turnOn = function() {
	$.status = true;
    }

    this.turnOff = function() {
	$.status = false
    }

    this.toggle = function () {
	$.status = !$.status
    }

    this.onClickListener = function(callback) {
	$.shape.addEventListener("click", function(event) {
	    $.toggle()
	    callback()
	});
    }
}

function Plant() {
    var $ = this;

    this.init = function(id) {
	$.stage = new createjs.Stage(id);

	$.leds = [new Led(), new Led(), new Led()]

	for (var i = 0; i < $.leds.length; i++) {
	    // Init led
	    var led = $.leds[i]
	    led.shape.x = i * 50 + 100;
	    led.shape.y = 100;
	    $.stage.addChild(led.shape)
	    led.onClickListener(function() {
		$.update()
	    });
	}
    }

    this.update = function() {
	for (var led in $.leds)
	    $.leds[led].update()
	$.stage.update()
    }
}
