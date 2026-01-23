export class Friend {
  constructor(scene, shark, textureKey) {
    this.scene = scene;
    this.shark = shark;

    /* ===============================
     * 스프라이트 생성
     * =============================== */
    this.sprite = scene.add.image(
      shark.sprite.x,
      shark.sprite.y,
      textureKey
    );

    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDepth(2);

    /* ===============================
     * 기본 추적 값
     * =============================== */
    this.followDistance = 60 + Math.random() * 40;
    this.followSpeed = 0.05 + Math.random() * 0.05;

    /* ===============================
     * 개별 오프셋 (겹치지 않게)
     * =============================== */
    this.offsetAngle = Math.random() * Math.PI * 2;
    this.orbitRadius = 20 + Math.random() * 20;
  }

  update(delta) {
    if (!this.shark || !this.sprite) return;

    const targetX =
      this.shark.sprite.x +
      Math.cos(this.offsetAngle) * this.orbitRadius -
      this.shark.direction * this.followDistance;

    const targetY =
      this.shark.sprite.y +
      Math.sin(this.offsetAngle) * this.orbitRadius;

    /* ===============================
     * 부드럽게 따라가기 (LERP)
     * =============================== */
    this.sprite.x +=
      (targetX - this.sprite.x) * this.followSpeed * (delta / 16);
    this.sprite.y +=
      (targetY - this.sprite.y) * this.followSpeed * (delta / 16);

    /* ===============================
     * 살짝 회전 (살아있는 느낌)
     * =============================== */
    this.offsetAngle += 0.001 * delta;
  }
}

