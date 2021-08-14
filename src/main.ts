import Phaser from 'phaser'

import HelloWorldScene from './scenes/HelloWorldScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 384, //160,
	height: 216, //144,
	// zoom: 5,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.Center.CENTER_BOTH
	},
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 475 },
			debug: new URL(window.location.href).searchParams.get('debug') == '1'
		}
	},
	scene: [HelloWorldScene],
	render: { pixelArt: true },
	backgroundColor: '#68c8f0'
}

export default new Phaser.Game(config)
