/**
 * BootScene
 * - 모든 에셋 로드
 * - 로딩 화면 표시
 * - 완료되면 OceanScene으로 이동
 */

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    /* ===============================
     * 로딩 텍스트
     * =============================== */
    const { width, height } = this.cameras.main;

    this.loadingText = this.add.text(
      width / 2,
      height / 2,
      "Loading...",
      {
        fontSize: "16px",
        color: "#88ccff"
      }
    ).setOrigin(0.5);

    /* ===============================
     * 로딩 진행률 표시
     * =============================== */
    this.load.on("progress", (value) => {
      this.loadingText.setText(
        `Loading... ${Math.floor(value * 100)}%`
      );
    });

    /* ===============================
     * 이미지 에셋
     * =============================== */
    this.load.image(
      "bg_day",
      "assets/images/environment/background_day.png"
    );

    this.load.image(
      "bg_night",
      "assets/images/environment/background_night.png"
    );

    this.load.image(
      "shark_base",
      "assets/images/shark/shark_base.png"
    );

    this.load.image(
      "shark_star",
      "assets/images/shark/shark_pattern_star.png"
    );

    this.load.image(
      "shark_trail",
      "assets/images/shark/shark_trail.png"
    );

    this.load.image(
      "fish_small",
      "assets/images/friends/fish_small.png"
    );

    this.load.image(
      "jellyfish",
      "assets/images/friends/jellyfish.png"
    );

    this.load.image(
      "baby_shark",
      "assets/images/friends/baby_shark.png"
    );

    /* ===============================
     * 사운드
     * =============================== */
    this.load.audio(
      "ambient_deep_sea",
      "assets/sounds/ambient/deep_sea_loop.mp3"
    );

    this.load.audio(
      "collect_soft",
      "assets/sounds/effects/collect_soft.wav"
    );

    /* ===============================
     * 파티클
     * =============================== */
    this.load.json(
      "glow_particle",
      "assets/particles/glow.json"
    );
  }

  create() {
    // 로딩 텍스트 제거
    this.loadingText.destroy();

    // 다음 씬으로 이동
    this.scene.start("OceanScene");
  }
}

