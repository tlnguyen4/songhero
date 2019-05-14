function Shape3D(mesh, note, dur) {
  this.mesh = mesh;
  this.note = note;
  this.duration = dur;

  this.draw = function() {

  }

  this.remove = function() {

  }

  this.click = function(event) {
    var synth = new Tone.Synth().toMaster();
    synth.triggerAttackRelease(this.note, this.duration);
  }
}
