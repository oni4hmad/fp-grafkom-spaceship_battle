import * as THREE from "./lib/three/three.module.js";

export function addLight (scene) {
    // AmbientLight
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);
    // DirectionalLight
    const directionalLight = new THREE.PointLight(0xffffff, 1.0);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    // HemispehreLight
    const hemisphereLight = new THREE.HemisphereLight( 0xFFFFFF, 0x00CCFF, 0.5 );
    scene.add(hemisphereLight);
}
