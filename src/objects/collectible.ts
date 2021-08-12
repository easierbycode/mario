import { AnimationHelper } from '~/helpers/animation-helper';
import { ICollectibleConstructor } from '../interfaces/collectible.interface';

let defaultAnimationFrames  = {
  coin2   : { 
    key: 'default', 
    frames: {
      key: 'sma4', 
      start: 268, 
      end: 271,
      typeOfGeneration: 'generateFrameNumbers'
    },
    frameRate: 6,
    repeat: -1
  }
}


export class Collectible extends Phaser.GameObjects.Sprite {
  body: Phaser.Physics.Arcade.Body;

  // variables
  private currentScene: Phaser.Scene;
  private points: number;

  constructor(aParams: ICollectibleConstructor) {
    super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);

    // variables
    this.currentScene = aParams.scene;
    this.points = aParams.points;
    this.initSprite();

    // animated?
    // - create and play default anim if true
    if (aParams.animated)  this.createAndPlayDefaultAnim(aParams);

    this.currentScene.add.existing(this);
  }

  private initSprite() {
    // sprite
    this.setOrigin(0, 0);
    this.setFrame(0);

    // physics
    this.currentScene.physics.world.enable(this);
    // this.body.setSize(8, 8);
    this.body.setSize(16, 16).setOffset(0);
    this.body.setAllowGravity(false);
  }

  update(): void {}

  public collected(): void {
    this.destroy();
    this.currentScene.registry.values.score += this.points;
    this.currentScene.events.emit('scoreChanged');
  }

  private createAndPlayDefaultAnim(aParams: ICollectibleConstructor)
  {
    const data  = {
      anims: [
        defaultAnimationFrames[aParams.texture]
      ]
    }

    new AnimationHelper( 
      this.currentScene, 
      data
    )
  
    this.play('default');
  }
}