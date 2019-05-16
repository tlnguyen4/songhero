"use strict";

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

var Main = Main;

let timerID = undefined;

let scene;
let camera;
let renderer;
let raycaster;
let mouse;

let counter = {"-4": true, "-3": false, "-2": true, "-1": false, "0": true, "1": false, "2": true, "3": false, "4": true};
const numberOfSongs = 6;
let wrongShapeClicks = 0;
let lastShape = false;
let shapes3D = [];
let insshapes = [];
let count = 0;
let currentSongIndex = 0;
let colorIndex = 0;
const colors = [{"color": "maroon", "shape": 0}, {"color": "maroon", "shape": 1}, {"color": "olive", "shape": 0}, {"color": "olive", "shape": 1}, {"color": "orange", "shape": 0}, {"color": "orange", "shape": 1}, {"color": "green", "shape": 0}, {"color": "green", "shape": 1}, {"color": "navy", "shape": 0}, {"color": "navy", "shape": 1}, {"color": "purple", "shape": 0}, {"color": "purple", "shape": 1}, {"color": "silver", "shape": 0}, {"color": "silver", "shape": 1}, {"color": "black", "shape": 0}, {"color": "black", "shape": 1}, {"color": "teal", "shape": 0}, {"color": "teal", "shape": 1}];
const xs = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

const names = ["Happy Birthday", "Twinkle Twinkle Little Star", "Jingle Bells", "London Bridge", "Jack and Jill", "Hot Cross Buns"];
const artists = ["Unknown", "Jane Taylor", "James Lord Pierpont", "Unknown", "Unknown", "Unknown"]
const notes = [["D4", "D4", "E4", "D4", "G4", "F#4", "D4", "D4",
    "E4", "D4", "A4", "G4", "D4", "D4", "d4", "B4", "G4", "F#4",
    "E4", "c4", "c4", "B4", "G4", "A4", "G4"],
                ["C4", "C4", "G4", "A4", "A4", "G4", "F4", "F4", "E4",
    "E4", "D4", "D4", "C4", "G4", "G4", "F4", "F4", "E4", "E4", "D4",
    "G4", "G4", "F4", "F4", "E4", "E4", "D4", "C4", "C4", "G4", "G4",
    "A4", "A4", "G4", "F4", "F4", "E4", "D4", "D4", "C4"],
                ["E4", "E4", "E4", "E4", "E4", "E4", "E4", "G4", "C4",
    "D4", "E4", "F4", "F4", "F4", "F4", "F4", "E4", "E4", "E4", "E4", "E4",
    "D4", "D4", "E4", "D4", "D4", "E4", "D4", "G4", "E4", "E4", "E4", "E4",
    "E4", "E4", "E4", "G4", "C4", "D4", "E4", "F4", "F4", "F4", "F4",
    "F4", "E4", "E4", "E4", "E4", "G4", "G4", "F4", "D4", "C4"],
    ["G4", "A4", "G4", "F4", "E4", "F4", "G4",
    "D4", "E4", "F4", "E4", "F4", "G4", "G4",
    "A4", "G4", "F4", "E4", "F4", "G4", "D4",
    "G4", "E4", "C4", "G4", "A4", "G4", "F4",
    "E4", "F4", "G4", "D4", "E4", "F4", "E4",
    "F4", "G4", "G4", "A4", "G4", "F4", "E4",
    "F4", "G4", "D4", "G4", "E4", "C4"],
    ["D4", "D4", "E4", "F4", "G4", "A4",
    "B4", "C4", "D4", "D4", "D4", "D4", "D4",
    "D4", "D4", "C4", "B4", "A4", "G4",
  "F4", "E4", "D4", "D4", "D4", "D4"],
["E4", "D4", "C4", "E4", "D4", "C4", "C4",
  "C4", "D4", "D4", "D4", "E4", "D4", "C4",
  "E4", "D4", "C4", "E4", "D4", "C4", "C4",
    "C4", "D4", "D4", "D4", "E4", "D4", "C4",
    "E4", "D4", "C4", "E4", "D4", "C4", "C4",
      "C4", "D4", "D4", "D4", "E4", "D4", "C4"]];


