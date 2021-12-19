import * as THREE from "../../js/lib/three/three.module.js";
import { GLTFLoader } from "../../js/lib/three/loaders/GLTFLoader.js";
import {
    scene,
    renderer,
    controls,
    camera,
    commons,
    game,
    bonusShip,
} from "../../main.js";
import { getRandomArbitrary } from "../RandomNumber.js"
import * as Sound from "../Sound.js";

export function initBonusShip() {
    if (bonusShip) return;
    let bonusRate = 0.2; 
    const rng = getRandomArbitrary(0, 100);
    if (rng <= bonusRate){
        console.log('bonus time!')
        return new BonusShip(commons.BOARD_MIN_X - commons.BOARD_MAX_X);
    } else {
        return null;
    }
}

export class BonusShip {
    constructor(positionX) {
        const { w, h, d } = { w: 20, h: 20, d: 20 };

        this.isLoaded = false;
        let loader = new GLTFLoader();
        let model_path = window.location.href + "/assets/gltf/bonus_ship/scene.gltf";
        loadModel(loader, model_path).then((gltf_scene) => {
            this.mesh = gltf_scene;
            scene.add(this.mesh);
            this.isLoaded = true;
        });

        this.width = w;
        this.height = h;
        this.depth = d;
        this.speedX = 1;

        function loadModel(loader, modelPath) {
            // model loader: low poly spaceship
            return new Promise((resolve, reject) => {
                //   const geometry = new THREE.BoxGeometry( w, h, d );
                //   const material = new THREE.MeshPhongMaterial({
                //       color: 0x4bff2b
                //   });
                //   let tempMesh = new THREE.Mesh( geometry, material );
                //   tempMesh.castShadow = true;
                //   tempMesh.receiveShadow = true;
                //   tempMesh.position.x = positionX;
                //   tempMesh.position.y = 100;
                //   tempMesh.position.z = commons.BOARD_MIN_Z;
                //   resolve(tempMesh);

                // gltf loader
                loader.load(modelPath, function (gltf) {
                        let model = gltf.scene;
                        model.scale.x = w / 15;
                        model.scale.y = h / 15;
                        model.scale.z = d / 15;
                        model.position.x = positionX;
                        model.position.y = 100;
                        model.position.z = 100;
                        model.rotation.y = Math.PI / 2; // rotasi 90
                        model.traverse((n) => {
                            if (n.isMesh) {
                                n.castShadow = true;
                                n.receiveShadow = true;
                                n.material.metalness = 0.25;
                                // n.geometry.computeBoundingBox();
                            }
                        });
                        resolve(model);
                    },
                    undefined,
                    (error) => {
                        console.error("An error happened.", error);
                        reject(error);
                    }
                );
            });
        }
        this.move = () => {
            this.mesh.position.x += this.speedX;
            if (this.mesh.position.x > commons.BOARD_MAX_X + commons.BOARD_MAX_X) {
                game.removeBonusShip();
                this.dispose();
            }
        };
        this.gotClick = () => {
            Sound.bonus();
            game.addPower();
            game.addScore(5000);
            this.dispose();
        };
        this.dispose = () => {
            scene.remove(this.mesh);
            // this.mesh.geometry.dispose();
            // this.mesh.material.dispose();
            renderer.renderLists.dispose();
        };
    }
}
