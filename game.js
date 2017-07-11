/* Das ist die game.js: Hier befinet sich sämtliches JavaScript für die Anwendung. */
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const CANVAS_CENTER = [CANVAS_WIDTH/2, CANVAS_HEIGHT/2];
const FPS = 60;
var debug = false;

var timeStamp = 0;
var timeStart;
var timeLvl = 0;
var active;
var finished;
var assets = [];

// gedrückte Tasten behandeln
var arrowLeft = false;
var arrowRight = false;
var arrowUp = false;

document.onkeydown = function (event) {
	switch (event.keyCode) {
		case 80: // P
			pauseGame();
			break;
		case 37: // Pfeil nach links
			arrowLeft = true;
			break;
		case 39: // Pfeil nach rechts
			arrowRight = true;
			break;
		case 38: // Pfeil nach oben
			arrowUp = true;
			break;
		case 112: // F1
			debug = !debug;
			break;
		default: 
			// tue nichts
	}
}

document.onkeyup = function (event) {
	switch (event.keyCode) {
		case 37: // Pfeil nach links
			arrowLeft = false;
			break;
		case 39: // Pfeil nach rechts
			arrowRight = false;
			break;
		case 38: // Pfeil nach oben
			arrowUp = false;
			break;
		default: 
			// tue nichts			
	}
}

// alternative Touch Eingabe
function registerTouchControls() {
	/* 
		Das ist in eine Funktion verpackt und wird bei window.onload 
		aufgerufen, da vorher der HTML DOM noch nicht geladen ist.
	*/
	var touchLeft = document.querySelector('.touch.left');
	var touchRight = document.querySelector('.touch.right');
	var touchJump = document.querySelector('.touch.jump');
	var touchPause = document.querySelector('.touch.pause');
	
	// im Menü sind die Elemente nicht vorhanden und es können keine Listener registriert werden
	if (touchLeft == null) {
		return;
	}

	touchLeft.addEventListener('touchstart', function () {
		arrowLeft = true;
	});
	touchRight.addEventListener('touchstart', function () {
		arrowRight = true;
	});
	touchJump.addEventListener('touchstart', function () {
		arrowUp = true;
	});
	touchPause.addEventListener('touchstart', function () {
		pauseGame();
	});
	
	touchLeft.addEventListener('touchend', function () {
		arrowLeft = false;
	});
	touchRight.addEventListener('touchend', function () {
		arrowRight = false;
	});
	touchJump.addEventListener('touchend', function () {
		arrowUp = false;
	});
}
	
//-------------------------------------------------
// Hauptfunktionen

// Rendering Loop
function gameLoop() {
	// diese Zeiterfassung wird für die Debug Infos benötigt
	var newtimeStamp = Date.now();
	var elapsedTime = newtimeStamp - timeStamp;
	timeStamp = newtimeStamp;
	
	// neuer Frame, falls Rendering Loop aktiv bleiben soll
	if(active) {
		requestAnimationFrame(gameLoop);
	}
	
	// Wolken aktualisieren
	for (var i in clouds) {
		clouds[i].move();
	}
	
	// Feinde aktualisieren
	for (var i in enemies) {
		enemies[i].move();
	}
	
	// Spieler aktualisieren
	player.move();
	//console.log(player);
	

	drawCanvas(active);
	if (debug) {
		drawFps(elapsedTime);
	}
}	

// Zeichenfunktion
function drawCanvas(active) {
	// Canvas löschen
	context.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
	
	// Hintergrund zeichnen
	background.draw();
	
	// Sonne zeichnen
	sun.draw();

	// Bergketten zeichnen
	for (var i in mountainRanges) {
		mountainRanges[i].draw();
	}
	
	// Wolken zeichnen
	for (var i in clouds) {
		clouds[i].draw();
	}
	
	// Büsche zeichnen
	for (var i in bushes) {
		bushes[i].draw();
	}
	
	// feste Objekte zeichnen
	for (var i in solidObjects) {
		solidObjects[i].draw();
	}
	
	// Einstiegspunkt zeichnen
	spawn.draw();
	
	// Zielpunkt zeichnen
	finish.draw();
	
	// Feind zeichnen
	for (var i in enemies) {
		enemies[i].draw();
	}
							
	// Spieler zeichnen
	player.draw();
	
	// Pause als letztes zeichnen - soll alles überlagern
	// zeichne Pause, falls pausiert
	if (!active) {
		drawPause();
	}
	
	// zeichne Infos, falls debug-Modus aktiviert
	if (debug) {
		context.save();
		context.fillStyle = 'black';
		context.fillText('player: '+player.position[0]+', '+player.position[1], 20, 60);
		context.fillText('timeStart: '+timeStart, 20, 90);
		context.fillText('currentTime: '+timeStamp, 20, 120);
		context.fillText('timeSpent: '+(timeStamp-timeStart), 20, 150);
		context.restore();
	}
}



