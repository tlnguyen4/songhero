function Shape(x, y, canvas, rad, color, shape) {
  this.x = x;
  this.y = y;
  this.canvas = canvas;
  this.radius = rad;
  this.color = color;
  this.shape = shape;

  this.draw = function() {
    var c = document.getElementById(this.canvas);
    var ctx = c.getContext("2d");
    ctx.beginPath();

    if (this.shape === 0) {
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    else if (this.shape === 1) {
      ctx.rect(this.x - (this.radius / 2), this.y - (this.radius / 2), this.radius, this.radius);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  this.remove = function() {
    var c = document.getElementById(this.canvas);
    var ctx = c.getContext("2d");
    ctx.beginPath();

    if (this.shape === 0) {
      ctx.arc(this.x, this.y, this.radius + 1, 0, 2 * Math.PI);
      ctx.fillStyle = "white";
      ctx.fill();
    }
    else if (this.shape === 1) {
      ctx.rect(this.x - (this.radius / 2), this.y - (this.radius / 2), this.radius, this.radius);
      ctx.fillStyle = "white";
      ctx.fill();
    }
  }
}
