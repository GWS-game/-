import { Friend } from "./Friend.js";

export class Fish extends Friend {
  constructor(scene, shark) {
    super(scene, shark, "fish_small");

    /* ===============================
     * 크기 & 깊이
     * =============================== */
    this.sprite.setScale(0.5);
    this.sprite.setDepth(3);
  }
}

