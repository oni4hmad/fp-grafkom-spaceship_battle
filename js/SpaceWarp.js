import { scene, renderer } from "../main.js";
import { commons, game } from "../main.js";
import * as THREE from "./lib/three/three.module.js";
import { GLTFLoader } from "../js/lib/three/loaders/GLTFLoader.js";

export let starGeometry, stars;

export function init() {
    starGeometry = new THREE.BufferGeometry();
    let vertices = [];
    for(let i = 0; i < 6000; i++) {
        // let star = new THREE.Vector3(
        //     Math.random() * 600 - 300,
        //     Math.random() * 600 - 300,
        //     Math.random() * 600 - 300
        // );
        let star = [
            Math.random() * 1000 - 500,
            Math.random() * 1000 - 500,
            Math.random() * 1000 - 500
        ];
        // star.velocity = 0;
        // star.acceleration = 0.02;
        vertices.push(...star);
    }

    starGeometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(vertices), 3 ) );
    let sprite = new THREE.TextureLoader().load('./assets/raw/star.png');
    let starMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.7,
        map: sprite
    });

    stars = new THREE.Points(starGeometry,starMaterial);
    scene.add(stars);
}

export function animate() {
    // starGeometry.vertices.forEach(p=>{
    //     p.velocity += p.acceleration;
    //     p.y -= p.velocity;
    //     if( p.y < -200) {
    //         p.y = 200;
    //         p.velocity = 0
    //     }
    // });
    // starGeometry.verticesNeedUpdate = true;
    // stars.rotation.y += 0.002;
    // stars.rotation.x = -1.5;
    stars.position.z += 0.5;
    stars.rotation.z += 0.001;
    if (stars.position.z > 500) {
        stars.position.z = -500;
    }
}