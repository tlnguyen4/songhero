function Shape3D(mesh, song, dur, pos, scene) {
  this.mesh = mesh;
  this.song = song;
  this.duration = dur;
  this.pos = pos;
  this.scene = scene;

  this.draw = function() {

  }

  this.remove = function() {
    scene.remove(this.mesh);
  }

  this.click = function(event) {
    var synth = new Tone.Synth().toMaster();
    console.log(this)
    synth.triggerAttackRelease(this.song.notes[this.pos], this.duration);

    this.remove();
  }
}