// Mausposition loggen
/*function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
var positiondiv = canvas;	
canvas.addEventListener('mousemove', function(evt) {
    var mousePos = getMousePos(canvas, evt);
    var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
    console.log(message);
    positiondiv.innerHTML = message;
}, false);*/




//---------------------------------------------------
// Spielobjekte

// Spielfigur
function character(position=[0,0], velocity=[0,0], size=[10,10], animationState=0) {
	this.position = position;
	this.velocity = velocity;
	this.size = size;
	this.animationState = animationState;
	this.animationStateFrame = 0;
	this.canJump = function () {
		// alle soliden Objekte durchlaufen
		for (var i in solidObjects) {
			// befindet sich der Spieler mit x Koordinate über/auf einem soliden Objekt?
			if (this.position[0] > solidObjects[i].position[0] && this.position[0] < solidObjects[i].position[0]+solidObjects[i].size[0] && (this.position[1] + this.size[1]) >= solidObjects[i].position[1] && this.position[1] <= solidObjects[i].position[1] + solidObjects[i].size[1]) {
				return true;	
			}
		}
		return false;
	}
	this.move = function () {
		// auf Erreichen des Ziels prüfen
		if(this.position[0] > finish.position[0]) {
			this.animationState = 0;
			arrowLeft = false;
			arrowRight = false;
			arrowUp = false;
			// Ziel erreicht, die Zeit wird geschrieben und finished gesetzt, sodass die Zeit nicht im nächsten Frame erneut geschrieben wird.
			if (!finished) {
				timeLvl += Date.now() - timeStart;
				console.log("Level finished. Time: "+timeLvl);
				lvlFinished(timeLvl);
				finished = true;
			}
		}
		
		// Bewegung starten
		if (arrowRight) {
			this.velocity[0] = PLAYER_RUNNING_VELOCITY;
		} else if (arrowLeft) {
			this.velocity[0] = -PLAYER_RUNNING_VELOCITY;
		} else {
			this.velocity[0] = 0;
		}
		if (arrowUp && this.canJump()) {
			sourceJump.start(0);
			sourceJump = audioCtx.createBufferSource();
			sourceJump.buffer = bufferedSounds['soundJump'];
			sourceJump.connect(gainSFX);
			
			this.velocity[1] = -PLAYER_JUMPING_VELOCITY;
			arrowUp = false;
			this.animationState = 1 + this.velocity[0];
		} else if (this.canJump()) {
			this.animationState = this.velocity[0];
		}

		// Schwerkraft hinzufügen
		this.velocity[1] += GRAVITY;
		
		// Vertikale Kollision
		for (var i in solidObjects) {
			// befindet sich der Spieler mit x Koordinate über/auf einem soliden Objekt?
			if (this.position[0] > solidObjects[i].position[0] && this.position[0] < solidObjects[i].position[0]+solidObjects[i].size[0]) {
				groundCollision(this, solidObjects[i]);
			}
		}
		
		// Horizontale Kollision
		for (var i in solidObjects) {
			// Spieler betritt Objekt von links
			if ((this.position[0]+(this.size[0]/2)) > solidObjects[i].position[0] && this.position[0] < solidObjects[i].position[0]+solidObjects[i].size[0] && this.velocity[0] > 0) {
				// Spieler ist auf Höhe des Objekts
				if (this.position[1]+this.size[1]*0.8 > solidObjects[i].position[1] && this.position[1] < solidObjects[i].position[1]+solidObjects[i].size[1]) {
					this.velocity[0] = 0;
				}
			}
			// Spieler betritt Objekt von rechts
			if (this.position[0] > solidObjects[i].position[0] && (this.position[0]-(this.size[0]/2)) < solidObjects[i].position[0]+solidObjects[i].size[0] && this.velocity[0] < 0) {
				// Spieler ist auf Höhe des Objekts
				if (this.position[1]+this.size[1]*0.8 > solidObjects[i].position[1] && this.position[1] < solidObjects[i].position[1]+solidObjects[i].size[1]) {
					this.velocity[0] = 0;
				}
			}
		}
		
		// prüfen, ob der Spieler einen Feind berührt hat
		for (var i in enemies) {
			// Spieler befindet sich auf Höhe eines Feindes (X-Achse)
			if (this.position[0]+(this.size[0]/2) > enemies[i].position[0]-(enemies[i].size[0]/2) && this.position[0]-(this.size[0]/2) < enemies[i].position[0]+(enemies[i].size[0]/2)) {
				// Spieler befindet sich auch auf Ebene des Feindes (Y-Achse)
				if (this.position[1]+(this.size[1]/2) > enemies[i].position[1]-(enemies[i].size[1]/2) && this.position[1]-(this.size[1]/2) < enemies[i].position[1]+(enemies[i].size[1]/2)) {
					sourceDeath.start(audioCtx.currentTime, 1.5);
					sourceDeath = audioCtx.createBufferSource();
					sourceDeath.buffer = bufferedSounds['soundDeath'];
					sourceDeath.connect(gainSFX);
					
					this.velocity = [0, 0];
					this.position[0] = spawn.position[0];
					this.position[1] = spawn.position[1];
				}
			}
		}
		
		// prüfen, ob der Spieler in den Abgrund gestürtzt ist
		if (this.position[1] > GLOBAL_ABYSS) {
			sourceDeath.start(audioCtx.currentTime, 1.5);
			sourceDeath = audioCtx.createBufferSource();
			sourceDeath.buffer = bufferedSounds['soundDeath'];
			sourceDeath.connect(gainSFX);
			
			this.velocity = [0, 0];
			this.position[0] = spawn.position[0];
			this.position[1] = spawn.position[1];
		}
		
		updatePosition(this);
	}
	this.draw = function () {
		context.save();
		context.translate(CANVAS_CENTER[0], 0);
		//context.fillRect(0-(this.size[0]/2), GLOBAL_GROUND-((GLOBAL_GROUND-this.position[1])/2), this.size[0], this.size[1]);
		switch (this.animationState) {
			case 1-PLAYER_RUNNING_VELOCITY: // nach links springen
				context.drawImage(imgHero, 16, 44, 16, 22, 0-(this.size[0]/2), GLOBAL_GROUND-((GLOBAL_GROUND-this.position[1])/2), this.size[0], this.size[1]);
				break;
			case 1+PLAYER_RUNNING_VELOCITY: // nach rechts springen
				context.drawImage(imgHero, 0, 44, 16, 22, 0-(this.size[0]/2), GLOBAL_GROUND-((GLOBAL_GROUND-this.position[1])/2), this.size[0], this.size[1]);
				break;
			case 1: // gerade springen
				context.drawImage(imgHero, 32, 44, 16, 22, 0-(this.size[0]/2), GLOBAL_GROUND-((GLOBAL_GROUND-this.position[1])/2), this.size[0], this.size[1]);
				break;
			case -PLAYER_RUNNING_VELOCITY: // nach links laufen
				switch (Math.floor(this.animationStateFrame)) {
					case 0:
						context.drawImage(imgHero, 128, 22, 14, 22, 0-(this.size[0]/2), GLOBAL_GROUND-((GLOBAL_GROUND-this.position[1])/2), this.size[0], this.size[1]);
						this.animationStateFrame += 0.15;
						break;
					case 1:
						context.drawImage(imgHero, 112, 22, 14, 22, 0-(this.size[0]/2), GLOBAL_GROUND-((GLOBAL_GROUND-this.position[1])/2), this.size[0], this.size[1]);
						this.animationStateFrame += 0.15;
						break;
					case 2:	
						context.drawImage(imgHero, 96, 22, 14, 22, 0-(this.size[0]/2), GLOBAL_GROUND-((GLOBAL_GROUND-this.position[1])/2), this.size[0], this.size[1]);
						this.animationStateFrame += 0.15;
						break;
					case 3:
						context.drawImage(imgHero, 80, 22, 14, 22, 0-(this.size[0]/2), GLOBAL_GROUND-((GLOBAL_GROUND-this.position[1])/2), this.size[0], this.size[1]);
						this.animationStateFrame += 0.15;
						break;
					case 4:	
						context.drawImage(imgHero, 64, 22, 14, 22, 0-(this.size[0]/2), GLOBAL_GROUND-((GLOBAL_GROUND-this.position[1])/2), this.size[0], this.size[1]);
						this.animationStateFrame += 0.15;
						break;
					case 5:	
						context.drawImage(imgHero, 48, 22, 14, 22, 0-(this.size[0]/2), GLOBAL_GROUND-((GLOBAL_GROUND-this.position[1])/2), this.size[0], this.size[1]);
						this.animationStateFrame += 0.15;
						break;
					default:
						context.drawImage(imgHero, 48, 22, 14, 22, 0-(this.size[0]/2), GLOBAL_GROUND-((GLOBAL_GROUND-this.position[1])/2), this.size[0], this.size[1]);
						this.animationStateFrame = 0;				
				}	
				break;				
			case PLAYER_RUNNING_VELOCITY: // nach rechts laufen
				switch (Math.floor(this.animationStateFrame)) {
					case 0:
						context.drawImage(imgHero, 0, 0, 14, 22, 0-(this.size[0]/2), GLOBAL_GROUND-((GLOBAL_GROUND-this.position[1])/2), this.size[0], this.size[1]);
						this.animationStateFrame += 0.15;
						break;
					case 1:
						context.drawImage(imgHero, 16, 0, 14, 22, 0-(this.size[0]/2), GLOBAL_GROUND-((GLOBAL_GROUND-this.position[1])/2), this.size[0], this.size[1]);
						this.animationStateFrame += 0.15;
						break;
					case 2:	
						context.drawImage(imgHero, 32, 0, 14, 22, 0-(this.size[0]/2), GLOBAL_GROUND-((GLOBAL_GROUND-this.position[1])/2), this.size[0], this.size[1]);
						this.animationStateFrame += 0.15;
						break;
					case 3:
						context.drawImage(imgHero, 48, 0, 14, 22, 0-(this.size[0]/2), GLOBAL_GROUND-((GLOBAL_GROUND-this.position[1])/2), this.size[0], this.size[1]);
						this.animationStateFrame += 0.15;
						break;
					case 4:	
						context.drawImage(imgHero, 64, 0, 14, 22, 0-(this.size[0]/2), GLOBAL_GROUND-((GLOBAL_GROUND-this.position[1])/2), this.size[0], this.size[1]);
						this.animationStateFrame += 0.15;
						break;
					case 5:	
						context.drawImage(imgHero, 80, 0, 14, 22, 0-(this.size[0]/2), GLOBAL_GROUND-((GLOBAL_GROUND-this.position[1])/2), this.size[0], this.size[1]);
						this.animationStateFrame += 0.15;
						break;
					default:
						context.drawImage(imgHero, 96, 0, 14, 22, 0-(this.size[0]/2), GLOBAL_GROUND-((GLOBAL_GROUND-this.position[1])/2), this.size[0], this.size[1]);
						this.animationStateFrame = 0;				
				}
				break;
			default:
				context.drawImage(imgHero, 128, 0, 14, 22, 0-(this.size[0]/2), GLOBAL_GROUND-((GLOBAL_GROUND-this.position[1])/2), this.size[0], this.size[1]);
		}
		context.restore();
	}
}

