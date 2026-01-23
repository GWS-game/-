import { Shark } from "../entities/Shark.js";
import { Fish } from "../entities/Fish.js";

import { MovementSystem } from "../systems/MovementSystem.js";
import { ParticleSystem } from "../systems/ParticleSystem.js";

export class OceanScene extends Phaser.Scene {
  constructor() {
    super({ key: "OceanScene" });
  }

  create() {
    const { width, height } = this.scale;

    /* ===============================
     * 배경 (낮 바다)
     * =============================== */
    this.background = this.add.image(
      width / 2,
      height / 2,
      "bg_day"
    );
    this.background.setDisplaySize(width, height);
    this.background.setDepth(-10);

    /* ===============================
     * 플레이어 (고래상어)
     * =============================== */
    this.shark = new Shark(this);

    /* ===============================
     * 첫 번째 친구 (물고기)
     * =============================== */
    this.fish = new Fish(this, this.shark);

    /* ===============================
     * 리사이즈 대응 (PC 웹 필수)
     * =============================== */
    this.scale.on("resize", this.onResize, this);
  }

  update(time, delta) {
    /* ===============================
     * 고래상어 이동
     * =============================== */
    MovementSystem.update(this.shark, delta);

    /* ===============================
     * 헤엄 잔상 파티클
     * =============================== */
    ParticleSystem.update(this, this.shark, delta);

    /* ===============================
     * 친구 업데이트
     * =============================== */
    if (this.fish) {
      this.fish.update(delta);
    }
  }

  onResize(gameSize) {
    const { width, height } = gameSize;

    if (this.background) {
      this.background.setPosition(width / 2, height / 2);
      this.background.setDisplaySize(width, height);
    }
  }
}
