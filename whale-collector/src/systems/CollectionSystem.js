import { Fish } from "../entities/Fish.js";

export class CollectionSystem {
  static init(scene, shark) {
    scene.friends = [];
    scene.collectionTimer = 0;

    // 첫 친구는 이미 있을 수도 있으니 배열에 넣어둔다
    if (scene.fish) {
      scene.friends.push(scene.fish);
    }

    scene.shark = shark;
  }

  static update(scene, delta) {
    if (!scene.shark) return;

    scene.collectionTimer += delta;

    // 5초마다 한 마리 추가
    if (scene.collectionTimer < 5000) return;
    scene.collectionTimer = 0;

    CollectionSystem.addFish(scene);
  }

  static addFish(scene) {
    const fish = new Fish(scene, scene.shark);
    scene.friends.push(fish);
  }
}