// Einstiegspunkt
function spawn(position=[50,500], color='rgb(150, 255, 100)') { // Einstiegspunkt sollte 100px über dem Boden liegen, Flaggenmast beginnt deshalb 100px unterhalb des gewählten Punktes 
	this.position = position;
	this.color = color;
	this.draw = function () {
		context.save();
		context.translate((-player.position[0]+CANVAS_CENTER[0]), (GLOBAL_GROUND-player.position[1])/2);
		context.lineWidth = 5;
		context.beginPath();
		context.moveTo(this.position[0]+20, this.position[1]+100);
		context.lineTo(this.position[0]+20, this.position[1]);
		context.stroke();
		context.fillStyle = this.color;
		context.fillRect(this.position[0]+20, this.position[1], 50, 20);
		context.fill();
		context.restore();
	}
}

// Zielbereich
function finish(position=[3000,600], color='rgb(255, 100, 100)') { // Flagge steht 50px links neben dem Zielbereich
	this.position = position;
	this.color = color;
	this.draw = function () {
		context.save();
		context.translate((-player.position[0]+CANVAS_CENTER[0]), (GLOBAL_GROUND-player.position[1])/2);
		context.lineWidth = 5;
		context.beginPath();
		context.moveTo(this.position[0]-50, this.position[1]);
		context.lineTo(this.position[0]-50, this.position[1]-100);
		context.stroke();
		context.fillStyle = this.color;
		context.fillRect(this.position[0]-50, this.position[1]-100, 50, 20);
		context.fill();
		context.restore();
	}
}

