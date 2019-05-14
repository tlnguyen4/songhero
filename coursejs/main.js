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

let sceneData;
let shapes = [];
let insshapes = [];
let count = 0;
let currentSongIndex = 0;
let colorIndex = 0;
const colors = [{"color": "black", "shape": 0}, {"color": "black", "shape": 1}, {"color": "cyan", "shape": 0}, {"color": "red", "shape": 0}, {"color": "red", "shape": 1}, {"color": "green", "shape": 0}, {"color": "green", "shape": 1}, {"color": "yellow", "shape": 0}, {"color": "yellow", "shape": 1}, {"color": "magenta", "shape": 0}, {"color": "magenta", "shape": 1}, {"color": "blue", "shape": 0}, {"color": "blue", "shape": 1}, {"color": "orange", "shape": 0}, {"color": "orange", "shape": 1}, {"color": "purple", "shape": 0}, {"color": "purple", "shape": 1}, {"color": "gray", "shape": 0}, {"color": "gray", "shape": 1}];
const xs = [40, 125, 205, 285, 365, 445, 525, 605, 685, 765];

const names = ["Happy Birthday", "Twinkle Twinkle Little Star", "Jingle Bells"];;
const artists = ["Unknown", "Jane Taylor", "James Lord Pierpont"]
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
    "F4", "E4", "E4", "E4", "E4", "G4", "G4", "F4", "D4", "C4"]];

let songs = [];
for (let i = 0; i < 3; i++) {
  let s = new Song(names[i], artists[i], notes[i]);
  songs.push(s);
}

shuffle(songs);

// function initCanvas() {
//     const c = document.getElementById("canvas");
//     const ctx = c.getContext("2d");

//     ctx.clearRect(0, 0, window.innerWidth,window.innerHeight);

//     ctx.fillStyle = 'rgb(255, 255, 255)';
//     ctx.fillRect(0,0,window.innerWidth,window.innerHeight);

//     c.addEventListener("click", onClick, false);
// }

function initScene() {
  Scene.sceneName = "default";
  Raytracer.init(500, 810, false, Scene.getIntersectFunction);
  Scene.setUniforms();

  const drawScene = function() {
    Raytracer.render(0);
    requestAnimationFrame(drawScene);
  };

  drawScene();
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
  for (var i = 0; i < shapes.length; i++) {
    let shape = shapes[i];
    shape.click(event);
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
  const fakeNames = [{"name": names[0], "artist": artists[0]}, {"name": names[1], "artist": artists[1]}, {"name": names[2], "artist": artists[2]}, {"name": "Baba Black Sheep", "artist": "Uknown"}, {"name": "Mary has a little lamp", "artist": "Buddy Guy"}, {"name": "Old McDonald has a farm", "artist": "Thomas d'Urley"}];

  shuffle(fakeNames);

  for (let i = 0; i < fakeNames.length; i++) {
    const buttonName = "#choice" + (i + 1);
    $(buttonName).text(fakeNames[i].name + " by " + fakeNames[i].artist);
    $(buttonName).val(fakeNames[i].name + " by " + fakeNames[i].artist);
  }
}

function checkAnswer(song) {
  clearInterval(timerID);

  let correctSong = songs[currentSongIndex];
  let correctSongName = correctSong.name + " by " + correctSong.artist;
  if (correctSongName === song) {
    document.getElementById('modalscore').style.display = "block";
    document.getElementById('modalmiss').style.display = "block";
    document.getElementById('modaltotal').style.display = "block";
    document.getElementById('leaderboard').style.display = "block";

    let time = parseFloat(document.getElementById('timer').innerHTML.split(":")[1]);
    $('#modaltitle').text("Congratulation!");
    $('#modalbody').text("Your time: " + time);
    $('#modalscore').text("Score: " + ((100 - time < 0 ? 0 : (100-time))));
    $('#nextaction').text("Play next song");
    (document.getElementById("nextaction")).setAttribute("class", "btn btn-success");

    $('#modal').modal('toggle');

    currentSongIndex++;
    if (currentSongIndex >= 3) {
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
    document.getElementById('leaderboard').style.display = "none";
    $('#nextaction').text("Try again");
    (document.getElementById("nextaction")).setAttribute("class", "btn btn-dark");

    $('#modal').modal('toggle');
    
    document.getElementById('nextaction').addEventListener('click', function() {
      setUpGame(currentSongIndex);
    });
  }
}

function setUpGame(songIndex) {
  // Hide guess buttons 
  hideGuessButtons();

  // Do 3..2..1.. count down before starting the game
  let canvas = document.getElementById("canvas");
  let inscanvas = document.getElementById("instructioncanvas");
  let ctx = inscanvas.getContext("2d");

  //ctx.clearRect(0, 0, canvas.width, canvas.height);
  inscanvas.getContext("2d").clearRect(0, 0, inscanvas.width, inscanvas.height);

  ctx.font = "30px Arial";
  ctx.fillStyle = "red";
  ctx.fillText("3", 380, 30);

  setTimeout(function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillText("2", 380, 30);

    setTimeout(function() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillText("1", 380, 30);

      setTimeout(function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "green";
        ctx.fillText("GO", 360, 30);
        setTimeout(function() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          startGame(songIndex);
          showGuessButtons();
          populateGuess();
        }, 1000);
      }, 1000);
    }, 1000);
  }, 1000);
}

function startGame(songIndex) {
  // initCanvas();

  insshapes = [];
  colorIndex = 0;
  shuffle(xs);
  shuffle(colors);

  // // draw shapes on main canvas
  // for (var i = 0; i < xs.length; i++) {
  //   let y = Math.random() * 500;
  //   y = Math.round(y);
  //   y = (y > 459) ? 459 : y;
  //   y = (y < 41) ? 41 : y;

  //   let shape;
  //   if (colors[i].shape) {
  //     shape = new Shape(xs[i], y, "canvas", 60, colors[i].color, songs[songIndex], i, "8n", colors[i].shape);
  //   }
  //   else {
  //     shape = new Shape(xs[i], y, "canvas", 40, colors[i].color, songs[songIndex], i, "8n", colors[i].shape);
  //   }

  //   shapes.push(shape);
  //   shape.draw();
  // }
  // songs[songIndex].last = xs.length;
  // colorIndex = xs.length;
  // checkColorIndex();

  sceneData = Parser.parseJson("scenes/default.json");

  let newObj = {
    "comment": "// the matt sphere",
    "type": "sphere",
    "center": [-20, -2, 15],
    "radius": 9,
    "material": {
        "color": [0.3, 0.4, 1]
    }
  };

  sceneData.objects.push(newObj);

  Scene.sceneName = "default";
  Raytracer.init(500, 810, false, Scene.getIntersectFunction);
  Scene.setUniforms();

  const drawScene = function() {
    Raytracer.render(0);
    requestAnimationFrame(drawScene);
  };

  drawScene();


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

window.onload = function() {
  document.getElementById("start").addEventListener("click", function() {
    setUpGame(currentSongIndex);
  });

  for (var i = 1; i <= 6; i++) {
    let id = "choice" + i;
    let button = document.getElementById(id);
    button.addEventListener("click", function() {
      checkAnswer(button.value);
    });
  }
};
