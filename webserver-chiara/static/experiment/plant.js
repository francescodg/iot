

function Led() {
    var $ = this;
    $.status = false;

    var offBitmap = new createjs.Bitmap("assets/off.png");
    var onBitmap = new createjs.Bitmap("assets/on.png");
    
    var data = {
	images: ["assets/off.png", "assets/on.png"],
	frames: {width: 100, height: 100},
	animations: {
	    off: 0,
	    on: 1
	}
    };

    var spriteSheet = new createjs.SpriteSheet(data);
    $.button = new createjs.Sprite(spriteSheet, "on")

    this.update = function() {
	if ($.status)
	    $.button.gotoAndStop("on")
	else
	    $.button.gotoAndStop("off")
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
	$.button.addEventListener("click", function(event) {
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

	for (var led in $.leds)
	    initLed(led)
    }

    this.update = function() {
	for (var led in $.leds)
	    $.leds[led].update()
	$.stage.update()
    }

    function initLed(i) {
	var led = $.leds[i]
	led.button.x = i * 200 + 100;
	led.button.y = 100;
	$.stage.addChild(led.button)
	led.onClickListener(function() {
	    $.update()
	});
    }
}