// Hintergrund
function background(color=['rgb(180, 213, 230)','rgb(255,255,255)']) {
	this.color = color;		
	this.draw = function () {
		context.save();
		var backgroundGradient = context.createLinearGradient(0,0,0,CANVAS_HEIGHT);
		backgroundGradient.addColorStop(0, this.color[0]);
		backgroundGradient.addColorStop(1, this.color[1]);
		context.fillStyle = backgroundGradient;
		context.fillRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);
		context.restore();
	}
}

// Hintergrund Bergkette  149,170,149
function mountainRange(distance=0.5, height=500, range=100, start=-100, end=2000, color=['rgb(91,114,91)','black']) {
	this.distance = distance;
	this.height = height;
	this.range = range;
	this.color = color;
	this.width = range*3;
	this.start = start;
	this.end = end;
	this.points = [[this.start, this.height]];
	
	while (this.points[this.points.length-1][0] < this.end) {
		var lastPoint = this.points[this.points.length-1];
		// entscheiden, ob Berg oder Tal generiert wird
		if (Math.random() > 0.5) {
			var rightPoint = [this.points[this.points.length-1][0]+this.width, this.height-randomize(this.range)];
		} else {
			var rightPoint = [this.points[this.points.length-1][0]+this.width, this.height+randomize(this.range)];
		}
		if (lastPoint[1] < rightPoint[1]) {
			var middlePoint = [rightPoint[0]-(this.range/3+randomize(this.range/2)), rightPoint[1]-randomize(this.range/5)];
		} else {
			var middlePoint = [rightPoint[0]-(this.range/3+randomize(this.range/2)), rightPoint[1]+randomize(this.range/5)];					
		}
		if (lastPoint[1] < middlePoint[1]) {
			var leftPoint = [middlePoint[0]-(this.range/3+randomize(this.range/2)), middlePoint[1]-randomize(this.range/5)];
		} else {
			var leftPoint = [middlePoint[0]-(this.range/3+randomize(this.range/2)), middlePoint[1]+randomize(this.range/5)];					
		}

		this.points.push(leftPoint);
		this.points.push(middlePoint);
		this.points.push(rightPoint);			
	}

	this.draw = function () {
		context.save();
		context.translate(((-player.position[0]+CANVAS_CENTER[0])*this.distance), (((GLOBAL_GROUND-player.position[1])/2)*this.distance));
		var backgroundGradient = context.createLinearGradient(0,GLOBAL_GROUND,0,CANVAS_HEIGHT+1000);
		backgroundGradient.addColorStop(0, this.color[0]);
		backgroundGradient.addColorStop(1, this.color[1]);
		context.fillStyle = backgroundGradient;
		context.beginPath();
		context.moveTo(this.points[0][0]-100, this.points[0][1]+1500);
		context.lineTo(this.points[0][0], this.points[0][1]);
		for (var i in this.points) {
			context.lineTo(this.points[i][0], this.points[i][1]);
		}
		context.lineTo(this.points[this.points.length-1][0]+100, this.points[this.points.length-1][1]+1500);
		context.fill();
		context.restore();
	}
}

