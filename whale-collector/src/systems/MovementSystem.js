export class MovementSystem {
  static update(shark, delta) {
    if (!shark || !shark.sprite) return;

    const sprite = shark.sprite;
    const scene = shark.scene;
    const { width, height } = scene.scale;

    /* ===============================
     * 기본 이동 (좌우 유영)
     * =============================== */
    sprite.x += shark.speed * shark.direction * (delta / 16);

    /* ===============================
     * 위아래 부유 (사인 웨이브)
     * =============================== */
    shark.floatOffset += shark.floatSpeed * delta;
    sprite.y += Math.sin(shark.floatOffset) * 0.3;

    /* ===============================
     * 화면 끝 처리
     * =============================== */
    const margin = 100;

    if (sprite.x > width + margin) {
      shark.direction = -1;
      sprite.setFlipX(true);
    }

    if (sprite.x < -margin) {
      shark.direction = 1;
      sprite.setFlipX(false);
    }

    /* ===============================
     * Y축 제한 (너무 위/아래 안 가게)
     * =============================== */
    sprite.y = Phaser.Math.Clamp(
      sprite.y,
      height * 0.3,
      height * 0.7
    );
  }
}