let songs = [];
for (let i = 0; i < numberOfSongs; i++) {
  let s = new Song(names[i], artists[i], notes[i]);
  songs.push(s);
}

shuffle(songs);

function getRGB(color) {
  switch(color) {
    case "maroon":
      return [0.5, 0, 0];
    case "orange":
      return [1, 0.65, 0];
    case "olive":
      return [0.5, 0.5, 0];
    case "green":
      return [0, 0.5, 0];
    case "navy":
      return [0, 0, 0.5];
    case "purple":
      return [0.5, 0, 0.5];
    case "black":
      return [0, 0, 0];
    case "silver":
      return [0.75, 0.75, 0.75];
    default:
      return [0, 0.5, 0.5];
  }
}

function initInsCanvas() {
  const c = document.getElementById("instructioncanvas");
  const ctx = c.getContext("2d");

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  ctx.fillStyle = 'rgb(255, 255, 255)';
  ctx.fillRect(0 , 0, window.innerWidth, window.innerHeight);

  c.addEventListener("click", onClick, false);
}

function onClick() {
  var c = document.getElementById("canvas");
  var canvasOffset = c.getBoundingClientRect();
  var eventX = event.pageX - canvasOffset.x;
  var eventY = event.pageY - canvasOffset.y;
  mouse.x = ( eventX / 800 ) * 2 - 1;
	mouse.y = - ( eventY / 500 ) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(scene.children);
   for( var i = 0; i < intersects.length; i++ ) {
    var intersection = intersects[ i ], obj = intersection.object;
     for (var j = 0; j < shapes3D.length; j++) {
       let shape3D = shapes3D[j];
       if (shape3D.mesh == obj) {
         shape3D.click();
       }
     }
   }

   if (lastShape) {
     var counter = 0;
     var interval = setInterval(function() {
       counter++;
     if (counter === 5 && lastShape === true) {
       clearInterval(interval);
       showGameOverModal()
     }
   }, 1000);
  }
}

function checkColorIndex() {
  if (colorIndex >= colors.length) {
    colorIndex = 0;
  }
}

function showGuessButtons() {
  document.getElementById("start").disabled = true;
  document.getElementById("guesstitle").style.display = "block";
  document.getElementById("choice1").style.display = "block";
  document.getElementById("choice2").style.display = "block";
  document.getElementById("choice3").style.display = "block";
  document.getElementById("choice4").style.display = "block";
  document.getElementById("choice5").style.display = "block";
  document.getElementById("choice6").style.display = "block";
}

function hideGuessButtons() {
  document.getElementById("start").disabled = true;
  document.getElementById("guesstitle").style.display = "none";
  document.getElementById("choice1").style.display = "none";
  document.getElementById("choice2").style.display = "none";
  document.getElementById("choice3").style.display = "none";
  document.getElementById("choice4").style.display = "none";
  document.getElementById("choice5").style.display = "none";
  document.getElementById("choice6").style.display = "none";
}

function populateGuess() {
  const fakeNames = [{"name": names[0], "artist": artists[0]}, {"name": names[1], "artist": artists[1]}, {"name": names[2], "artist": artists[2]}, {"name": names[3], "artist": artists[3]}, {"name": names[4], "artist": artists[4]}, {"name": names[5], "artist": artists[5]}];

  shuffle(fakeNames);

  for (let i = 0; i < fakeNames.length; i++) {
    const buttonName = "#choice" + (i + 1);
    $(buttonName).text(fakeNames[i].name + " by " + fakeNames[i].artist);
    $(buttonName).val(fakeNames[i].name + " by " + fakeNames[i].artist);
  }
}

