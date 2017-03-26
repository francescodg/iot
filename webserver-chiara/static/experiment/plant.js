function Shader() {
    var $ = this;
    $.status = 100;

    var window = new createjs.Bitmap("assets/window.png");
    $.shutters = new createjs.Bitmap("assets/shutter.png");

    $.shutters.x += 1; // Needed for graphics, do not change

    $.shutters.mask = new createjs.Shape()
    $.shutters.mask.graphics.drawRect(0, 0, window.image.width, window.image.height);

    $.container = new createjs.Container();
    $.container.addChild(window, $.shutters);

    $.container.x = 200;
    $.container.y = 200;

    $.container.scaleX = 0.8;
    $.container.scaleY = 0.8;

    window.shadow = new createjs.Shadow("#000000", 0, 0, 10);

    this.setOpening = function(level) {
	$.shutters.y = level * (-window.image.height);
    }
}

function Led() {
    var $ = this;
    $.status = false;
    
    var data = {
	images: ["assets/water_off.png", "assets/water_on.png"],
	frames: {width: 360, height: 280},
	animations: {
	    off: 0,
	    on: 1
	}
    };

    $.button = new createjs.Sprite(new createjs.SpriteSheet(data), "on")

    $.button.scaleX = 0.4;
    $.button.scaleY = 0.4;

    $.button.shadow = new createjs.Shadow("#000000", 0, 0, 10);

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
	
	$.shader = new Shader()
	$.stage.addChild($.shader.container)
	
	shutters()
    }

    this.update = function() {
	for (var led in $.leds)
	    $.leds[led].update()
	$.stage.update()
    }

    this.setOpeningShaders = function(value) {
	$.shader.setOpening(value)
	console.log(value)
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

    function shutters() {
	$.shader.setOpening(0.8)
    }
}
