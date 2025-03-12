import { Nivel1 } from './scenes/nivel1.js'


const config = {
    type: Phaser.AUTO,
    title: 'VideoJuego',
    parent: 'game-container',
    width: 1280,
    height: 720,
    pixelArt: false,
    scene: [
        Nivel1
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}
new Phaser.Game(config);
            