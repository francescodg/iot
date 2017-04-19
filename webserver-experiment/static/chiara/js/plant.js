var assets;
var humidityPlant;
var shaderPlant;

function humidityPlantInit(callback) {
    var preload = new createjs.LoadQueue(true);
    preload.on("progress", function() {
	console.log("Loading Humidity Plant ...") 
    });
    preload.on("complete", function(event) {
	console.log("Humidity Plant Done."); 
	onHumidityPlantComplete(event.target, callback); 
    });
    preload.addEventListener("error", function() { 
	console.log("Error loading assets."); 
    });
    preload.loadManifest(["assets/img/Serra_iot.png", "assets/water_on.png", "assets/water_off.png"])
}

function shadingPlantInit(callback) {
    var preload = new createjs.LoadQueue(true);
    preload.on("progress", function() {
	console.log("Loading Shading Plant ...") 
    });
    preload.on("complete", function(event) {
	console.log("Done."); 
	onShadingPlantComplete(event.target, callback); 
    });
    preload.addEventListener("error", function(){ 
	console.log("Error loading assets."); 
    });
    preload.loadManifest(["assets/img/Serra_iot.png", "assets/window.png", "assets/shutter.png"])
}

function onHumidityPlantComplete(queue, callback) {
    assets = {
	"background": queue.getResult("assets/img/Serra_iot.png"),
	"water_on": queue.getResult("assets/water_on.png"),
	"water_off": queue.getResult("assets/water_off.png"),
    }
    humidityPlant = new HumidityPlant("humidityPlant")
    humidityPlant.init("humidityPlant")
    humidityPlant.update()
    callback();
}

function onShadingPlantComplete(queue, callback) {
    assets = {
	"background": queue.getResult("assets/img/Serra_iot.png"),
	"window": queue.getResult("assets/window.png"),
	"shutters": queue.getResult("assets/shutter.png")
    }    
    shaderPlant = new ShaderPlant("shaderPlant")
    shaderPlant.update()
    callback();
}

function Shader() {
    var $ = this;
    $.status = 100;

    var window = new createjs.Bitmap(assets.window);
    $.shutters = new createjs.Bitmap(assets.shutters);

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
	images: [assets.water_off, assets.water_on],
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
	    callback(event)
	});
    }
}

function HumidityPlant() {
    var $ = this;

    this.init = function(id) {
	$.stage = new createjs.Stage(id);
	$.stage.addChild(new createjs.Bitmap(assets.background))
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
    
    this.callback = null;

    function initLed(i) {
	var led = $.leds[i]
	$.stage.addChild(led.button)
	led.onClickListener(function(event) {
	    $.update()
	    if ($.callback)
		$.callback(i, led.status);
	});
    }

    this.setSprinkler = function (i, status) {
	var led = $.leds[i];
	led.status = status;
	$.update();
    }
}

function ShaderPlant(id) {
    var $ = this;

    $.stage = new createjs.Stage(id);
    $.stage.addChild(new createjs.Bitmap(assets.background))

    $.shaders = [new Shader(), new Shader()]

    $.shaders[0].container.x = 112;
    $.shaders[0].container.y = 134;

    $.shaders[1].container.x = 762;
    $.shaders[1].container.y = 134;

    $.stage.addChild($.shaders[0].container)
    $.stage.addChild($.shaders[1].container)
    
    this.update = function() {
	$.stage.update()
    }
}
