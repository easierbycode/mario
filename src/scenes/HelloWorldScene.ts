
import { AnimationHelper } from '~/helpers/animation-helper'
import Constants from '../constants'
import Phaser from 'phaser'
import { Mario } from '~/objects/mario'
import { Portal } from '~/objects/portal'
import animationJSON from '~/assets/animations/animations.json'
import { Collectible } from '~/objects/collectible'
import { Turtle } from '~/objects/turtle'

let defaultAnimationFrames  = {
waterfall : {
    key: 'waterfall', 
    frames: {
    key: 'sma4', 
    start: 526, 
    end: 529,
    typeOfGeneration: 'generateFrameNumbers'
    },
    frameRate: 8,
    repeat: -1
}
}


export default class HelloWorldScene extends Phaser.Scene
{

    // game objects
    private collectibles: Phaser.GameObjects.Group;
    private groundGroup: Phaser.Physics.Arcade.StaticGroup;
    private player: Mario;
    private portals: Phaser.GameObjects.Group;
    private currentLevel: string;

	constructor()
	{
		super('hello-world')
	}

    init(): void {
        // TODO: verify this is needed
        if (this.registry.get('level') === undefined) {
            this.initGlobalDataManager();
            this.currentLevel   = this.registry.get('level')
        } else {
            this.currentLevel   = this.registry.get('level')

        }
    }

	preload()
    {

        this.load.on(
            'complete',
            () => {
                new AnimationHelper(
                    this,
                    animationJSON
                )
            }
        )

        this.load.image(
            'a-coin-0', 
            require( '../assets/images/a-coin-0.png' )
        )
        this.load.image(
            'bg-level-e1', 
            require( '../assets/images/bg-level-e1.png' )
        )
        this.load.image(
            'clouds', 
            require( '../assets/images/clouds.png' )
        )
        this.load.image(
            'flying-goomba-0', 
            require( '../assets/images/flying-goomba-0.png' )
        )
        this.load.image(
            'metal-brick',
            require( '../assets/images/metal-brick.png' )
        )
        this.load.image(
            'tiles-sma4', 
            require( '../assets/tiles/tiles-sma4.png' )
        )
        this.load.spritesheet(
            'sma4', 
            require( '../assets/tiles/tiles-sma4.png' ),
            {
                frameHeight: 16,
                frameWidth: 16,
                spacing: 2
            }
        )
        this.load.image(
            'tiles-smb3-bw', 
            require( '../assets/tiles/tiles-smb3-bw.png' )
        )
        this.load.image(
            'tiles-sweets', 
            require( '../assets/tiles/tiles-sweets.png' )
        )
        this.load.image(
            'skyline-buildings', 
            require( '../assets/images/skyline-buildings.png' )
        )
        this.load.image(
            'waterside', 
            require( '../assets/images/waterside.png' )
        )

        let assets  = [
            {
                "type": "spritesheet",
                "key": "coin-impact",
                "url": require('../assets/sprites/coin-impact.png'),
                "frameConfig": {
                    "frameWidth": 20,
                    "frameHeight": 16
                }
            },
            {
                "type": "spritesheet",
                "key": "mario",
                "url": require('../assets/sprites/mario.png'),
                "frameConfig": {
                    "frameWidth": 16,
                    "frameHeight": 16
                }
            },
            {
                "type": "spritesheet",
                "key": "turtle-red",
                "url": require('../assets/sprites/turtle-red.png'),
                "frameConfig": {
                    "frameWidth": 18,
                    "frameHeight": 27
                }
            }
        ]
        
        assets.forEach( c => this.load[c.type](c) )

        this.load.tilemapTiledJSON(
            'levele1',
            // require( '../assets/maps/level1.json' )
            // require( '../assets/maps/level2.json' )
            require( '../assets/maps/levele1.json' )
        )

        this.load.tilemapTiledJSON(
            'levele1RoomAB',
            require( '../assets/maps/levele1-roomab.json' )
        )

        this.load.tilemapTiledJSON(
            'levele1RoomC',
            require( '../assets/maps/levele1-roomc.json' )
        )

        this.load.tilemapTiledJSON(
            'levele1RoomDEF',
            require( '../assets/maps/levele1-roomdef.json' )
        )

        this.load.tilemapTiledJSON(
            'levele1RoomGHIJK',
            require( '../assets/maps/levele1-roomghijk.json' )
        )

        this.load.tilemapTiledJSON(
            'levele1RoomHM',
            require( '../assets/maps/levele1-roomhm.json' )
        )

        this.load.tilemapTiledJSON(
            'levele1RoomKL',
            require( '../assets/maps/levele1-roomkl.json' )
        )

        this.load.tilemapTiledJSON(
            'levele1RoomO',
            require( '../assets/maps/levele1-roomo.json' )
        )
    }