//
function showGameOverModal() {
  $('#modaltitle').text("You failed!");
  $('#modalbody').text("You ran out of time. You have five seconds to choose the right song. Try again!");
  document.getElementById('modalscore').style.display = "none";
  document.getElementById('modalmiss').style.display = "none";
  document.getElementById('modaltotal').style.display = "none";
  $('#nextaction').text("Try again");
  (document.getElementById("nextaction")).setAttribute("class", "btn btn-dark");

  $('#modal').modal('toggle');

  document.getElementById('nextaction').addEventListener('click', function() {
    setUpGame(currentSongIndex);
  });
}

function checkAnswer(song) {
  clearInterval(timerID);

  let correctSong = songs[currentSongIndex];
  let correctSongName = correctSong.name + " by " + correctSong.artist;
  if (correctSongName === song) {
    document.getElementById('modalscore').style.display = "block";
    document.getElementById('modalmiss').style.display = "block";
    document.getElementById('modaltotal').style.display = "block";

    let time = parseFloat(document.getElementById('timer').innerHTML.split(":")[1]);
    let score = (100 - time) < 0 ? "0" : (100-time);
    $('#modaltitle').text("Congratulation!");
    $('#modalbody').text("Your time: " + time);
    $('#modalscore').text("Score: " + score);
    $('#modalmiss').text("Wrong shape clicks: " + wrongShapeClicks);
    $('#modaltotal').text("TOTAL: " + (score - wrongShapeClicks));
    $('#nextaction').text("Play next song");
    (document.getElementById("nextaction")).setAttribute("class", "btn btn-success");

    $('#modal').modal('toggle');

    currentSongIndex++;
    if (currentSongIndex >= numberOfSongs) {
      currentSongIndex = 0;
    }

    document.getElementById('nextaction').addEventListener('click', function() {
      setUpGame(currentSongIndex);
    });
  }
  else {
    $('#modaltitle').text("You failed!");
    $('#modalbody').text("You guessed the wrong song. Try again!");
    document.getElementById('modalscore').style.display = "none";
    document.getElementById('modalmiss').style.display = "none";
    document.getElementById('modaltotal').style.display = "none";
    $('#nextaction').text("Try again");
    (document.getElementById("nextaction")).setAttribute("class", "btn btn-dark");

    $('#modal').modal('toggle');

    document.getElementById('nextaction').addEventListener('click', function() {
      setUpGame(currentSongIndex);
    });
  }
}

function setUpGame(songIndex) {
  lastShape = false;
  scene.remove.apply(scene, scene.children);
  shapes3D = [];

  // Hide guess buttons
  hideGuessButtons();

  // Do 3..2..1.. count down before starting the game
  let inscanvas = document.getElementById("instructioncanvas");
  let ctx = inscanvas.getContext("2d");

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  ctx.font = "30px Arial";
  ctx.fillStyle = "red";
  ctx.fillText("3..", 310, 30);

  setTimeout(function() {
    ctx.fillText("2..", 345, 30);

    setTimeout(function() {
      ctx.fillText("1..", 375, 30);

      setTimeout(function() {
        ctx.fillStyle = "green";
        ctx.fillText("GO!!!", 410, 30);

        setTimeout(function() {
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
          startGame(songIndex);
          showGuessButtons();
          populateGuess();
        }, 1000);
      }, 1000);
    }, 1000);
  }, 1000);
}

