export class Jellyfish {
  constructor(scene, target) {
    this.scene = scene;
    this.target = target;

    // 기본 위치 (고래상어 근처)
    this.angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.radius = 90;

    const x = target.x + Math.cos(this.angle) * this.radius;
    const y = target.y + Math.sin(this.angle) * this.radius;

    this.sprite = scene.add.sprite(x, y, "jellyfish");
    this.sprite.setScale(0.6);
    this.sprite.setAlpha(0.85);
    this.sprite.setDepth(5);

    /* ===============================
     * 부유 파라미터
     * =============================== */
    this.floatOffset = Phaser.Math.FloatBetween(0, 1000);
    this.floatSpeed = 0.0015;

    /* ===============================
     * 빛 효과 (블렌드)
     * =============================== */
    this.sprite.setBlendMode(Phaser.BlendModes.ADD);
  }

  update(delta) {
    this.angle += 0.0006 * delta;

    const baseX =
      this.target.x + Math.cos(this.angle) * this.radius;
    const baseY =
      this.target.y + Math.sin(this.angle) * this.radius;

    // 위아래 부유
    this.floatOffset += delta;
    const floatY = Math.sin(this.floatOffset * this.floatSpeed) * 12;

    this.sprite.x = Phaser.Math.Linear(
      this.sprite.x,
      baseX,
      0.05
    );
    this.sprite.y = Phaser.Math.Linear(
      this.sprite.y,
      baseY + floatY,
      0.05
    );
  }
}

