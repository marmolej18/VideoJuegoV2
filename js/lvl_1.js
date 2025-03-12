var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 700,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var stars;
var bugs;
var platforms;
var cursors;
var gameOver = false;
var score = 0;
var scoreText;
var lives = 3;
var lifeBar;
var music;

var game = new Phaser.Game(config);

function preload() {
    this.load.image('sky', 'assets/fondoP.png');
    this.load.image('ground', 'assets/individual2.png');
    this.load.image('star', 'assets/trofeo.png');
    this.load.image('bug', 'assets/bugP.png');
    this.load.image('frente', 'assets/frente_.png');
    this.load.image('frente', 'assets/frenteF.png');
    /*this.load.image('derecha', 'assets/derecha_.png');
    this.load.image('izquierda', 'assets/izquierda_.png');*/
    this.load.image('perder', 'assets/Perder.png');
    this.load.audio('backgroundMusic','music/AKB48.mp3');
    // Obtener el personaje seleccionado desde localStorage
    let personajeSeleccionado = localStorage.getItem("personajeSeleccionado") || 'personaje1';
    console.log("Dentro del lvl estamos agarrando"+personajeSeleccionado);
    
    // Cargar la imagen del personaje seleccionado
    if (personajeSeleccionado === "personaje1") {
        this.load.image('playerSprite', 'assets/Frente_.png');
    } else if (personajeSeleccionado === "personaje2") {
        this.load.image('playerSprite', 'assets/frenteF.png');
    }
}

function create() {
    /*Notificacion de precaucion */
    Swal.fire({
        title: '¡Welcome!',
        text: 'Don´t touch the bugs!',
        icon: 'warning',
        /*confirmButtonText: 'Entendido'*/
    });

    music = this.sound.add('backgroundMusic', { volume: 0.5, loop: true });
    music.play();

    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();
    platforms.create(200, 650, 'ground');
    platforms.create(599, 650, 'ground');
    platforms.create(670, 480, 'ground');
    platforms.create(68, 410, 'ground');
    platforms.create(690, 290, 'ground');
    platforms.create(400, 20, 'ground').setScale(2, 1).refreshBody();

    //player = this.physics.add.sprite(100, 450, 'frente');
    player = this.physics.add.sprite(100, 450, 'playerSprite');
    player.setScale(0.7);
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();
    this.physics.add.collider(player, platforms);

    stars = this.physics.add.staticGroup();
    stars.create(80, 375, 'star');
    stars.create(650, 450, 'star');
    stars.create(650, 255, 'star');
    stars.create(750, 610, 'star');
    stars.create(345, 610, 'star');

    this.physics.add.overlap(player, stars, collectStar, null, this);

    scoreText = this.add.text(16, 70, 'Score: 0', {
        fontSize: '50px',
        fill: '#402806',
        fontFamily: 'Minecraft'
    });

    bugs = this.physics.add.sprite(600, 500, 'bug');
    bugs.setScale(0.8);
    bugs.setBounce(1);
    bugs.setCollideWorldBounds(true);
    bugs.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200));
    bugs.allowGravity = false;

    var bug2 = this.physics.add.sprite(300, 300, 'bug');
    bug2.setScale(0.6);
    bug2.setTint(0xff0000);
    bug2.setBounce(1);
    bug2.setCollideWorldBounds(true);
    bug2.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200));
    bug2.allowGravity = false;

    this.physics.add.collider(bugs, platforms);
    this.physics.add.collider(bug2, platforms);
    this.physics.add.collider(bugs, player, hitBug, null, this);
    this.physics.add.collider(bug2, player, hitBug, null, this);

    lifeBar = this.add.graphics();
    updateLifeBar();
}

function update() {
    if (gameOver) return;

    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.setTexture('izquierda');
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.setTexture('derecha');
    } else {
        player.setVelocityX(0);
        player.setTexture('frente');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-340);
    }
}

function hitBug(bug, player) {
    lives--;
    updateLifeBar();
    //console.log("Izquierda:", cursors.left.isDown, "Derecha:", cursors.right.isDown);
    if (lives <= 0) {
        this.physics.pause();
        player.setTexture('perder');
        gameOver = true;
        music.stop();

        // Obtener nombres guardados en localStorage
        let nombres = JSON.parse(localStorage.getItem("nombresJugadores")) || [];
        
        // Asegurarse de obtener el último nombre correctamente
        let ultimoNombre = "Desconocido";
        if (Array.isArray(nombres) && nombres.length > 0) {
            ultimoNombre = nombres[nombres.length - 1]; // Último nombre agregado
        }

        // Obtener el vector de puntajes guardados
        let puntajesJugadores = JSON.parse(localStorage.getItem("puntajesJugadores")) || [];

        // Agregar el nuevo registro de nombre y puntaje
        puntajesJugadores.push({ nombre: ultimoNombre, puntaje: score });

        // Guardar el vector actualizado en localStorage
        localStorage.setItem("puntajesJugadores", JSON.stringify(puntajesJugadores));
    }
}

function collectStar(player, star) {
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);
}

function updateLifeBar() {
    var lifePercentage = (lives / 3);
    var barWidth = 200;
    var barHeight = 20;
    var barX = 590;
    var barY = 80;

    lifeBar.clear();

    lifeBar.fillStyle(0x808080);
    lifeBar.fillRect(barX, barY, barWidth, barHeight);

    lifeBar.fillStyle(0x00ff00);
    lifeBar.fillRect(barX, barY, barWidth * lifePercentage, barHeight);
}