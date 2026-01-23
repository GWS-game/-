import { Config } from "../core/Config.js";

export class Shark {
  constructor(scene) {
    this.scene = scene;

    const { width, height } = scene.scale;

    /* ===============================
     * 스프라이트 생성
     * =============================== */
    this.sprite = scene.add.image(
      width * 0.3,
      height * 0.5,
      "shark_base"
    );

    /* ===============================
     * 기본 설정
     * =============================== */
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setScale(Config.SHARK.SCALE);
    this.sprite.setDepth(1);

    /* ===============================
     * 이동 관련 기본값
     * =============================== */
    this.speed = Config.SHARK.SPEED;
    this.floatOffset = 0;
    this.floatSpeed = 0.002;

    /* ===============================
     * 방향
     * =============================== */
    this.direction = 1; // 1 = 오른쪽, -1 = 왼쪽
  }
}