// Sonne (Position[x,y], Sonnenfarbe, Strahlenfarbe[Zentrum, Außen], Radius[Sonne, Strahlen], Strahlendicke, Strahlenanzahl) 
function sun(position=[100,100], glowColor='rgba(255, 255, 248, 0.5)', sunColor='rgba(255, 255, 248, 1)', beamColor=['rgba(250, 250, 243, 1)','rgba(250, 250, 243, 0)'], radius=[40,200], thickness=2, beams=16, distance=0.1) {
	this.position = position;
	this.glowColor = glowColor;
	this.sunColor = sunColor;
	this.beamColor = beamColor;
	this.radius = radius;
	this.thickness = thickness;
	this.beams = beams;
	this.distance = distance;
	
	this.draw = function () {
		// Hintergrund zeichnen			
		var backgroundColorGradient = context.createRadialGradient(0, 0, 0, 0, 0, this.radius[1]);
		backgroundColorGradient.addColorStop(0, this.glowColor);
		backgroundColorGradient.addColorStop(1, this.beamColor[1]);
		context.save();
		context.translate(this.position[0], this.position[1]);
		context.fillStyle = backgroundColorGradient;
		context.beginPath();
		context.arc(0, 0, this.radius[1], 0, 2*Math.PI);
		context.fill();
		// Strahlen zeichnen
		var modifier = 0;//player.position[0] / 200; //<------ Funktioniert nicht!
		var beamColorGradient = context.createRadialGradient(0, 0, this.radius[0], 0, 0, this.radius[1]);
		beamColorGradient.addColorStop(0, this.beamColor[0]);
		beamColorGradient.addColorStop(1, this.beamColor[1]);
		context.strokeStyle = beamColorGradient;
		context.lineWidth = this.thickness;
		for (var i = 0; i < this.beams; i++) {
			context.beginPath();
			context.moveTo(0, 0);
			var rotation = ((360 / this.beams) * Math.PI / 180);//+ (modifier * Math.PI / 180); // <--------- Funktioniert nicht!
			context.rotate(rotation);
			context.lineTo(this.radius[1], 0);
			context.stroke();
		}
		// Sonne zeichnen
		context.fillStyle = this.sunColor;
		context.beginPath();
		context.arc(0, 0, this.radius[0], 0, 2*Math.PI);
		context.fill();
		// Transformationen zurücksetzen
		context.restore();
	}
}