    create()
    {
        // *****************************************************************
        // SETUP TILEMAP
        // *****************************************************************

        // create our tilemap from Tiled JSON
        const level = this.registry.get( 'level' )
        const map: Phaser.Tilemaps.Tilemap       = this.make.tilemap({ key: level });
        this.map        = map
        // const tileset   = map.addTilesetImage( 'tiles-smb3-bw' )
        // const tileset   = map.addTilesetImage( 'tiles-sweets' )
        const tileset   = map.addTilesetImage( 'tiles-sma4' )

        // waterside tileSprite
        // const waterside = this.add.tileSprite(0, (103 + 41) + 13, map.widthInPixels, 103, 'waterside').setOrigin(0, 1)
        // waterside.setDepth(Constants.DEPTH.background)

        // metal brick tileSprite
        if (['levele1RoomAB', 'levele1RoomC', 'levele1RoomD', 'levele1RoomDEF', 'levele1RoomGHIJK', 'levele1RoomHM'].includes(level)) {
        const metalBricks   = this.add.tileSprite( 
            0, 
            0, 
            map.widthInPixels * 2,
            map.heightInPixels * 2,
            'metal-brick' 
        )
        } else if (['levele1'].includes(level)) {
            const bg   = this.add.tileSprite( 
                0, 
                map.heightInPixels, 
                map.widthInPixels * 2,
                160 * 2,
                'bg-level-e1' 
            )

            const bgClouds   = this.add.tileSprite( 
                0, 
                map.heightInPixels - 272, 
                map.widthInPixels * 2,
                214,
                'clouds' 
            )

            const bgClouds2   = this.add.tileSprite( 
                0, 
                map.heightInPixels - (272 + 480 + 16 + 8), 
                map.widthInPixels * 2,
                214,
                'clouds' 
            )
        }

        const bgLayer   = map.createLayer( 'background', tileset )
        
        const fgLayer   = map.createLayer( 'foreground', tileset )
        fgLayer.setCollisionByProperty({ collides: true })

        fgLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
            if (tile.properties.collidesTop) {
                tile.setCollision(false, false, true, false);
            }
        })
        // *****************************************************************
        // GAME OBJECTS
        // *****************************************************************
        this.groundGroup    = this.physics.add.staticGroup()

        this.portals = this.add.group({
            /*classType: Portal,*/
            runChildUpdate: true
        });

        this.collectibles = this.add.group({
            /*classType: Collectible,*/
            runChildUpdate: true
          });

        this.enemies = this.add.group({
            runChildUpdate: true
        });
        this.loadObjectsFromTilemap();

        // *****************************************************************
        // COLLIDERS
        // *****************************************************************
        this.physics.add.collider(this.player, this.groundGroup);
        this.physics.add.collider(this.player, fgLayer);

        this.physics.add.collider(
            this.enemies,
            fgLayer,
            this.patrolPlatform,
            null,
            this
        );
        this.physics.add.overlap(
            this.player,
            this.portals,
            this.handlePlayerPortalOverlap,
            null,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.collectibles,
            this.handlePlayerCollectiblesOverlap,
            null,
            this
          );

        // *****************************************************************
        // CAMERA
        // *****************************************************************
        this.cameras.main.startFollow(this.player, true, 1, 1, 0, -36)

        this.cameras.main.setBounds(
            0,
            0,
            map.widthInPixels,
            map.heightInPixels
        )

        this.physics.world.setBounds(
            0,
            0,
            map.widthInPixels,
            map.heightInPixels
        )

        // this.setupCameraControls()

        // this.cameras.main.scrollY   = map.heightInPixels

        // const debugGraphics = this.add.graphics().setAlpha(0.75)
        // fgLayer.renderDebug(debugGraphics, {
        //     tileColor: null,
        //     collidingTileColor: null, 
        //     faceColor: new Phaser.Display.Color(255, 39, 37, 255)
        // })

        window.foo  = this
    }

    addMapImage(image): Phaser.Types.Physics.Arcade.ImageWithStaticBody | Phaser.GameObjects.Image
    {
        let newImage: Phaser.Types.Physics.Arcade.ImageWithStaticBody | Phaser.GameObjects.Image
        // Check if collision
        if (image.type === Constants.OBJECT_TYPES.static) {
            // Create static image
            newImage = this.physics.add.staticImage(image.x, image.y, image.name)
            // Set origin and refresh body
            newImage.setOrigin(0, 1).refreshBody()
            // Add to the physics group
            this.groundGroup.add(newImage)
            // Set foreground main depth
            newImage.setDepth(Constants.DEPTH.foregroundMain)
        } else {
            newImage = this.add.image(image.x, image.y, image.name)
            // Set origin
            newImage.setOrigin(0, 1)
            // Set depth: background or main secondary
            if (image.type === Constants.OBJECT_TYPES.background) {
                newImage.setDepth(Constants.DEPTH.background)
            } else {
                newImage.setDepth(Constants.DEPTH.foregroundSecondary)
            }
        }
        // Set name
        newImage.setName(image.id)
        // Result
        return newImage
    }

    loadObjectsFromTilemap()
    {
        this.map.getObjectLayer('objects').objects.forEach((object) => {
            
            if (Array.isArray(object.properties))  this.formatProperties( object )
            
            if (object.id >= 38 && object.id <= 55) {
                // Animated waterfall

                const data  = {
                    anims: [
                        defaultAnimationFrames['waterfall']
                    ]
                }    
                
                let newSprite   = this.make.sprite(
                {
                    key     : 'sma4',
                    frame   : 526,
                    x       : object.x,
                    y       : object.y,
                    origin  : {x:0, y:1},
                    depth   : Constants.DEPTH.foregroundMain
                })

                new AnimationHelper( 
                    this, 
                    data
                )
            
                newSprite.play('waterfall');
            }
            
            if (object.name === 'turtle-red') {
                this.enemies.add(
                    new Turtle({x: object.x, y: object.y, scene: this, texture: 'turtle-red'})
                )
            }
            
            if (object.type === 'portal') {

                this.portals.add(
                    new Portal({
                    scene: this,
                    x: object.x,
                    y: object.y,
                    height: object.width,
                    width: object.height,
                    spawn: {
                        x: object.properties.marioSpawnX,
                        y: object.properties.marioSpawnY,
                        dir: object.properties.direction
                    }
                    }).setName(object.name)
                );
            }
    
            if (object.type === 'player') {
                this.player = new Mario({
                    scene: this,
                    x: this.registry.get( 'spawn' ).x,
                    y: this.registry.get( 'spawn' ).y,
                    texture: 'mario'
                }).setDepth( Constants.DEPTH.important );
            }

            if (object.type === 'collectible') {
                this.collectibles.add(
                    new Collectible({
                        animated: object.properties.animated,
                        scene: this,
                        x: object.x,
                        y: object.y,
                        texture: object.properties.kindOfCollectible,
                        points: 100
                    })
                );
            }

            if (
                object.type === Constants.OBJECT_TYPES.image || 
                object.type === Constants.OBJECT_TYPES.static || 
                object.type === Constants.OBJECT_TYPES.background
            ) {
                this.addMapImage(object);
            }
        }, this)
    }

    setupCameraControls() 
    {
        const cursors = this.input.keyboard.createCursorKeys();

        const controlConfig = {
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            acceleration: 0.06,
            drag: 0.0005,
            maxSpeed: 1.0
        }

        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig)
    }

    update(): void
    {
        if (this.controls)  this.controls.update()

        if (this.player) {
            this.player.update();

            // WORLD WRAP
            if (['levele1RoomKL'].includes(this.currentLevel)) {
                this.physics.world.wrap( this.player );
            }
        }
    }

    private formatProperties(object): void
    {
        let propertiesFormatted = {}

        object.properties.forEach(p => propertiesFormatted[p.name] = p.value)

        object.properties   = propertiesFormatted
    }

    private handlePlayerCollectiblesOverlap(
        _player: Mario,
        _collectible: Collectible
      ): void {
        switch (_collectible.texture.key) {
          case 'flower': {
            break;
          }
          case 'mushroom': {
            _player.growMario();
            break;
          }
          case 'star': {
            break;
          }
          default: {
            break;
          }
        }
        _collectible.collected();
    }
    
    private handlePlayerPortalOverlap(_player: Mario, _portal: Portal): void {
        if (
            (_player.getKeys().get('DOWN').isDown &&
            _portal.getPortalDestination().dir === 'down') ||
            (_player.getKeys().get('RIGHT').isDown &&
            _portal.getPortalDestination().dir === 'right') ||
            (_player.getKeys().get('UP').isDown &&
            _portal.getPortalDestination().dir === 'up')
        ) {
          // set new level and new destination for mario
          this.registry.set('level', _portal.name);
          this.registry.set('spawn', {
            x: _portal.getPortalDestination().x,
            y: _portal.getPortalDestination().y,
            dir: _portal.getPortalDestination().dir
          });
    
          // restart the game scene
          this.scene.restart();
        }
    }
    
    private initGlobalDataManager(): void {
        this.registry.set('level', 'levele1');
        this.registry.set('spawn', { x: 16, y: 994, dir: 'down' })
        // this.registry.set('spawn', { x: 869, y: 994, dir: 'down' })
        this.registry.set('marioSize', 'small')
    }

    private patrolPlatform(enemy, platform) {
        // if enemy moving to right and has started to move over right edge of platform
        if (enemy.body.velocity.x > 0 && enemy.body.center.x > platform.right) {

            // check to see if next tile to the right collides
            let nextTileCollides    = this.map.findTile(
                t => t.collides,
                this,
                platform.x + 1,
                platform.y,
                1,
                1
            )
            // if so, do nothing
            if (nextTileCollides) {

            // if tile does not collide, reverse direction (because if we keep going we will fall)
            } else {
                enemy.speed *= -1
            }
        }
        
        // else if enemy moving to left and has started to move over left edge of platform
        else if (enemy.body.velocity.x < 0 && enemy.body.center.x < platform.pixelX) {
            
            // check to see if next tile to the left collides
            let nextTileCollides    = this.map.findTile(
                t => t.collides,
                this,
                platform.x - 1,
                platform.y,
                1,
                1
            )
            // if so, do nothing
            if (nextTileCollides) {

            // if tile does not collide, reverse direction (because if we keep going we will fall)
            } else {
                enemy.speed *= -1
            }
        }
    }
}
