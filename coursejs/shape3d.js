function Shape3D(mesh, song, dur, pos, scene, isBox, color) {
  this.mesh = mesh;
  this.song = song;
  this.duration = dur;
  this.pos = pos;
  this.scene = scene;
  this.isBox = isBox;
  this.color = color;

  this.remove = function() {
    scene.remove(this.mesh);
  }

  this.click = function(event) {
    let remove = false;

    // check that the shape just clicked is the correct order
    const topShape = insshapes[0];

    if (topShape.color === this.color && topShape.shape === this.isBox) {
      remove = true;
      insshapes.shift();
    }
    else {
      remove = false;
      wrongShapeClicks++;
    }

    // Remove shape and check if we need to redraw on game canvas
    if (remove) {
      const x = this.mesh.position.x;
      //create a synth and connect it to the master output (your speakers)
      var synth = new Tone.Synth().toMaster();

      if (this.pos === this.song.notes.length - 1) {
        lastShape = true;
      }

      synth.triggerAttackRelease(this.song.notes[this.pos], "8n");

      // make disappear
      this.remove();

      this.pos = this.song.last;
      this.song.last = this.song.last + 1;

      if (this.pos < this.song.notes.length) {
        const newColor = colors[colorIndex];
        colorIndex++;
        checkColorIndex();

        this.isBox = newColor.shape;
        this.color = newColor.color;

        let y = Math.random() * 2 - 2;

        let geometry;
        if (this.isBox) {
          const side = 0.5 + Math.random() / 5;
          geometry = new THREE.BoxGeometry( side, side, side );
        }
        else {
          geometry = new THREE.SphereGeometry( 0.3 + Math.random() / 6, 10, 10 );
        }

        const colorrgb = getRGB(this.color);
        for (let i = 0; i < geometry.faces.length; i++) {
          geometry.faces[ i ].color.setRGB( colorrgb[0] + Math.random() * 0.1 , colorrgb[1] + Math.random() * 0.2, colorrgb[2] + Math.random() * 0.2 );
        }

        var mat = new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors });
        this.mesh = new THREE.Mesh( geometry, mat );
        this.mesh.position.set(x, y, 1);
        scene.add( this.mesh );

        // Update shape on instruction canvas
        if (this.pos < this.song.notes.length - 1) {
          let shape;
          if (colors[colorIndex].shape) {
            shape = new Shape(845, 25, "instructioncanvas", 30, colors[colorIndex].color, colors[colorIndex].shape);
          }
          else {
            shape = new Shape(845, 25, "instructioncanvas", 15, colors[colorIndex].color, colors[colorIndex].shape);
          }

          insshapes.push(shape);
        }
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
