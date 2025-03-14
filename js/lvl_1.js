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
var isInvulnerable = false;  // Variable para controlar la invulnerabilidad
var isPaused = false;
var pauseButton;
var resumeButton,restartButton, exitButton;
var juegoIniciado = false;
var mostrandoAlerta = false;
var nivelCompletado = false;

var game = new Phaser.Game(config);

function preload() {
    this.load.image('sky', 'assets/fondoP.png');
    this.load.image('ground', 'assets/individual2.png');
    this.load.image('star', 'assets/trofeo.png');
    this.load.image('bug', 'assets/bugP.png');
    this.load.image('perder', 'assets/Perder.png');
    this.load.image('vidaIcono', 'assets/corazon.png');
    this.load.image('pauseIcon', 'assets/pause_.png');
    this.load.image('playIcon', 'assets/play_.png');
    this.load.image('restart', 'assets/restart.png');
    this.load.audio('backgroundMusic','music/AKB48.mp3');

    // Obtener el personaje seleccionado desde localStorage
    let personajeSeleccionado = localStorage.getItem("personajeSeleccionado") || 'personaje1';
    console.log("Dentro del lvl estamos agarrando: "+personajeSeleccionado);
    
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
    platforms.create(200, 650, 'ground');
    platforms.create(599, 650, 'ground');
    platforms.create(670, 480, 'ground');
    platforms.create(68, 410, 'ground');
    platforms.create(690, 290, 'ground');
    platforms.create(400, 20, 'ground').setScale(2, 1).refreshBody();

    scoreText = this.add.text(16, 70, '', {
        fontSize: '50px',
        fill: '#402806',
        fontFamily: 'Minecraft'
    });

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

    // Añadir el icono de vida 
    var iconWidth = 50;  // Tamaño del icono
    var iconHeight = 50; // Tamaño del icono
    var iconX = 580; // Posición X 
    var iconY = 90;  // Posición Y 
    this.add.image(iconX, iconY, 'vidaIcono').setOrigin(0.5, 0.5).setScale(0.5); // Ajusta la escala 

    // Botón de pausa en la esquina superior derecha
    /*pauseButton = this.add.text(310, 65, 'PAUSE', {
        fontSize: '30px',
        fill: '#fff',
        backgroundColor: '#402806',
        padding: { x: 10, y: 5 }
    }).setInteractive();

    // Evento de clic en el botón
    pauseButton.on('pointerdown', togglePause, this);*/

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
                title: '¡Welcome!',
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
                mostrandoAlerta = true;
                Swal.fire({
                    title: 'Nivel completado!',
                    icon: 'success',
                    confirmButtonText: 'Nivel 2',
                    showDenyButton: false  
                }).then(() => {
                    window.location.href = 'juegoNivel2.html'
                })
            }
        } else {
            // perdio 
            if (!mostrandoAlerta) {
                let puntajesJugadores = JSON.parse(localStorage.getItem("puntajesJugadores")) || [];
                let ultimoRegistro = puntajesJugadores[puntajesJugadores.length -1];
                mostrandoAlerta = true;
    
                Swal.fire({
                    title: 'GAME OVER',
                    text: `Nombre: ${ultimoRegistro.nombre}    Puntaje: ${ultimoRegistro.puntaje}`,
                    icon: 'info',
                    confirmButtonText: 'Volver a jugar',
                    cancelButtonText: 'Regresar al menu',
                    showCancelButton: true
                }).then(result => {
                    if (result.isConfirmed) {
                        window.location.reload();
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

    if (score == 50) {
        nivelCompletado = true;
        gameOver = true;
        this.physics.pause();
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
        pauseButton.setTexture('playIcon'); // Cambiar a icono de "play"
    } else {
        this.physics.resume(); // Reanudar el juego
        music.resume(); // Reanudar la música
        pauseButton.setTexture('pauseIcon'); // Cambiar a icono de "pause"
    }
    isPaused = !isPaused;
}


