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
var fires;
var platforms;
var movingPlatform;
var cursors;
var gameOver = false;
var score = 0;
var scoreText;
var lives = 3;
var lifeBar;
var music;
var isInvulnerable = false;  
var isPaused = false;
var juegoIniciado = false;
var mostrandoAlerta = false;
var nivelCompletado = false;

var game = new Phaser.Game(config);

function preload() {
    this.load.image('sky', 'assets/fondo2.png');
    this.load.image('ground', 'assets/pisoRosa.png');
    this.load.image('groundCorto', 'assets/pisoRosaCorto.png');
    this.load.image('star', 'assets/trofeo.png');
    this.load.image('bug', 'assets/bugP.png');
    this.load.image('perder', 'assets/Perder.png');
    this.load.image('vidaIcono', 'assets/corazon.png');
    this.load.image('pauseIcon', 'assets/pause_.png');
    this.load.image('playIcon', 'assets/play_.png');
    this.load.audio('backgroundMusic','music/AKB48.mp3');
    this.load.spritesheet("fire", 'assets/burning_loop_1.png', { frameWidth: 24, frameHeight: 32 })
    // Obtener el personaje seleccionado desde localStorage
    let personajeSeleccionado = localStorage.getItem("personajeSeleccionado") || 'personaje1';
    
    // Cargar las imágenes de los personajes dependiendo del personaje seleccionado
    if (personajeSeleccionado === "personaje1") {
        this.load.image('playerSprite', 'assets/Frente_.png');  
        this.load.image('derecha', 'assets/derecha_.png');  
        this.load.image('izquierda', 'assets/izquierda_.png');  
    } else if (personajeSeleccionado === "personaje2") {
        this.load.image('playerSprite', 'assets/frenteF.png');  
        this.load.image('derecha', 'assets/derechaF.png');  
        this.load.image('izquierda', 'assets/izquierdaF.png'); 
    }
}

function create() {

    music = this.sound.add('backgroundMusic', { volume: 0.5, loop: true });
    music.play();

    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();
    platforms.create(0, 650, 'ground');
    platforms.create(600, 650, 'ground');
    platforms.create(600, 650, 'ground');
    platforms.create(-100, 500, 'ground');
    platforms.create(650, 450, 'ground');
    platforms.create(-50, 250, 'ground');
    platforms.create(400, 250, 'groundCorto');
    platforms.create(550, 170, 'groundCorto');
    platforms.create(750, 230, 'groundCorto');


    platforms.create(400, 20, 'ground').setScale(2, 1).refreshBody();


    movingPlatform = this.physics.add.image(200, 400, 'groundCorto');
    movingPlatform.setImmovable(true);
    movingPlatform.body.allowGravity = false;

    this.tweens.add({
        targets: movingPlatform,
        x: 350,  // Hasta dónde se moverá la plataforma
        duration: 2000,  // Tiempo en milisegundos (2 segundos)
        ease: 'Linear',  // Movimiento uniforme
        yoyo: true,  // Para que vuelva al punto inicial
        repeat: -1  // Repetir indefinidamente
    });

    scoreText = this.add.text(16, 70, '', {
        fontSize: '50px',
        fill: '#402806',
        fontFamily: 'Minecraft'
    });

    player = this.physics.add.sprite(100, 550, 'playerSprite');
    player.setScale(0.7);
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();
    this.physics.add.collider(player, platforms);

    stars = this.physics.add.staticGroup();
    stars.create(60, 465, 'star');
    stars.create(680, 620, 'star');
    stars.create(740, 420, 'star');
    stars.create(120, 220, 'star');
    stars.create(740, 200, 'star');

    this.physics.add.overlap(player, stars, collectStar, null, this);

    var bug2 = this.physics.add.sprite(500, 300, 'bug');
    bug2.setScale(0.8);
    bug2.setTint(0xff0000);
    bug2.setBounce(1);
    bug2.setCollideWorldBounds(true);
    bug2.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200));
    bug2.allowGravity = false;

    // animacion fuego
    this.anims.create({
        key: 'fuego',
        frames: this.anims.generateFrameNumbers('fire', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
    })

    fires = this.physics.add.staticGroup();
    fires.create(210, 670, 'fire').play('fuego').setScale(2, 2);
    fires.create(240, 670, 'fire').play('fuego').setScale(2, 2);
    fires.create(270, 670, 'fire').play('fuego').setScale(2, 2);
    fires.create(300, 670, 'fire').play('fuego').setScale(2, 2);
    fires.create(330, 670, 'fire').play('fuego').setScale(2, 2);
    fires.create(360, 670, 'fire').play('fuego').setScale(2, 2);
    fires.create(390, 670, 'fire').play('fuego').setScale(2, 2);
    fires.create(670, 410, 'fire').play('fuego').setScale(2, 2);
    fires.create(40, 205, 'fire').play('fuego').setScale(2, 2);
    fires.create(435, 205, 'fire').play('fuego').setScale(2, 2);

    this.physics.add.collider(bug2, platforms);
    this.physics.add.collider(player, movingPlatform);
    this.physics.add.collider(bug2, movingPlatform);
    this.physics.add.collider(bug2, player, hitBug, null, this);
    this.physics.add.collider(fires, player, hitFire, null, this);

    // Añadir el icono de vida 
    var iconWidth = 50;  // Tamaño del icono
    var iconHeight = 50; // Tamaño del icono
    var iconX = 580; // Posición X 
    var iconY = 90;  // Posición Y 
    this.add.image(iconX, iconY, 'vidaIcono').setOrigin(0.5, 0.5).setScale(0.5); // Ajusta la escala 


    // Crear el botón de pausa
    pauseButton = this.add.image(370, 85, 'pauseIcon').setScale(0.5).setInteractive();

    pauseButton.on('pointerdown', togglePause, this);// Evento de clic en el botón

    pauseButton.on('pointerover', function() {
        pauseButton.setScale(0.55); // Aumentar el tamaño al pasar el mouse
    });

    pauseButton.on('pointerout', function() {
        pauseButton.setScale(0.5); // Volver al tamaño original
    });

    // Crear la barra de vida
    lifeBar = this.add.graphics();
    updateLifeBar();
}

