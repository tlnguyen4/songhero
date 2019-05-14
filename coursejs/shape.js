function Shape(x, y, canvas, rad, color, song, pos, dur, shape) {
  this.x = x;
  this.y = y;
  this.canvas = canvas;
  this.radius = rad;
  this.color = color;
  this.song = song;
  this.pos = pos;
  this.duration = dur;
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

  this.click = function(event) {
    var c = document.getElementById(this.canvas);
    var canvasOffset = c.getBoundingClientRect();

    var eventX = event.pageX - canvasOffset.x;
    var eventY = event.pageY - canvasOffset.y;
    let remove = false;

    if (this.shape === 0) {
      let distance = Math.sqrt(Math.pow(eventX - this.x, 2) + Math.pow(eventY - this.y, 2));
      if (distance < this.radius) {
        remove = true;
      }
    }
    else if (this.shape === 1) {
      if (eventX >= this.x - (this.radius / 2) && eventX <= this.x + this.radius && eventY >= this.y - (this.radius / 2) && eventY <= this.y + this.radius) {
        remove = true;
      }
    }

    // check that the shape just clicked is the correct order
    const topShape = insshapes[0];
    // console.log("topShape: ", topShape);
    if (remove && topShape.color === this.color && topShape.shape === this.shape) {
      remove = true;
      insshapes.shift();
    }
    else {
      remove = false;
    }

    // Remove shape and check if we need to redraw on game canvas
    if (remove) {
      //create a synth and connect it to the master output (your speakers)
      var synth = new Tone.Synth().toMaster();
      synth.triggerAttackRelease(this.song.notes[this.pos], this.duration);

      // make disappear
      this.remove();

      this.pos = this.song.last;
      this.song.last = this.song.last + 1;      

      let shape;
      if (this.pos < this.song.notes.length) {
        const newColor = colors[colorIndex];
        colorIndex++;
        checkColorIndex();

        if (this.shape === 0 && newColor.shape === 1) {
          this.radius = 60;
        }
        if (this.shape === 1 && newColor.shape === 0) {
          this.radius = 40;
        }

        this.shape = newColor.shape;
        this.color = newColor.color;

        this.y = Math.random() * 500;
        this.y = Math.round(this.y);
        this.y = (this.y > 459) ? 459 : this.y;
        this.y = (this.y < 41) ? 41 : this.y;

        this.draw();

        // Add the new shape to instruction canvas shape list
        if (this.shape) {
          shape = new Shape(845, 25, "instructioncanvas", 30, this.color, undefined, undefined, undefined, this.shape);
        }
        else {
          shape = new Shape(845, 25, "instructioncanvas", 15, this.color, undefined, undefined, undefined, this.shape);
        }
        insshapes.push(shape);
      }

      // Redraw shapes on instruction canvas
      initInsCanvas();

      for (let i = 0; i < insshapes.length; i++) {
        insshapes[i].x = insshapes[i].x - 80;
        insshapes[i].draw();
      }
    }
  }
}
