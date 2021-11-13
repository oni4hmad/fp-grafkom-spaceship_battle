import * as THREE from "./node_modules/three/build/three.module.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "./node_modules/three/examples/jsm/libs/dat.gui.module.js";

import { addLight } from "./js/lights.js"
import { Player } from "./js/Sprite/Player.js"
import { Alien } from "./js/Sprite/Alien.js"

// Commons
export const commons = Object.freeze ({
    BOARD_MAX_X: 180,
    BOARD_MIN_X: -180,
    BOARD_MAX_Z: 180,
    BOARD_MIN_Z: -180,
    
    ALIEN_WIDTH: 20,
    ALIEN_HEIGHT: 20,
    ALIEN_DEPTH: 20,

    PLAYER_WIDTH: 20,
    PLAYER_HEIGHT: 20,
    PLAYER_DEPTH: 20,
})

// implementation
export let scene, camera, renderer, controls;
let player, aliens = [];
let gui;

let init = function () {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.y = 145;
    camera.position.z = 275;

    // Renderer
    renderer = new THREE.WebGLRenderer({alpha: false});
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Resize Event
    window.addEventListener('resize', () =>
    {
        // Update camera
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        // Update renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    })

    // Keyboard Event Listener
    document.addEventListener("keydown", e => {
        if (e.code == "KeyA") {
            player.moveLeft = true;
        } else if (e.code == "KeyD") {
            player.moveRight = true;
        }
    });
    document.addEventListener("keyup", e => {
        if (e.code == "KeyA") {
            player.moveLeft = false;
        } else if (e.code == "KeyD") {
            player.moveRight = false;
        } else if (e.code == "Space") {
            player.initMissile();
        }
    });

    // -----------------------------------

    // Object (Geometry)
    player = new Player();

    const alien_row = 5;
    const alien_col = 11;
    const distance = 10;
    for(let i = 0; i < alien_row; i++) {
        for(let j = 0; j < alien_col; j++) {
            aliens.push(new Alien((commons.ALIEN_WIDTH * j + distance * j) + commons.BOARD_MIN_X, (commons.ALIEN_DEPTH * i + distance * i) + + commons.BOARD_MIN_Z));
        }
    }

    // Light
    addLight(scene);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 1;
    controls.maxDistance = 1000;

    // Helper
    const gridHelper = new THREE.GridHelper( 400, 40, 0x0000ff, 0x808080 );
    gridHelper.position.y = 0;
    gridHelper.position.x = 0;
    scene.add( gridHelper );

    // Dat GUI
    gui = new dat.GUI()
    let guiFolder = gui.addFolder('Camera Adjustment')
    guiFolder.add(camera.position, 'x', -500, 500)
    guiFolder.add(camera.position, 'y', -500, 500)
    guiFolder.add(camera.position, 'z', -500, 500)
    guiFolder.open()
    guiFolder = gui.addFolder('Player Adjustment')
    guiFolder.add(player, 'x', -500, 500)
    guiFolder.add(player.mesh.position, 'z', -500, 500)
    guiFolder.open()

    // Debug
    console.log(aliens.at(-1));
}

// Render loop
let fps = 60;
const animate = function() {
    setTimeout( function() {
        if (player.isAlive)
            requestAnimationFrame( animate );
    }, 1000 / fps );

    player.move();
    player.missiles.forEach(m => m.move())
    aliens.forEach(alien => {
        if (alien.isAlive){
            alien.move();
            alien.initMissile();
            alien.moveMissile();
            alien.mesh.rotation.x += 0.04;
            alien.mesh.rotation.y += 0.04;
            alien.checkCollide([...player.missiles, player]);
            player.checkCollide([...alien.missiles])

            // let isStartCollide = (player.missiles.length > 0) && (aliens.at(-1).z + aliens.at(-1).depth/2 >= player.missiles.at(0).z + player.missiles.at(0).depth/2);
            // if (isStartCollide) {
            // }
        }
    })
    for (let alien of aliens) {
        if (alien.x >= commons.BOARD_MAX_X) {
            aliens.forEach(a => a.setMoveToLeft())
            break;
        } else if (alien.x <= commons.BOARD_MIN_X) {
            aliens.forEach(a => a.setMoveToRight())
            break;
        }
    }

    gui.updateDisplay();

    controls.update();
    renderer.render(scene, camera);
}

init();
animate();