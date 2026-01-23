import { Shark } from "../entities/Shark.js";
import { Jellyfish } from "../entities/Jellyfish.js";

import { MovementSystem } from "../systems/MovementSystem.js";
import { ParticleSystem } from "../systems/ParticleSystem.js";

export class NightScene extends Phaser.Scene {
  constructor() {
    super({ key: "NightScene" });
  }

  create() {
    const { width, height } = this.scale;

    /* ===============================
     * 배경 (밤 바다)
     * =============================== */
    this.background = this.add.image(
      width / 2,
      height / 2,
      "bg_night"
    );
    this.background.setDisplaySize(width, height);
    this.background.setDepth(-10);

    /* ===============================
     * 플레이어
     * =============================== */
    this.shark = new Shark(this);

    /* ===============================
     * 해파리 (빛 친구)
     * =============================== */
    this.jellyfish = new Jellyfish(this, this.shark);

    this.scale.on("resize", this.onResize, this);
  }

  update(time, delta) {
    MovementSystem.update(this.shark, delta);

    ParticleSystem.update(this, this.shark, delta);

    if (this.jellyfish) {
      this.jellyfish.update(delta);
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

