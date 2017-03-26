function Shader() {
    var $ = this;
    $.status = 100;

    var window = new createjs.Bitmap("assets/window.png");
    $.shutters = new createjs.Bitmap("assets/shutter.png");

    $.shutters.x += 0.2; // Needed for graphics, do not change

    $.shutters.mask = new createjs.Shape()
    $.shutters.mask.graphics.drawRect(0, 0, window.image.width, window.image.height);

    $.container = new createjs.Container();
    $.container.addChild(window, $.shutters);

    $.container.scaleX = 1.2;
    $.container.scaleY = 1.2;
    
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

    $.button.scaleX = 0.3;
    $.button.scaleY = 0.3;

    // Green #27c00a
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

function HumidityPlant() {
    var $ = this;

    this.init = function(id) {
	$.stage = new createjs.Stage(id);
	$.stage.addChild(new createjs.Bitmap("assets/img/Serra_iot.png"))
	$.leds = [new Led(), new Led(), new Led(), new Led()]

	for (var led in $.leds)
	    initLed(led)

	$.leds[0].button.x = 350;
	$.leds[0].button.y = 120;
	$.leds[0].button.scaleX *= -1;
	
	$.leds[1].button.x = 639;
	$.leds[1].button.y = 120;

	$.leds[2].button.x = 350;
	$.leds[2].button.y = 330;
	$.leds[2].button.scaleX *= -1;

	$.leds[3].button.x = 639;
	$.leds[3].button.y = 330;
    }

    this.update = function() {
	for (var led in $.leds)
	    $.leds[led].update()
	$.stage.update()
    }

    function initLed(i) {
	var led = $.leds[i]
	$.stage.addChild(led.button)
	led.onClickListener(function() {
	    $.update()
	});
    }
}

function ShaderPlant(id) {
    var $ = this;

    $.stage = new createjs.Stage(id);
    $.stage.addChild(new createjs.Bitmap("assets/img/Serra_iot.png"))

    $.shaders = [new Shader(), new Shader()]

    $.shaders[0].container.x = 112;
    $.shaders[0].container.y = 134;

    $.shaders[1].container.x = 762;
    $.shaders[1].container.y = 134;

    $.stage.addChild($.shaders[0].container)
    $.stage.addChild($.shaders[1].container)
    
    $.shaders[0].setOpening(Math.random())
    $.shaders[1].setOpening(Math.random())

    this.update = function() {
	$.stage.update()
    }
}
