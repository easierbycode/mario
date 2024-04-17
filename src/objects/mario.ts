import { ISpriteConstructor } from "../interfaces/sprite.interface";

export class Mario extends Phaser.GameObjects.Sprite {
  body: Phaser.Physics.Arcade.Body;

  // variables
  private currentScene: Phaser.Scene;
  private marioSize: string;
  private acceleration: number;
  private isJumping: boolean;
  private isDying: boolean;
  private isVulnerable: boolean;
  private vulnerableCounter: number;

  // input
  private keys: Map<string, Phaser.Input.Keyboard.Key>;

  public getKeys(): Map<string, Phaser.Input.Keyboard.Key> {
    return this.keys;
  }

  public getVulnerable(): boolean {
    return this.isVulnerable;
  }

  constructor(aParams: ISpriteConstructor) {
    super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);

    this.currentScene = aParams.scene;
    this.initSprite();
    this.currentScene.add.existing(this);
  }

  private initSprite() {
    // variables
    this.marioSize = this.currentScene.registry.get("marioSize");
    this.acceleration = 0; //500;
    this.isJumping = false;
    this.isDying = false;
    this.isVulnerable = true;
    this.vulnerableCounter = 100;

    // sprite
    this.setOrigin(0.5, 0.5);
    this.setFlipX(false);

    // input
    this.keys = new Map([
      ["LEFT", this.addKey("A")],
      ["RIGHT", this.addKey("D")],
      ["UP", this.addKey("W")],
      ["DOWN", this.addKey("S")],
      ["JUMP", this.addKey("SPACE")],
      ["RUN", this.addKey("C")],
      ["SELECT", this.addKey("ENTER")],
    ]);

    this.keys.get("SELECT").on("down", () => {
      document.location.reload();
    });

    // physics
    this.currentScene.physics.world.enable(this);
    this.adjustPhysicBodyToSmallSize();
    // this.body.maxVelocity.x = 50;
    this.body.maxVelocity.x = 90;
    this.body.maxVelocity.y = 300;
  }

  private addKey(key: string): Phaser.Input.Keyboard.Key {
    return this.currentScene.input.keyboard.addKey(key);
  }

  private getTimeScale(delta: number): number {
    // return 1 / (delta / 16.666);
    // return delta / (1.0 / 60.0)
    return delta / (1000 / 60);
  }

  update(time: number, delta: number): void {
    if (!this.isDying) {
      this.handleInput(delta);
      this.handleAnimations();
    } else {
      this.setFrame(12);
      //   if (this.y > this.currentScene.sys.canvas.height) {
      //     this.currentScene.scene.stop('GameScene');
      //     this.currentScene.scene.stop('HUDScene');
      //     this.currentScene.scene.start('MenuScene');
      //   }
    }

    if (!this.isVulnerable) {
      if (this.vulnerableCounter > 0) {
        this.vulnerableCounter -= 1;
      } else {
        this.vulnerableCounter = 100;
        this.isVulnerable = true;
      }
    }
  }

  private handleInput(delta: number) {
    const ACCELERATION = 3.28125;
    const DECELERATION = 3.28125;
    const SKID_DECELERATION = 7.5;
    let JUMP_VELOCITY = -206.25;

    if (this.keys.get("RIGHT").isDown || this.keys.get("LEFT").isDown) {
      if (this.keys.get("RUN").isDown) {
        this.body.maxVelocity.x = 210; //150;
      } else {
        this.body.maxVelocity.x = 90;
      }
    } else {
      this.body.maxVelocity.x = 90;
    }
    // if (this.keys.get("RUN").isDown) {
    //   this.body.maxVelocity.x = 150;
    // } else {
    //   this.body.maxVelocity.x = 90;
    // }

    // if (this.y > this.currentScene.sys.canvas.height) {
    if (this.y > this.currentScene.map.heightInPixels) {
      // mario fell into a hole
      this.isDying = true;
    }

    // evaluate if player is on the floor or on object
    // if neither of that, set the player to be jumping
    if (
      this.body.onFloor() ||
      this.body.touching.down ||
      this.body.blocked.down
    ) {
      this.isJumping = false;
      this.body.setVelocityY(0);
    }

    let velocity = this.body.velocity.x;

    // handle movements to left and right
    if (this.keys.get("RIGHT").isDown) {
      if (this.acceleration < this.body.maxVelocity.x) {
        this.acceleration += ACCELERATION * this.getTimeScale(delta);
        if (this.acceleration > this.body.maxVelocity.x)
          this.acceleration = this.body.maxVelocity.x;
      }

      this.body.setAccelerationX(this.acceleration);
      this.setFlipX(false);
    } else if (this.keys.get("LEFT").isDown) {
      if (this.acceleration < this.body.maxVelocity.x) {
        this.acceleration += ACCELERATION * this.getTimeScale(delta);
        if (this.acceleration > this.body.maxVelocity.x)
          this.acceleration = this.body.maxVelocity.x;
      }

      this.body.setAccelerationX(-this.acceleration);
      this.setFlipX(true);
    } else {
      if (this.acceleration !== 0) {
        this.acceleration -= DECELERATION * this.getTimeScale(delta);
        if (this.acceleration < 0) this.acceleration = 0;
      }

      let decel = DECELERATION * this.getTimeScale(delta);

      if (
        (this.body.velocity.x < 0 && this.body.acceleration.x > 0) ||
        (this.body.velocity.x > 0 && this.body.acceleration.x < 0)
      ) {
        decel = SKID_DECELERATION * this.getTimeScale(delta);
      }

      if (this.flipX) {
        velocity += decel;
        if (velocity > 0) velocity = 0;
        this.body.setVelocityX(velocity);
        this.body.setAccelerationX(-this.acceleration);
      } else {
        velocity -= decel;
        if (velocity < 0) velocity = 0;
        this.body.setVelocityX(velocity);
        this.body.setAccelerationX(this.acceleration);
      }
    }

    // handle jumping
    if (this.keys.get("JUMP").isDown && !this.isJumping) {
      if (Math.abs(velocity) > 180) {
        JUMP_VELOCITY = -236.25;
      } else if (Math.abs(velocity) > 120) {
        JUMP_VELOCITY = -221.25;
      } else if (Math.abs(velocity) > 60) {
        JUMP_VELOCITY = -213.75;
      } else {
        JUMP_VELOCITY = -206.25;
      }

      // this.body.setVelocityY(-180);
      this.body.setVelocityY(JUMP_VELOCITY);
      this.isJumping = true;
    }
  }

  private handleAnimations(): void {
    const SKID_TURNAROUND_X_SPEED = 33.75;

    if (this.isDying) return;

    if (this.body.velocity.y !== 0) {
      // mario is jumping or falling
      this.anims.stop();
      if (this.marioSize === "small") {
        this.setFrame(4);
      } else {
        this.setFrame(10);
      }
    } else if (this.body.velocity.x !== 0) {
      // mario is moving horizontal

      // check if mario is making a quick direction change
      if (
        ((this.body.velocity.x < 0 && this.body.acceleration.x > 0) ||
          (this.body.velocity.x > 0 && this.body.acceleration.x < 0)) &&
        Math.abs(this.body.velocity.x) > SKID_TURNAROUND_X_SPEED
      ) {
        if (this.marioSize === "small") {
          this.setFrame(5);
        } else {
          this.setFrame(11);
        }
      }

      if (this.body.velocity.x > 0) {
        this.anims.play(this.marioSize + "MarioWalk", true);
      } else {
        this.anims.play(this.marioSize + "MarioWalk", true);
      }
    } else {
      // mario is standing still
      this.anims.stop();
      if (this.marioSize === "small") {
        this.setFrame(0);
      } else {
        if (this.keys.get("DOWN").isDown) {
          this.setFrame(13);
        } else {
          this.setFrame(6);
        }
      }
    }
  }

  public growMario(): void {
    this.marioSize = "big";
    this.currentScene.registry.set("marioSize", "big");
    this.adjustPhysicBodyToBigSize();
  }

  private shrinkMario(): void {
    this.marioSize = "small";
    this.currentScene.registry.set("marioSize", "small");
    this.adjustPhysicBodyToSmallSize();
  }

  private adjustPhysicBodyToSmallSize(): void {
    this.body.setSize(6, 12);
    this.body.setOffset(6, 4);
  }

  private adjustPhysicBodyToBigSize(): void {
    this.body.setSize(8, 16);
    this.body.setOffset(4, 0);
  }

  public bounceUpAfterHitEnemyOnHead(): void {
    this.currentScene.add.tween({
      targets: this,
      props: { y: this.y - 5 },
      duration: 200,
      ease: "Power1",
      yoyo: true,
    });
  }

  public gotHit(): void {
    this.isVulnerable = false;
    if (this.marioSize === "big") {
      this.shrinkMario();
    } else {
      // mario is dying
      this.isDying = true;

      // sets acceleration, velocity and speed to zero
      // stop all animations
      this.body.stop();
      this.anims.stop();

      // make last dead jump and turn off collision check
      this.body.setVelocityY(-180);

      // this.body.checkCollision.none did not work for me
      this.body.checkCollision.up = false;
      this.body.checkCollision.down = false;
      this.body.checkCollision.left = false;
      this.body.checkCollision.right = false;
    }
  }
}
