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
var soundStar;
var soundPowerUp;
var soundGameOver;
var isInvulnerable = false;
var isPaused = false;
var pauseButton;
var resumeButton, restartButton, exitButton;
var juegoIniciado = false;
var mostrandoAlerta = false;
var nivelCompletado = false;
var powerUp;
let timeText;
let invulnerableTime = 0;
let powerUpTimer; // Variable para almacenar el temporizador del powerUp
let timer;
let DateText;

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
    this.load.image('power', 'assets/linterna.png');
    this.load.audio('backgroundMusic', 'music/AKB48.mp3');
    this.load.audio('soundStar', 'music/trofeo.mp3');
    this.load.audio('soundPowerUp', 'music/powerUp.mp3');
    this.load.audio('gameOverSound', 'music/gameover.mp3');
    // Obtener el personaje seleccionado desde localStorage
    let personajeSeleccionado = localStorage.getItem("personajeSeleccionado") || 'personaje1';
    console.log("Dentro del lvl estamos agarrando: " + personajeSeleccionado);

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
    soundStar = this.sound.add('soundStar', { volume: 0.7 });
    soundPowerUp = this.sound.add('soundPowerUp', { volume: 0.7 });
    soundGameOver = this.sound.add('gameOverSound', { volume: 0.7 });
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

    timeText = this.add.text(20, 120, '', { fontSize: '25px', fill: 'black', fontFamily: 'Minecraft' });

    let scene = this; // Guardamos referencia a la escena

    // Retrasamos la creación de DateText para asegurarnos de que la fuente ya cargó
    this.time.delayedCall(200, function() {
        DateText = scene.add.text(550, 50, 'Date:', { fontSize: '25px', fill: 'black', fontFamily: 'Minecraft' });
        fechaM(); // Llamamos a la función para mostrar la fecha
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

    /*powerUp = this.physics.add.image(750, 230, 'power');
    powerUp.setScale(0.2);
    powerUp.setImmovable(true);//Hacer que no se mueva
    powerUp.body.allowGravity = false;//Desactivar la gravedad*/

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

    // Crear el botón de pausa
    pauseButton = this.add.image(370, 85, 'pauseIcon').setScale(0.5).setInteractive();


    pauseButton.on('pointerdown', togglePause, this);// Evento de clic en el botón

    pauseButton.on('pointerover', function () {
        pauseButton.setScale(0.55); // Aumentar el tamaño al pasar el mouse
    });

    pauseButton.on('pointerout', function () {
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
                let ultimoRegistro = puntajesJugadores[puntajesJugadores.length - 1];
                let ScoreTem = localStorage.getItem('ScoreTem');
                mostrandoAlerta = true;
                soundGameOver.play();
                Swal.fire({
                    title: '',
                    text: `Name: ${ultimoRegistro.nombre}    Score: ${ScoreTem}`,
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

function hitBug(bug, player) {
    if (isInvulnerable) return;  // Si está invulnerable, no hacer nada más
    lives--;
    updateLifeBar();

    isInvulnerable = true; // Activar invulnerabilidad
    // Temporizador para la invulnerabilidad (por ejemplo, 1 segundo)
    this.time.delayedCall(1000, function () {
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

        // Obtener la fecha actual
        const fecha = new Date();
        const dia = String(fecha.getDate()).padStart(2, '0'); // Agregar 0 si es un solo dígito
        const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Mes 0 es enero, así que sumamos 1
        const anio = fecha.getFullYear();
        const fechaFormateada = `${dia}/${mes}/${anio}`;

        // Buscar si el jugador ya tiene un puntaje guardado
        let jugadorIndex = puntajesJugadores.findIndex(j => j.nombre === ultimoNombre);

        if (jugadorIndex !== -1) {
            // Si ya existe, solo actualizar si el nuevo puntaje es mayor
            if (score > puntajesJugadores[jugadorIndex].puntaje) {
                puntajesJugadores[jugadorIndex].puntaje = score;
                puntajesJugadores[jugadorIndex].fecha = fechaFormateada; // Actualizar la fecha
            }
        } else {
            // Si no existe, agregar el nuevo registro
            puntajesJugadores.push({ nombre: ultimoNombre, fecha: fechaFormateada, puntaje: score });
        }

        // Guardar el vector actualizado en localStorage
        localStorage.setItem("puntajesJugadores", JSON.stringify(puntajesJugadores));

    }
}

function collectStar(player, star) {
    soundStar.play();
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);
    localStorage.setItem('ScoreTem', score.toString());
    

    if (score == 10) {
        powerUp = this.physics.add.image(500, 230, 'power');
        powerUp.setScale(0.2);
        powerUp.setImmovable(true); // Hacer que no se mueva
        powerUp.body.allowGravity = false; // Desactivar la gravedad

        // Crear un texto para mostrar el tiempo restante
        let remainingPowerUpTime = 7; // Tiempo total para recoger el powerUp
        let powerUpTimerText = this.add.text(20, 120, 'Available power: ' + remainingPowerUpTime, { fontSize: '25px', fill: 'black', fontFamily: 'Minecraft' });

        // Variable para verificar si el powerUp ha sido recogido
        let powerUpCollected = false;

        // Temporizador para destruir el powerUp después de 7 segundos
        powerUpTimer = this.time.addEvent({
            delay: 1000, // Cada segundo
            repeat: 6, // Repetir 6 veces (0 a 6, total 7 segundos)
            callback: function () {
                remainingPowerUpTime--;
                powerUpTimerText.setText('Available power: ' + remainingPowerUpTime); // Actualizar el texto

                if (remainingPowerUpTime <= 0) {
                    powerUp.destroy(); // Destruir el powerUp si no ha sido recogido
                    powerUpTimerText.setText(''); // Limpiar el texto
                    powerUpTimer.remove(); // Detener el temporizador
                }
            },
            callbackScope: this
        });

        // Añadir colisión entre el jugador y el powerUp
        this.physics.add.overlap(player, powerUp, function () {
            if (!powerUpCollected) { // Verificar si no ha sido recogido
                soundPowerUp.play();
                powerUpCollected = true; // Marcar como recogido
                powerUp.destroy(); // Destruir el powerUp al tocarlo
                powerUpTimerText.setText(''); // Limpiar el texto
                isInvulnerable = true; // Activar invulnerabilidad
                invulnerableTime = 7;
                timeText.setText('Invulnerable: ' + invulnerableTime);

                timer = this.time.addEvent({
                    delay: 1000,
                    repeat: 6,
                    callback: function () {
                        invulnerableTime--;
                        timeText.setText('Invulnerable: ' + invulnerableTime);

                        if (invulnerableTime === 0) {
                            isInvulnerable = false;
                            timeText.setText('');
                            timer.remove();
                        }
                    },
                    callbackScope: this
                });

                powerUpTimer.remove(); // Detener el temporizador del powerUp
            }
        }, null, this);
    }

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
        if (powerUpTimer) {
            powerUpTimer.paused = true;
        }
        if (timer) {
            timer.paused = true;
        }
    } else {
        this.physics.resume(); // Reanudar el juego
        music.resume(); // Reanudar la música
        pauseButton.setTexture('pauseIcon'); // Cambiar a icono de "pause"
        if (powerUpTimer) {
            powerUpTimer.paused = false;
        }
        if (timer) {
            timer.paused = false;
        }
    }
    isPaused = !isPaused;
}
function fechaM(){
    // Obtener la fecha actual
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0'); // Día con 2 dígitos
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Mes con 2 dígitos
    const anio = fecha.getFullYear(); // Año completo

    const fechaTexto = `${dia}/${mes}/${anio}`; // Formato: dd/mm/yyyy
    DateText.setText('Date: '+ fechaTexto);
}