function update() {
    if (!juegoIniciado) {
    /*Notificacion de precaucion */
        if (!mostrandoAlerta) {
            this.physics.pause();
            mostrandoAlerta = true;
            Swal.fire({
                title: 'Nivel 2!',
                text: 'Don´t touch the bugs!',
                icon: 'warning',
                /*confirmButtonText: 'Entendido'*/
            }).then(() => {
                juegoIniciado = true;
                mostrandoAlerta = false;
                this.physics.resume();
            });
        }
        return;
    }
    if (gameOver) {
        if (nivelCompletado) {
            // completo el nivel
            if (!mostrandoAlerta) {
                let puntajesJugadores = JSON.parse(localStorage.getItem("puntajesJugadores")) || [];
                let ultimoRegistro = puntajesJugadores[puntajesJugadores.length -1];
                mostrandoAlerta = true;
                Swal.fire({
                    title: 'Juego completado!',
                    icon: 'success',
                    text: `Nombre: ${ultimoRegistro.nombre}    Puntaje: ${ultimoRegistro.puntaje}`,
                    confirmButtonText: 'Records',
                    showDenyButton: false  
                }).then(result => {
                    window.location.href = "records.html"
                })
            }
        } else {
            // perdio 
            if (!mostrandoAlerta) {
                let puntajesJugadores = JSON.parse(localStorage.getItem("puntajesJugadores")) || [];
                let ultimoRegistro = puntajesJugadores[puntajesJugadores.length -1];
                mostrandoAlerta = true;
    
                Swal.fire({
                    title: '',
                    text: `Name: ${ultimoRegistro.nombre}    Score: ${ultimoRegistro.puntaje}`,
                    imageUrl: '/assets/gameOver.png',
                    confirmButtonText: 'Back to play',
                    cancelButtonText: 'Back to menu',
                    showCancelButton: true,
                    background: "#00000080",
                    width: 800,
                    heightAuto: false,
                    customClass: {
                        popup: 'custom-alert' // Clases CSS personalizadas
                    },
                }).then(result => {
                    if (result.isConfirmed) {
                        window.location.href = 'juegoNivel1.html'
                    } else {
                        window.location.href = 'menu.html'
                    }
                });
            }
        }

        return
    };

    // Movimientos del jugador y actualización de texturas dependiendo del personaje seleccionado
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.setTexture('izquierda');
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.setTexture('derecha');
    } else {
        player.setVelocityX(0);
        player.setTexture('playerSprite');  // Esto debe ser la imagen frontal del personaje seleccionado
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-340);
    }
}

