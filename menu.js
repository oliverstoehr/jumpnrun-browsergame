// JS - LVL1

const LEVEL_RANGE = 2000; // gesamte Länge des Levels in Pixel
const CLOUD_SPEED = -1; // Pixel pro Frame
const PLAYER_RUNNING_VELOCITY = 6; // Pixel pro Frame
const PLAYER_JUMPING_VELOCITY = 9; // Pixel pro Frame
const GRAVITY = 0.5; // Pixel pro Frame
const GLOBAL_GROUND = 600; // Ebene auf dem sich der Spieler die meiste Zeit bewegt. Zentriert die Kamera entsprechend.
const GLOBAL_ABYSS = 2000; // Der Spieler verliert, wenn er auf diese Tiefe fällt.


// Sounds laden
/*
	Namen der Sounds sind wichtig!
	Werden in game.js verwendet.
*/
var sounds = {
	music: 'sounds/lines_of_code.mp3',
	soundJump: 'sounds/jump_09.mp3',
	soundDeath: 'sounds/jingle_lose_00.mp3',
	soundWin: 'sounds/jingle_win_00.mp3'
}

// Bilder laden
var images = {
	imgHero: 'images/character_spritesheet.gif',
	imgEnemiesDecoration: 'images/enemies_and_decoration.png'
}



function gameApp() {
	
	console.log("gameApp()");
	if (!document.createElement('canvas').getContext) {
		return;
	}
	
	// Canvas wählen und Kontext erzeugen
	var canvas = document.getElementById("canvas");
	window.context = canvas.getContext('2d');
	
	
		
	timeStamp = Date.now();
	timeStart = timeStamp;
	active = true;
	finished = false;

	
	
	
	//---------------------------------------------
	// Objekte erzeugen
	
	/*
		Objekte müssen Eigenschaften des window Objekts sein,
		damit diese global verfügbar sind. Andernfalls kann
		die game.js nicht darauf zugreifen.
	*/
	
	// Hintergrund erzeugen
	window.background = new background();
	console.log(background);
	
	// Sonne erzeugen
	window.sun = new sun();
	console.log(sun);
	
	// Bergketten erzeugen - Reihenfolge ist wichtig! Hintere zuerst.
	window.mountainRanges = [];
	mountainRanges.push(new mountainRange(0.2, 450, 30, -500, 5000, ['rgb(180,194,180)','black']));
	mountainRanges.push(new mountainRange(0.4, 500, 50, -500, 7000, ['rgb(149,170,149)','black']));
	mountainRanges.push(new mountainRange(0.6, 530, 100, -800, 8000));
	console.log(mountainRanges);
	
	// Wolke erzeugen
	window.clouds = [];
	clouds.push(new cloud([100,300], 0.1, [50, 25]));
	clouds.push(new cloud([200,300], 0.1, [50, 25]));
	clouds.push(new cloud([300,300], 0.1, [50, 25]));
	clouds.push(new cloud([500,310], 0.1, [50, 25]));
	clouds.push(new cloud([700,300], 0.1, [50, 25]));
	clouds.push(new cloud([1000,290], 0.1, [50, 25]));
	clouds.push(new cloud([1200,300], 0.1, [50, 25]));
	clouds.push(new cloud([1500,300], 0.1, [50, 25]));
	clouds.push(new cloud([1800,310], 0.1, [50, 25]));
	clouds.push(new cloud([1950,300], 0.1, [50, 25]));
	clouds.push(new cloud([2100,290], 0.1, [50, 25]));

	clouds.push(new cloud([0,200], 0.2, [100, 50]));
	clouds.push(new cloud([200,200], 0.2, [100, 50]));
	clouds.push(new cloud([300,210], 0.2, [100, 50]));
	clouds.push(new cloud([500,200], 0.2, [100, 50]));
	clouds.push(new cloud([800,200], 0.2, [100, 50]));
	clouds.push(new cloud([1000,200], 0.2, [100, 50]));
	clouds.push(new cloud([1300,210], 0.2, [100, 50]));
	clouds.push(new cloud([1500,200], 0.2, [100, 50]));
	clouds.push(new cloud([1800,190], 0.2, [100, 50]));
	clouds.push(new cloud([2000,200], 0.2, [100, 50]));

	clouds.push(new cloud([0,100], 0.35, [250, 125]));
	clouds.push(new cloud([400,110], 0.35, [250, 125]));
	clouds.push(new cloud([800,100], 0.35, [250, 125]));
	clouds.push(new cloud([1100,100], 0.35, [250, 125]));
	clouds.push(new cloud([1300,110], 0.35, [250, 125]));
	clouds.push(new cloud([1600,100], 0.35, [250, 125]));
	clouds.push(new cloud([1700,100], 0.35, [250, 125]));
	clouds.push(new cloud([2000,100], 0.35, [250, 125]));
	clouds.push(new cloud([2200,90], 0.35, [250, 125]));
	console.log(clouds);
	
	// Büsche erzeugen
	window.bushes = [];
	bushes.push(new bush([200, 605]));
	bushes.push(new bush([400, 605]));
	bushes.push(new bush([460, 610], 30));
	bushes.push(new bush([6000, 610]));
	console.log(bushes);

	// feste Objekte erzeugen
	window.solidObjects = [];
	// Böden
	solidObjects.push(new ground([-1000, 600], [2050, 1000]));
	solidObjects.push(new ground([-700, 400], [300, 50]));
	solidObjects.push(new ground([500, 450], [200, 50]));
	solidObjects.push(new ground([1000, 450], [50, 200]));
	solidObjects.push(new ground([-1000, 450], [50, 200]));
	
	console.log(solidObjects);
	
	// Einstiegspunkt erzeugen
	window.spawn = new spawn([50, 500]);
	console.log(spawn);
	
	// Zielpunkt erzeugen
	window.finish = new finish([10000, 600]);
	console.log(finish);
	
	// Feind erzeugen
	window.enemies = [];
	enemies.push(new enemy([-600,385], -650, -430));
	enemies.push(new enemy([600,435], 520, 680));
	console.log(enemies);
			
	// Spieler erzeugen
	/*
		Der Spieler muss den Namen "player" haben,
		da die game.js darauf zugreift.
	*/
	window.player = new character([spawn.position[0], spawn.position[1]], [0,0], [24,33]);
	console.log(player);
	
		// Zeiten abfragen, wenn Seite geladen ist
	for (var i = 1; i <= 3; i++) {
		var placeholder = document.querySelector('#timeLevel'+i);
		console.log(placeholder);
		var time = readSavedData(i);
		if (time != null) {
			// Zeit in lesbare Form umwandeln
			var milliseconds;
			var seconds;
			var minutes;
			var hours;

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

			placeholder.innerHTML = time;
		} else {
			placeholder.innerHTML = "Noch keine Zeit";
		}
	}
}