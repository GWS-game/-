import { Config } from "../core/Config.js";
import { Shark } from "../entities/Shark.js";
import { MovementSystem } from "../systems/MovementSystem.js";

export class OceanScene extends Phaser.Scene {
  constructor() {
    super({ key: "OceanScene" });
  }

  create() {
    const { width, height } = this.scale;

    /* ===============================
     * 배경
     * =============================== */
    this.background = this.add.image(
      width / 2,
      height / 2,
      "bg_day"
    );
    this.background.setDisplaySize(width, height);
    this.background.setDepth(-10);

    /* ===============================
     * 고래상어 생성
     * =============================== */
    this.shark = new Shark(this);

    /* ===============================
     * 앰비언트 사운드
     * =============================== */
    this.ambientSound = this.sound.add(
      "ambient_deep_sea",
      { loop: true, volume: 0.4 }
    );
    this.ambientSound.play();

    /* ===============================
     * 리사이즈 대응 (PC 필수)
     * =============================== */
    this.scale.on("resize", this.onResize, this);
  }

  update(time, delta) {
    /* ===============================
     * 이동 시스템
     * =============================== */
    MovementSystem.update(this.shark, delta);
  }

  onResize(gameSize) {
    const { width, height } = gameSize;
    this.background.setPosition(width / 2, height / 2);
    this.background.setDisplaySize(width, height);
  }
}