function hitFire(player, fire) {
    this.physics.pause();
    terminarJuego(player)
}

function terminarJuego(player) {

    // Verificar si el personaje seleccionado es el personaje 2
    let personajeSeleccionado = localStorage.getItem("personajeSeleccionado") || 'personaje1';
    
    if (personajeSeleccionado === "personaje2") {
        // Si es el personaje 2, aplicar el color azul cielo
        player.setTint(0x87CEEB);  // Azul cielo
    } else {
        // Si es el personaje 1, seguir mostrando la imagen 'perder'
        player.setTexture('perder');
    }
    gameOver = true;
    music.stop();


    // Obtener el vector de puntajes guardados
    let puntajesJugadores = JSON.parse(localStorage.getItem("puntajesJugadores")) || [];

    if (puntajesJugadores.length === 0) {
        puntajesJugadores.push({ nombre: 'Desconocido', puntaje: score});
    } else {
        puntajesJugadores[puntajesJugadores.length -1].puntaje += score
    }

    // Guardar el vector actualizado en localStorage
    localStorage.setItem("puntajesJugadores", JSON.stringify(puntajesJugadores));
}

function hitBug(bug, player) {
    if (isInvulnerable) return;  // Si está invulnerable, no hacer nada más
    lives--;
    updateLifeBar();

    isInvulnerable = true; // Activar invulnerabilidad
    // Temporizador para la invulnerabilidad (por ejemplo, 1 segundo)
    this.time.delayedCall(1000, function() {
        isInvulnerable = false;  // Desactivar invulnerabilidad después de 1 segundo
    });
    //console.log("Izquierda:", cursors.left.isDown, "Derecha:", cursors.right.isDown);
    if (lives <= 0) {
        this.physics.pause();
        terminarJuego(player);
    }
}

function collectStar(player, star) {
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);

    if (score == 50) {
        nivelCompletado = true;
        gameOver = true;
        this.physics.pause();
        music.stop();
            // Obtener el vector de puntajes guardados
    let puntajesJugadores = JSON.parse(localStorage.getItem("puntajesJugadores")) || [];

    if (puntajesJugadores.length === 0) {
        puntajesJugadores.push({ nombre: 'Desconocido', puntaje: score});
    } else {
        puntajesJugadores[puntajesJugadores.length -1].puntaje += score
    }

    // Guardar el vector actualizado en localStorage
    localStorage.setItem("puntajesJugadores", JSON.stringify(puntajesJugadores));
    }
}

function updateLifeBar() {
    var lifePercentage = (lives / 3); // Porcentaje de vida
    var barWidth = 200;  // Ancho de la barra
    var barHeight = 20;  // Alto de la barra
    var barX = 590;  // Posición X de la barra
    var barY = 80;   // Posición Y de la barra

    // Limpiar la barra de vida previa
    lifeBar.clear();

    // Dibujar la barra de vida (gris de fondo)
    lifeBar.fillStyle(0x808080);
    lifeBar.fillRect(barX, barY, barWidth, barHeight);

    lifeBar.fillStyle(0x00ff00);  // Rosa pastel 
    lifeBar.fillRect(barX, barY, barWidth * lifePercentage, barHeight);
}

function togglePause() {
    if (!isPaused) {
        this.physics.pause(); // Pausar el juego
        music.pause(); // Pausar la música
        pauseButton.setTexture('playIcon');  // Cambiar a icono de "play"
    } else {
        this.physics.resume(); // Reanudar el juego
        music.resume(); // Reanudar la música
        pauseButton.setTexture('pauseIcon'); // Cambiar a icono de "pause"
    }
    isPaused = !isPaused;
}