// Wolke
function cloud(position, distance, size=[100,50], color='rgba(250,250,250,0.5)') {
	this.position = position;
	this.distance = distance;
	this.color = color;
	this.size = size;
	this.random = [randomize(3), randomize(3), randomize(3)];
	this.move = function () {
		// Wolke ist links aus dem Level raus
		if (CLOUD_SPEED < 0 && this.position[0]+this.size[0] < -500) {
			this.position[0] = LEVEL_RANGE;
		}
		// Wolke ist rechts aus dem Level raus
		if (CLOUD_SPEED > 0 && this.position[0] > LEVEL_RANGE) {
			this.position[0] = -500;
		}
		this.position[0] += CLOUD_SPEED*this.distance;
	}
	this.draw = function () {
		context.save();
		context.translate(((-player.position[0]+CANVAS_CENTER[0])*this.distance), (((GLOBAL_GROUND-player.position[1])/2)*this.distance));
		context.beginPath();
		context.moveTo(this.position[0], this.position[1]);
		context.fillStyle = this.color;
		context.arc(this.position[0], this.position[1]-(this.size[1]/this.random[0]), this.size[1]/this.random[0], 0, Math.PI * 2);
		context.arc(this.position[0]+(this.size[0]/3), this.position[1]-(this.size[1]/this.random[1]), this.size[1]/this.random[1], 0, Math.PI * 2);
		context.arc(this.position[0]+(this.size[0]*2/3), this.position[1]-(this.size[1]/this.random[2]), this.size[1]/this.random[2], 0, Math.PI * 2);
		context.fill();
		
		context.restore();
	}
}

// Boden (Höhe von oben, Breite[Anfang, Ende], Farben[obere Farbe, untere Farbe], Dicke[Oberfläche, Gesamt])
function ground(position=[0,600], size=[CANVAS_WIDTH,600], colors=['rgb(65, 90, 65)','rgb(121, 98, 75)'], thickness=10) {
	this.position = position;
	this.size = size;
	this.colors = colors;
	this.thickness = thickness;
	
	this.draw = function () {
		context.save();
		context.translate((-player.position[0]+CANVAS_CENTER[0]), (GLOBAL_GROUND-player.position[1])/2);
		// Untergrund zeichnen
		context.fillStyle = this.colors[1];
		context.fillRect(this.position[0], this.position[1], this.size[0], this.size[1]);
		context.fill();
		// Oberfläche zeichnen
		context.fillStyle = this.colors[0];
		context.fillRect(this.position[0], this.position[1], this.size[0], this.thickness);
		context.fill();
		context.restore();
	}		
}

// Busch
function bush(position=[0,0], size=15, color='rgb(50, 67, 50)') {
	this.position = position;
	this.size = size;
	this.color = color;
	this.draw = function () {
		context.save();
		context.translate((-player.position[0]+CANVAS_CENTER[0]), (GLOBAL_GROUND-player.position[1])/2);
		context.beginPath();
		context.fillStyle = this.color;		
		context.arc(this.position[0] - this.size, this.position[1] - this.size, this.size, 0, 2*Math.PI);
		context.fill();
		context.restore();
	}
}

// Box
function box(position=[0,0], size=[30,30], color='rgb(131, 90, 85)') {
	this.position = position;
	this.size = size;
	this.color = color;
	this.draw = function () {
		context.save();
		context.translate(-player.position[0]+CANVAS_CENTER[0], (GLOBAL_GROUND-player.position[1])/2);
		context.fillStyle = this.color;
		context.fillRect(this.position[0], this.position[1], this.size[0], this.size[1]);
		context.fill();
		context.restore();
	}
}

