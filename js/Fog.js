import * as THREE from "./lib/three/three.module.js";
import { scene, renderer, controls, camera } from "../main.js"

export function fogBoss() {
  let near = 500;
  let far = 700;
  scene.fog = new THREE.Fog(0x020029, near, far);
}

export function fogAlien() {
  let near = 300;
  let far = 600;
  scene.fog = new THREE.Fog(0x020029, near, far);
}