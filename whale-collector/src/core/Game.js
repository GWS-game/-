import { Config } from "./Config.js";

import { BootScene } from "../scenes/BootScene.js";
import { OceanScene } from "../scenes/OceanScene.js";
import { NightScene } from "../scenes/NightScene.js";

/**
 * 게임 전체를 초기화하고
 * 씬 흐름만 정의하는 파일
 * (로직 절대 금지)
 */

const gameConfig = {
  type: Phaser.AUTO,

  width: Config.screen.width,
  height: Config.screen.height,
  backgroundColor: Config.screen.backgroundColor,

  parent: null, // body에 자동 삽입

  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  physics: {
    default: "arcade",
    arcade: {
      debug: Config.debug.showHitbox
    }
  },

  scene: [
    BootScene,
    OceanScene,
    NightScene
  ]
};

// 게임 인스턴스 생성
new Phaser.Game(gameConfig);