function startGame(songIndex) {
  wrongShapeClicks = 0;
  insshapes = [];
  colorIndex = 0;
  shuffle(xs);
  shuffle(colors);
  shapes3D = [];
  scene.remove.apply(scene, scene.children);

  // draw shapes on main canvas
  for (var i = 0; i < xs.length; i++) {
    let y = Math.round(Math.random() * 3) - 2;

    let geometry;
    if (colors[i].shape) {
      const side = 0.5 + Math.random() / 5;
      geometry = new THREE.BoxGeometry( side, side, side );
    }
    else {
      geometry = new THREE.SphereGeometry( 0.3 + Math.random() / 6, 10, 10 );
    }

    const color = getRGB(colors[i].color);
    for (let i = 0; i < geometry.faces.length; i++) {
      geometry.faces[ i ].color.setRGB( color[0] + Math.random() * 0.1 , color[1] + Math.random() * 0.2, color[2] + Math.random() * 0.2 );
    }

    var mat = new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors });
    let shape = new THREE.Mesh( geometry, mat );
    shape.position.set(xs[i], y, 1);
    scene.add( shape );

    shapes3D.push(new Shape3D(shape, songs[songIndex], "8n", i, scene, colors[i].shape, colors[i].color));
  }
  songs[songIndex].last = xs.length;
  colorIndex = xs.length;
  checkColorIndex();

  // draw shapes on instruction canvas
  initInsCanvas();
  const xaxis = [45, 125, 205, 285, 365, 445, 525, 605, 685, 765];
  for (var i = 0; i < xaxis.length; i++) {
    let shape;
    // draw the square
    if (colors[i].shape) {
      shape = new Shape(xaxis[i], 25, "instructioncanvas", 30, colors[i].color, undefined, undefined, undefined, colors[i].shape);
    }
    else {
      shape = new Shape(xaxis[i], 25, "instructioncanvas", 15, colors[i].color, undefined, undefined, undefined, colors[i].shape);
    }

    insshapes.push(shape);
    shape.draw();
  }

  // Load up timer
  if (timerID !== undefined) {
    clearInterval(timerID);
  }

  const startTime = Date.now();

  timerID = setInterval(function() {
      var elapsedTime = Date.now() - startTime;
      document.getElementById("timer").innerHTML = "Timer: " + (elapsedTime / 1000).toFixed(3);
  }, 100);
}

function showInstructionsModal() {

}

window.onload = function() {
  document.getElementById("start").addEventListener("click", function() {
    setUpGame(currentSongIndex);
  });

  document.getElementById("instructions").addEventListener("click", function() {
    $('#modaltitle').text("How to Play");
    $('#modalbody').text("Play Song Hero by clicking on the different 3D shapes that pop up on the screen in the order at the top of the screen. Every time you click on a 3D shape in the right order, a piano note will play. The objective of the game is to correctly guess the name of the song from the list of six choices to the right of the screen as soon as possible. After clicking on all the 3D shapes and playing all the notes, you will have five seconds to guess the song correctly. If you guess the wrong song or fail to make a guess within five seconds, you will need to repeat the round until you correctly guess the song in under five seconds. Once you correctly guess the song, you can move on to the next round. Try to guess the songs as quickly as possible without clicking on the shapes out of order.");

    $('#nextaction').text("Close");
    (document.getElementById("nextaction")).setAttribute("class", "btn btn-dark");

    $('#modal').modal('toggle');
  });

  for (var i = 1; i <= 6; i++) {
    let id = "choice" + i;
    let button = document.getElementById(id);
    button.addEventListener("click", function() {
      checkAnswer(button.value);
    });
  }
  mouse = new THREE.Vector2();
  raycaster = new THREE.Raycaster();
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xffffff )
  camera = new THREE.PerspectiveCamera( 75, 810/500, 0.1, 1000 );

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(810, 500);
  let c = document.getElementById('canvas')
  c.appendChild(renderer.domElement);
  c.addEventListener("click", function() {
    onClick();
  });

  camera.position.z = 5;

  // Animate the shapes in the scene
  var animate = function () {
    requestAnimationFrame( animate );

    for (let i = 0; i < shapes3D.length; i++) {
      const currShape = shapes3D[i].mesh;
      const rand = (Math.random() + shapes3D[i].mesh.position.y) / 30;
      currShape.rotation.x += rand;
      currShape.rotation.y += rand;
      currShape.rotation.z += rand;

      if (counter["" + currShape.position.x]) {
        currShape.position.y += 0.01;
      }
      else {
        currShape.position.y -= 0.01;
      }

      if (currShape.position.y >= 2 || currShape.position.y <= -2) {
        counter["" + currShape.position.x] = !counter["" + currShape.position.x];
      }
    }

    renderer.render( scene, camera );
  };
  animate();
};
