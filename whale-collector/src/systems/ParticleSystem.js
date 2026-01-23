export class ParticleSystem {
  static update(scene, shark, delta) {
    if (!shark || !shark.sprite) return;

    // 너무 자주 생성하지 않도록 시간 체크
    if (!shark.lastTrailTime) {
      shark.lastTrailTime = 0;
    }

    shark.lastTrailTime += delta;

    if (shark.lastTrailTime < 120) return;
    shark.lastTrailTime = 0;

    const sprite = shark.sprite;

    /* ===============================
     * 트레일 위치 계산
     * =============================== */
    const offsetX = shark.direction === 1 ? -40 : 40;

    const trail = scene.add.image(
      sprite.x + offsetX,
      sprite.y,
      "shark_trail"
    );

    /* ===============================
     * 트레일 기본 설정
     * =============================== */
    trail.setScale(0.6);
    trail.setAlpha(0.35);
    trail.setDepth(0);

    /* ===============================
     * 자연스럽게 사라지게
     * =============================== */
    scene.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 0.3,
      duration: 800,
      ease: "Sine.easeOut",
      onComplete: () => {
        trail.destroy();
      }
    });
  }
}

