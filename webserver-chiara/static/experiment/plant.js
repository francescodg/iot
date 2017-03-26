
function Plant() {
    var $ = this;

    this.init = function(id) {
	$.stage = new createjs.Stage(id);
    }

    this.update = function() {
	$.stage.update()
    }

    this.showCircle = function() {
	for (var i = 0; i < 3; i++) {
	    var circle = new createjs.Shape();
	    var radious = 10;
	    drawCircle(circle, "blue", 50 * i + 100, 100, radious)
	    $.stage.addChild(circle)
	}
    }

    this.changeColor = function() {
	var list = $.stage.children
	console.log($.stage.children)
	var child = $.stage.children[0]
	drawCircle(child, "red", 50 + 100, 100, 10)
    }

    function drawCircle(circle, color, x, y, radious) {
	circle.graphics.beginFill(color).drawCircle(x, y, radious).endFill()
    }
}
