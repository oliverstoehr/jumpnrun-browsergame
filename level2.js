// JS - LVL2

const LEVEL = 2;
const LEVEL_RANGE = 8000; // gesamte Länge des Levels in Pixel
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
	music: 'sounds/happy_adventure.mp3',
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
	window.background = new background(['rgb(27,64,94)','rgb(255,200,120)']);
	console.log(background);
	
	// Sonne erzeugen
	window.sun = new sun([200,450],'rgba(250,150,70,0.5)','rgb(255,155,78)',['rgb(255,155,78)','rgba(255,155,78,0)'], [80,300]);
	console.log(sun);
	
	// Bergketten erzeugen - Reihenfolge ist wichtig! Hintere zuerst.
	window.mountainRanges = [];
	mountainRanges.push(new mountainRange(0.2, 450, 30, -500, 5000, ['rgb(100,124,140)','black']));
	mountainRanges.push(new mountainRange(0.4, 500, 50, -500, 7000, ['rgb(90,110,130)','black']));
	mountainRanges.push(new mountainRange(0.6, 530, 100, -800, 8000, ['rgb(70,80,80)','black']));
	console.log(mountainRanges);
	
	// Wolke erzeugen
	window.clouds = [];
	clouds.push(new cloud([100,300], 0.1, [50, 25], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([200,300], 0.1, [50, 25], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([300,300], 0.1, [50, 25], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([500,310], 0.1, [50, 25], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([700,300], 0.1, [50, 25], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([1000,290], 0.1, [50, 25], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([1200,300], 0.1, [50, 25], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([1500,300], 0.1, [50, 25], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([1800,310], 0.1, [50, 25], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([1950,300], 0.1, [50, 25], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([2100,290], 0.1, [50, 25], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([2300,300], 0.1, [50, 25], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([2500,300], 0.1, [50, 25], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([2600,310], 0.1, [50, 25], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([2700,300], 0.1, [50, 25], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([2900,300], 0.1, [50, 25], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([3200,290], 0.1, [50, 25], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([3500,300], 0.1, [50, 25], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([3700,300], 0.1, [50, 25], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([3900,310], 0.1, [50, 25], 'rgba(190,150,124,0.5)'));

	clouds.push(new cloud([0,200], 0.2, [100, 50], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([200,200], 0.2, [100, 50], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([300,210], 0.2, [100, 50], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([500,200], 0.2, [100, 50], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([800,200], 0.2, [100, 50], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([1000,200], 0.2, [100, 50], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([1300,210], 0.2, [100, 50], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([1500,200], 0.2, [100, 50], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([1800,190], 0.2, [100, 50], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([2000,200], 0.2, [100, 50], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([2200,200], 0.2, [100, 50], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([2500,210], 0.2, [100, 50], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([2700,200], 0.2, [100, 50], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([2900,200], 0.2, [100, 50], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([3300,190], 0.2, [100, 50], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([3400,200], 0.2, [100, 50], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([3800,200], 0.2, [100, 50], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([3900,200], 0.2, [100, 50], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([4100,210], 0.2, [100, 50], 'rgba(190,150,124,0.5)'));

	clouds.push(new cloud([0,100], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([400,110], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([800,100], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([1100,100], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([1300,110], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([1600,100], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([1700,100], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([2000,100], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([2200,90], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([2500,100], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([2550,100], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([2700,100], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([3000,110], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([3300,100], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([3500,90], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([3800,100], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([3900,115], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([4100,100], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([4300,90], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([4400,115], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([4650,100], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([4800,110], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([4900,85], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([5300,100], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([5400,90], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([5500,115], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([5700,100], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([6000,100], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([6200,90], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([6400,115], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([6550,85], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([6800,100], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([7000,110], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([7300,100], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([7400,90], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	clouds.push(new cloud([7700,100], 0.35, [250, 125], 'rgba(190,150,124,0.5)'));
	console.log(clouds);
	
	// Büsche erzeugen
	window.bushes = [];
	bushes.push(new bush([500, 605], 20, 'rgb(60, 50, 50)'));
	bushes.push(new bush([600, 605], 15, 'rgb(60, 50, 50)'));
	bushes.push(new bush([900, 610], 15, 'rgb(60, 50, 50)'));
	bushes.push(new bush([1270, 610], 20, 'rgb(60, 50, 50)'));
	bushes.push(new bush([1400, 610], 15, 'rgb(60, 50, 50)'));
	bushes.push(new bush([1800, 610], 30, 'rgb(60, 50, 50)'));
	bushes.push(new bush([1820, 610], 15, 'rgb(60, 50, 50)'));
	bushes.push(new bush([2350, 610], 15, 'rgb(60, 50, 50)'));
	bushes.push(new bush([2420, 620], 40, 'rgb(60, 50, 50)'));
	bushes.push(new bush([3950, 610], 15, 'rgb(60, 50, 50)'));
	bushes.push(new bush([4000, 610], 20, 'rgb(60, 50, 50)'));
	bushes.push(new bush([4200, 610], 30, 'rgb(60, 50, 50)'));
	bushes.push(new bush([4230, 610], 15, 'rgb(60, 50, 50)'));
	bushes.push(new bush([4490, 610], 15, 'rgb(60, 50, 50)'));
	bushes.push(new bush([4500, 610], 30, 'rgb(60, 50, 50)'));
	bushes.push(new bush([4600, 610], 20, 'rgb(60, 50, 50)'));
	bushes.push(new bush([5100, 610], 15, 'rgb(60, 50, 50)'));
	bushes.push(new bush([5200, 610], 40, 'rgb(60, 50, 50)'));
	bushes.push(new bush([5250, 610], 20, 'rgb(60, 50, 50)'));
	bushes.push(new bush([5900, 610], 40, 'rgb(60, 50, 50)'));
	bushes.push(new bush([6000, 610], 15, 'rgb(60, 50, 50)'));
	bushes.push(new bush([6250, 610], 10, 'rgb(60, 50, 50)'));
	bushes.push(new bush([6350, 610], 15, 'rgb(60, 50, 50)'));
	bushes.push(new bush([6800, 610], 20, 'rgb(60, 50, 50)'));
	bushes.push(new bush([7600, 610], 15, 'rgb(60, 50, 50)'));
	bushes.push(new bush([7700, 620], 30, 'rgb(60, 50, 50)'));
	bushes.push(new bush([7750, 610], 20, 'rgb(60, 50, 50)'));
	bushes.push(new bush([9000, 610], 15, 'rgb(60, 50, 50)'));
	console.log(bushes);

	// feste Objekte erzeugen
	window.solidObjects = [];
	// Böden
	solidObjects.push(new ground([-200, 600], [2200, 1000], ['rgb(55,50,45)','rgb(65,60,50)']));
	solidObjects.push(new ground([1500, 550], [1000, 1000], ['rgb(55,50,45)','rgb(65,60,50)']));
	solidObjects.push(new ground([2100, 500], [400, 1000], ['rgb(55,50,45)','rgb(65,60,50)']));
	solidObjects.push(new ground([2600, 490], [500, 50], ['rgb(55,50,45)','rgb(65,60,50)']));
	solidObjects.push(new ground([3200, 550], [200, 50], ['rgb(55,50,45)','rgb(65,60,50)']));
	solidObjects.push(new ground([3550, 600], [150, 50], ['rgb(55,50,45)','rgb(65,60,50)']));
	solidObjects.push(new ground([3750, 600], [2300, 1000], ['rgb(55,50,45)','rgb(65,60,50)'])); 
	solidObjects.push(new ground([6150, 600], [300, 50], ['rgb(55,50,45)','rgb(65,60,50)'])); 
	solidObjects.push(new ground([6500, 600], [2300, 1000], ['rgb(55,50,45)','rgb(65,60,50)'])); 
	// Boxen
	solidObjects.push(new box([1470, 570], [30,30], 'rgb(91, 80,65)'));
	solidObjects.push(new box([2880, 460], [30,30], 'rgb(91, 80,65)'));
	solidObjects.push(new box([4800, 570], [30,30], 'rgb(91, 80,65)'));
	solidObjects.push(new box([4900, 570], [30,30], 'rgb(91, 80,65)'));
	solidObjects.push(new box([4900, 540], [30,30], 'rgb(91, 80,65)'));
	solidObjects.push(new box([4900, 510], [30,30], 'rgb(91, 80,65)'));
	solidObjects.push(new box([7100, 570], [30,30], 'rgb(91, 80,65)'));
	solidObjects.push(new box([7100, 540], [30,30], 'rgb(91, 80,65)'));
	console.log(solidObjects);
	
	// Einstiegspunkt erzeugen
	window.spawn = new spawn([50, 500], 'rgb(150, 150, 90)');
	console.log(spawn);
	
	// Zielpunkt erzeugen
	window.finish = new finish([7500, 600], 'rgb(200, 80, 80)');
	console.log(finish);
	
	// Feind erzeugen
	window.enemies = [];
	enemies.push(new enemy([760,585], 750, 1150));
	enemies.push(new enemy([3300,535], 3200, 3380));
	enemies.push(new enemy([5000,585], 4950, 5500));
	enemies.push(new enemy([5700,585], 5500, 5750));
	enemies.push(new enemy([6190,585], 6170, 6420));
	enemies.push(new enemy([6900,585], 6850, 7080));
	console.log(enemies);
			
	// Spieler erzeugen
	/*
		Der Spieler muss den Namen "player" haben,
		da die game.js darauf zugreift.
	*/
	window.player = new character([spawn.position[0], spawn.position[1]], [0,0], [24,33]);
	console.log(player);

	
}