// Feind
function enemy(position, positionStart, positionEnd, variation=0, velocity=1, size=[26,30]) {
	this.position = position;
	this.positionStart = positionStart;
	this.positionEnd = positionEnd;
	this.size = size;
	this.velocity = velocity;
	this.animationStateFrame = 0;
	// variation bestimmt die Zeile, da die verschiedenen Charaktere auf dem Spritesheet untereinander gezeichnet sind.
	if (variation == 0) {
		this.variation = 0;
	} else {
		this.variation = 76; // TODO ändern auf zweite Zeile <-------------------------
	}
	this.move = function () {
		/*Figur soll sich nur zwischen Start- und Endpunkt bewegen,
			danach soll sie selbständig umdrehen und zurück laufen
		*/ 
		
		// Figur befindet sich zwischen beiden Punkten
		if (this.position[0] > this.positionStart && this.position[0] < this.positionEnd) {
			this.position[0] += this.velocity;
			// Figur ist am Endpunkt angelangt
		} else if (this.position[0] > this.positionStart && this.position[0] >= this.positionEnd) {
			this.velocity *= -1;
			this.position[0] += this.velocity;
			// Figur ist am Startpunkt angelangt
		} else {
			this.velocity *= -1;
			this.position[0] += this.velocity;
		}
	}
	this.draw = function () {
		context.save();
		context.translate(-player.position[0]+CANVAS_CENTER[0], (GLOBAL_GROUND-player.position[1])/2);
		switch (this.velocity) {
			case -velocity: // nach links laufen
				switch (Math.floor(this.animationStateFrame)) {
					case 0:
						context.drawImage(imgEnemiesDecoration, 62+this.variation, 32, 13, 16, this.position[0]-(this.size[0]/2), this.position[1]-(this.size[1]/2), this.size[0], this.size[1]);
						this.animationStateFrame += 0.15;
						break;
					case 1:
						context.drawImage(imgEnemiesDecoration, 46+this.variation, 32, 13, 16, this.position[0]-(this.size[0]/2), this.position[1]-(this.size[1]/2), this.size[0], this.size[1]);
						this.animationStateFrame += 0.15;
						break;
					case 2:	
						context.drawImage(imgEnemiesDecoration, 30+this.variation, 32, 13, 16, this.position[0]-(this.size[0]/2), this.position[1]-(this.size[1]/2), this.size[0], this.size[1]);
						this.animationStateFrame += 0.15;
						break;
					default:
						context.drawImage(imgEnemiesDecoration, 14+this.variation, 32, 13, 16, this.position[0]-(this.size[0]/2), this.position[1]-(this.size[1]/2), this.size[0], this.size[1]);
						this.animationStateFrame = 0;				
				}	
				break;				
			case velocity: // nach rechts laufen
				switch (Math.floor(this.animationStateFrame)) {
					case 0:
						context.drawImage(imgEnemiesDecoration, 14+this.variation, 16, 13, 16, this.position[0]-(this.size[0]/2), this.position[1]-(this.size[1]/2), this.size[0], this.size[1]);
						this.animationStateFrame += 0.15;
						break;
					case 1:
						context.drawImage(imgEnemiesDecoration, 30+this.variation, 16, 13, 16, this.position[0]-(this.size[0]/2), this.position[1]-(this.size[1]/2), this.size[0], this.size[1]);
						this.animationStateFrame += 0.15;
						break;
					case 2:	
						context.drawImage(imgEnemiesDecoration, 46+this.variation, 16, 13, 16, this.position[0]-(this.size[0]/2), this.position[1]-(this.size[1]/2), this.size[0], this.size[1]);
						this.animationStateFrame += 0.15;
						break;
					default:
						context.drawImage(imgEnemiesDecoration, 62+this.variation, 16, 13, 16, this.position[0]-(this.size[0]/2), this.position[1]-(this.size[1]/2), this.size[0], this.size[1]);
						this.animationStateFrame = 0;				
				}
				break;
			default: // stehen
				context.drawImage(imgEnemiesDecoration, 0+this.variation, 16, 13, 16, this.position[0]-(this.size[0]/2), this.position[1]-(this.size[1]/2), this.size[0], this.size[1]);
		}
		
		context.restore();
	}
}


//---------------------------------------------------
// Hilfsfunktionen

// Bilder laden
function imgLoader(images) {
	// Jedes Bild laden und Promise erzeugen
	for (var img in images) {
		var prom = new Promise(function (resolve, reject){
			window[img] = new Image();
			window[img].src = images[img];
			window[img].onload = function () {
				resolve();
			}
			window[img].onerror = function () {
				console.log("error");
				reject();
			}
		});
		// alle Promises in assets Array speichern
		assets.push(prom);
	}
	
	console.log("imgLoader finished");
}

// Sounds laden
function soundLoader(sounds) {

	// Audio Kontext erzeugen
	try {
		window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	} catch (e) {
		alert("Die Web Audio API wird von deinem Browser nicht unterstützt!");
		return;
	}

	// Sounds mit BufferLoader laden
	var bufferLoader = new BufferLoader(audioCtx, sounds, finishedLoading);
	bufferLoader.load();
	
	
	// Funktion wird nach dem Laden der Sounds ausgeführt und verbindet die AudioNodes
	function finishedLoading(bufferedSounds) {
		/*
			Alle Nodes werden dem window Objekt zugewiesen,
			damit diese einen globalen Scope haben. 
		*/
		
		// Die bufferedSounds werden später benötigt, um neue Knoten zu erzeugen.
		window.bufferedSounds = bufferedSounds;
		
		// MasterGain erzeugen
		window.gainMaster = audioCtx.createGain();
		gainMaster.gain.value = 0.75;
		gainMaster.connect(audioCtx.destination);

		// Musik Gain erzeugen
		window.gainMusic = audioCtx.createGain();
		gainMusic.connect(gainMaster);
		
		// SFX Gain erzeugen
		window.gainSFX = audioCtx.createGain();
		gainSFX.connect(gainMaster);

		// Musik erzeugen		
		window.sourceMusic = audioCtx.createBufferSource();
		sourceMusic.buffer = bufferedSounds['music'];
		sourceMusic.connect(gainMusic);
		sourceMusic.loop = true;
		sourceMusic.start(0);
		
		// SFX erzeugen
		window.sourceJump = audioCtx.createBufferSource();
		window.sourceDeath = audioCtx.createBufferSource();
		window.sourceWin = audioCtx.createBufferSource();
		sourceJump.buffer = bufferedSounds['soundJump'];
		sourceDeath.buffer = bufferedSounds['soundDeath'];
		sourceWin.buffer = bufferedSounds['soundWin'];
		sourceJump.connect(gainSFX);
		sourceDeath.connect(gainSFX);
		sourceWin.connect(gainSFX);
				
		var prom = new Promise(function (resolve, reject) {
			if (sourceMusic && sourceJump && sourceDeath && sourceWin) {
				resolve();
			} else {
				reject();
			}
		});
				
		assets.push(prom);
		console.log("soundLoader finished");
	}
}

