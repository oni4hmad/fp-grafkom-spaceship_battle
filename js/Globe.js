import * as THREE from "../js/lib/three/three.module.js";
import { GLTFLoader } from "../js/lib/three/loaders/GLTFLoader.js";
import { scene, renderer, controls, camera } from "../main.js"

export class Globe {
    constructor(positionX, positionY, positionZ) {
      this.isLoaded = false;
        let loader = new GLTFLoader();
        let model_path = './assets/gltf/globe/scene.gltf';
        loadModel(loader, model_path).then(gltf_scene => {
            this.mesh = gltf_scene;
            scene.add(this.mesh);
            this.isLoaded = true;
        });
        
        function loadModel(loader, modelPath) {
            return new Promise((resolve, reject) => {
                loader.load(modelPath, function(gltf) {
                    let model = gltf.scene;
                    model.scale.x = 10;
                    model.scale.y = 10;
                    model.scale.z = 10;
                    model.position.x = positionX;
                    model.position.y = positionY - 500;
                    model.position.z = positionZ;
                    // model.rotation.y = Math.PI / 2; // rotasi 90d
                    model.traverse(n => { 
                        if ( n.isMesh ) {
                            n.castShadow = true; 
                            n.receiveShadow = true;
                            n.material.metalness = 0;
                        }
                    });
                    resolve(model);
                },
                undefined,
                error => {
                    console.error('An error happened.', error);
                    reject(error);
                });
            })
        }
    }
}