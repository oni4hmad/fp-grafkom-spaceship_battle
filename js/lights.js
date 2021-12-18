import * as THREE from "../node_modules/three/build/three.module.js";

export function addLight (scene) {
    // AmbientLight
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);
    // DirectionalLight
    const directionalLight = new THREE.PointLight(0xffffff, 1.0);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}