// Position eines Objekts aktualisieren
function updatePosition(object) {
	object.position[0] += object.velocity[0];
	object.position[1] += object.velocity[1];
}

// Kontakt mit Boden überprüfen, bei Kontakt Geschwindigkeit aufheben
function groundCollision(object, ground) {
	// Kollision von oben
	if ((object.position[1] + object.size[1]) >= ground.position[1] && object.position[1] <= ground.position[1] + ground.size[1]  && object.velocity[1] > 0) {
		object.velocity[1] = 0;
		object.position[1] = ground.position[1] - object.size[1];
	// Kollision von unten 
	} else if ((object.position[1] + object.size[1]) >= (ground.position[1] + (ground.size[1] / 2)) && object.position[1] <= ground.position[1] + ground.size[1]  && object.velocity[1] < 0) {
		object.velocity[1] = -object.velocity[1];
		object.position[1] += 1;
	}
}

// zufälligen, ganzzahligen Wert innerhalb von 1 und range erzeugen
function randomize(range) {
	var randomness = Math.floor((Math.random() * range) + 1);
	return randomness;
}

// Ziel-Info einblenden
function lvlFinished(time) {
	var modal = document.querySelector("#lvlFinished");
	var milliseconds;
	var seconds;
	var minutes;
	var hours;
	
	// Zeit speichern
	if(time < readSavedData(LEVEL) || readSavedData(LEVEL) == null) {
		saveData(LEVEL, time);
	}

	// Zeit in lesbare Form umwandeln
	if (time >= 1000) {
		seconds = Math.floor(time / 1000);
		milliseconds = time % 1000;
		if (seconds >= 60) {
			minutes = Math.floor(seconds / 60);
			seconds = seconds % 60;
			if (minutes >= 60) {
				hours = Math.floor(minutes / 60);
				minutes = minutes % 60;
				// Zeit in Stunden 
				time = hours+" Stunden "+minutes+" Minuten "+seconds+","+milliseconds+" Sekunden";
			} else {
				// Zeit in Minuten
				time = minutes+" Minuten "+seconds+","+milliseconds+" Sekunden";					
			}
		} else {
			// Zeit in Sekunden
			time = seconds+","+milliseconds+" Sekunden";
		}
	} else {
		time = milliseconds;
	}
	
	// Zeit schreiben & Info einblenden
	modal.querySelector("span").innerHTML = time;
	modal.style.pointerEvents = "all";
	modal.style.opacity = 1;
		
	// Musik stoppen & Sound abspielen
	sourceMusic.stop();
	sourceWin.start();
	sourceWin = audioCtx.createBufferSource();
	sourceWin.buffer = bufferedSounds['soundWin'];
	sourceWin.connect(gainSFX);

}


// Renedering Loop pausieren/fortsetzen
function pauseGame() {
	active = !active;
	if (active) {
		console.log("weiter - timeLvl: "+timeLvl);
		timeStart = Date.now();
		gameLoop();
	} else if (!finished) {
		timeLvl += Date.now() - timeStart;
		console.log("pause - timeLvl: "+timeLvl);
	}
}

// Pause auf Canvas zeichnen
function drawPause() {
	context.save();
	context.font = "30px sans-serif";
	var text = "Pause";
	var measured = context.measureText(text);
	context.fillText("Pause", CANVAS_CENTER[0]-(measured.width/2), CANVAS_CENTER[1]);
	context.restore();
}



// zeichne die Framerate
function calcFps(elapsedTime) {
	var fps = Math.floor(1000/elapsedTime);
	if(fps < 10) {
		return "00"+fps+" fps";
	} else if (fps < 100) {
		return "0"+fps+" fps";	
	} else {
		return fps+" fps";
	}
}

function drawFps(elapsedTime) {
	//context.clearRect(0,0,120,50);
	context.font = "20px sans-serif";
	context.fillText(calcFps(elapsedTime), 20, 30);
}

function readSavedData(key) {
	return localStorage.getItem(key);
}

function saveData(key, value) {
	localStorage.setItem(key, value);
}


window.onload = function () {
	soundLoader(sounds);
	imgLoader(images);

	registerTouchControls();
	gameApp();
		
	// Alle Grafiken & Sounds müssen geladen sein um fortzufahren
	Promise.all(assets).then(function () {
		console.log("All assets loaded!");
		document.querySelector('#loadingScreen').style.display = 'none';	
		
		// Rendering Loop initialisieren
		gameLoop();
	});	
}