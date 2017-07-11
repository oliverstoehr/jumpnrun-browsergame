// JS - LVL3

const LEVEL = 3;
const LEVEL_RANGE = 5500; // gesamte Länge des Levels in Pixel
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
	window.background = new background(['rgb(230, 190, 200)','rgb(255,255,195)']);
	console.log(background);
	
	// Sonne erzeugen
	window.sun = new sun([1200,350],'rgba(255,255,245,0.5)','rgb(255,255,245)',['rgb(255,255,245)','rgba(255,255,255,0)'], [70,250]);
	console.log(sun);
	
	// Bergketten erzeugen - Reihenfolge ist wichtig! Hintere zuerst.
	window.mountainRanges = [];
	mountainRanges.push(new mountainRange(0.2, 450, 30, -500, 5000, ['rgb(200,214,240)','black']));
	mountainRanges.push(new mountainRange(0.4, 500, 50, -500, 7000, ['rgb(160,190,210)','black']));
	mountainRanges.push(new mountainRange(0.6, 530, 100, -800, 8000, ['rgb(120,150,180)','black']));
	console.log(mountainRanges);
	
	// Wolke erzeugen
	window.clouds = [];
	clouds.push(new cloud([100,300], 0.1, [50, 25]));
	clouds.push(new cloud([400,300], 0.1, [50, 25]));
	clouds.push(new cloud([700,310], 0.1, [50, 25]));
	clouds.push(new cloud([1100,300], 0.1, [50, 25]));
	clouds.push(new cloud([1200,290], 0.1, [50, 25]));
	clouds.push(new cloud([1600,300], 0.1, [50, 25]));
	clouds.push(new cloud([1900,300], 0.1, [50, 25]));
	clouds.push(new cloud([2300,310], 0.1, [50, 25]));
	clouds.push(new cloud([2500,300], 0.1, [50, 25]));
	clouds.push(new cloud([2900,290], 0.1, [50, 25]));
	clouds.push(new cloud([3000,300], 0.1, [50, 25]));
	clouds.push(new cloud([3400,300], 0.1, [50, 25]));
	clouds.push(new cloud([3900,310], 0.1, [50, 25]));
	clouds.push(new cloud([4200,300], 0.1, [50, 25]));
	clouds.push(new cloud([4600,300], 0.1, [50, 25]));
	clouds.push(new cloud([4900,290], 0.1, [50, 25]));
	clouds.push(new cloud([5300,300], 0.1, [50, 25]));
	clouds.push(new cloud([5500,300], 0.1, [50, 25]));
	clouds.push(new cloud([5900,310], 0.1, [50, 25]));
	clouds.push(new cloud([6500,310], 0.1, [50, 25]));
	clouds.push(new cloud([6700,300], 0.1, [50, 25]));
	clouds.push(new cloud([7000,310], 0.1, [50, 25]));
	clouds.push(new cloud([7100,310], 0.1, [50, 25]));
	clouds.push(new cloud([7500,320], 0.1, [50, 25]));
	clouds.push(new cloud([7900,310], 0.1, [50, 25]));
	clouds.push(new cloud([8500,300], 0.1, [50, 25]));
	clouds.push(new cloud([8800,310], 0.1, [50, 25]));

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
	clouds.push(new cloud([2200,200], 0.2, [100, 50]));
	clouds.push(new cloud([2500,210], 0.2, [100, 50]));
	clouds.push(new cloud([2700,200], 0.2, [100, 50]));
	clouds.push(new cloud([2900,200], 0.2, [100, 50]));
	clouds.push(new cloud([3300,190], 0.2, [100, 50]));
	clouds.push(new cloud([3400,200], 0.2, [100, 50]));
	clouds.push(new cloud([3800,200], 0.2, [100, 50]));
	clouds.push(new cloud([3900,200], 0.2, [100, 50]));
	clouds.push(new cloud([4100,210], 0.2, [100, 50]));

	clouds.push(new cloud([0,100], 0.35, [250, 125]));
	clouds.push(new cloud([400,110], 0.35, [250, 125]));
	clouds.push(new cloud([800,100], 0.35, [250, 125]));
	clouds.push(new cloud([1100,100], 0.35, [250, 125]));
	clouds.push(new cloud([1300,110], 0.35, [250, 125]));
	clouds.push(new cloud([1600,100], 0.35, [250, 125]));
	clouds.push(new cloud([1700,100], 0.35, [250, 125]));
	clouds.push(new cloud([2000,100], 0.35, [250, 125]));
	clouds.push(new cloud([2200,90], 0.35, [250, 125]));
	clouds.push(new cloud([2500,100], 0.35, [250, 125]));
	clouds.push(new cloud([2550,100], 0.35, [250, 125]));
	clouds.push(new cloud([2700,100], 0.35, [250, 125]));
	clouds.push(new cloud([3000,110], 0.35, [250, 125]));
	clouds.push(new cloud([3300,100], 0.35, [250, 125]));
	clouds.push(new cloud([3500,90], 0.35, [250, 125]));
	clouds.push(new cloud([3800,100], 0.35, [250, 125]));
	console.log(clouds);
	
	// Büsche erzeugen
	window.bushes = [];
	bushes.push(new bush([400, 605], 15, 'rgb(60, 77, 70)'));
	bushes.push(new bush([600, 610], 30, 'rgb(60, 77, 70)'));
	bushes.push(new bush([660, 605], 15, 'rgb(60, 77, 70)'));
	bushes.push(new bush([1270, 610], 20, 'rgb(60, 77, 70)'));
	bushes.push(new bush([1400, 610], 15, 'rgb(60, 77, 70)'));
	bushes.push(new bush([1800, 610], 30, 'rgb(60, 77, 70)'));
	bushes.push(new bush([1820, 610], 15, 'rgb(60, 77, 70)'));
	bushes.push(new bush([2350, 610], 15, 'rgb(60, 77, 70)'));
	bushes.push(new bush([2420, 620], 40, 'rgb(60, 77, 70)'));
	bushes.push(new bush([3310, 585], 15, 'rgb(60, 77, 70)'));
	bushes.push(new bush([3950, 580], 15, 'rgb(60, 77, 70)'));
	bushes.push(new bush([4000, 580], 20, 'rgb(60, 77, 70)'));
	bushes.push(new bush([4200, 580], 30, 'rgb(60, 77, 70)'));
	bushes.push(new bush([4230, 580], 15, 'rgb(60, 77, 70)'));
	bushes.push(new bush([4490, 580], 15, 'rgb(60, 77, 70)'));
	bushes.push(new bush([4500, 580], 30, 'rgb(60, 77, 70)'));
	bushes.push(new bush([4600, 570], 20, 'rgb(60, 77, 70)'));
	bushes.push(new bush([5100, 570], 15, 'rgb(60, 77, 70)'));
	bushes.push(new bush([5200, 580], 40, 'rgb(60, 77, 70)'));
	bushes.push(new bush([5250, 575], 20, 'rgb(60, 77, 70)'));
	bushes.push(new bush([6100, 535], 15, 'rgb(60, 77, 70)'));
	bushes.push(new bush([6200, 545], 40, 'rgb(60, 77, 70)'));
	bushes.push(new bush([6850, 505], 10, 'rgb(60, 77, 70)'));
	bushes.push(new bush([6950, 515], 30, 'rgb(60, 77, 70)'));
	bushes.push(new bush([7860, 495], 20, 'rgb(60, 77, 70)'));
	bushes.push(new bush([7970, 500], 30, 'rgb(60, 77, 70)'));
	bushes.push(new bush([9000, 405], 10, 'rgb(60, 77, 70)'));
	bushes.push(new bush([9200, 430], 40, 'rgb(60, 77, 70)'));
	bushes.push(new bush([9300, 420], 20, 'rgb(60, 77, 70)'));
	bushes.push(new bush([11000, 420], 20, 'rgb(60, 77, 70)'));
	console.log(bushes);

	// feste Objekte erzeugen
	window.solidObjects = [];
	// Böden
	solidObjects.push(new ground([-200, 600], [2200, 1000], ['rgb(75, 100, 85)','rgb(121, 108, 95)']));
	solidObjects.push(new ground([2100, 600], [1000, 1000], ['rgb(75, 100, 85)','rgb(121, 108, 95)']));
	solidObjects.push(new ground([3200, 580], [200, 50], ['rgb(75, 100, 85)','rgb(121, 108, 95)']));
	solidObjects.push(new ground([3500, 550], [150, 50], ['rgb(75, 100, 85)','rgb(121, 108, 95)']));
	solidObjects.push(new ground([3750, 560], [1600, 1000], ['rgb(75, 100, 85)','rgb(121, 108, 95)'])); 
	solidObjects.push(new ground([5450, 560], [200, 1000], ['rgb(75, 100, 85)','rgb(121, 108, 95)'])); 
	solidObjects.push(new ground([5800, 530], [100, 50], ['rgb(75, 100, 85)','rgb(121, 108, 95)'])); 
	solidObjects.push(new ground([6000, 530], [1600, 1000], ['rgb(75, 100, 85)','rgb(121, 108, 95)'])); 
	solidObjects.push(new ground([6700, 500], [600, 1000], ['rgb(75, 100, 85)','rgb(121, 108, 95)'])); 
	solidObjects.push(new ground([7700, 480], [300, 50], ['rgb(75, 100, 85)','rgb(121, 108, 95)'])); 
	solidObjects.push(new ground([8100, 460], [200, 50], ['rgb(75, 100, 85)','rgb(121, 108, 95)'])); 
	solidObjects.push(new ground([8350, 430], [150, 50], ['rgb(75, 100, 85)','rgb(121, 108, 95)'])); 
	solidObjects.push(new ground([8600, 400], [2000, 1000], ['rgb(75, 100, 85)','rgb(121, 108, 95)'])); 
	// Boxen
	solidObjects.push(new box([1050, 570]));
	solidObjects.push(new box([1050, 540]));
	solidObjects.push(new box([7430, 500]));
	solidObjects.push(new box([7430, 470]));
	solidObjects.push(new box([7430, 440]));
	console.log(solidObjects);
	
	// Einstiegspunkt erzeugen
	window.spawn = new spawn([50, 500]);
	console.log(spawn);
	
	// Zielpunkt erzeugen
	window.finish = new finish([9000, 400]);
	console.log(finish);
	
	// Feind erzeugen
	window.enemies = [];
	enemies.push(new enemy([1000,585], 680, 1030));
	enemies.push(new enemy([1500,585], 1430, 1700, 1, 1.5));
	enemies.push(new enemy([2490,585], 2480, 2950));
	enemies.push(new enemy([2700,585], 2480, 2950));
	enemies.push(new enemy([4700,545], 4650, 5000, 1, 1.5));
	enemies.push(new enemy([6500,515], 6260, 6650, 1, 1.5));
	enemies.push(new enemy([7050,485], 7000, 7100));
	enemies.push(new enemy([1000,585], 680, 1030));
	enemies.push(new enemy([1000,585], 680, 1030));
	enemies.push(new enemy([1000,585], 680, 1030));
	console.log(enemies);
			
	// Spieler erzeugen
	/*
		Der Spieler muss den Namen "player" haben,
		da die game.js darauf zugreift.
	*/
	window.player = new character([spawn.position[0], spawn.position[1]], [0,0], [24,33]);
	console.log(player);

	
}