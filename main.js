import * as THREE from "./node_modules/three/build/three.module.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "./node_modules/three/examples/jsm/libs/dat.gui.module.js";

import { addLight } from "./js/lights.js"

// Commons
const commons = Object.freeze ({
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

class PlayerMissile {
    constructor (positionX, positionZ) {
        const { w, h, d } = {w: 5, h: 5, d: 5};
        const geometry = new THREE.BoxGeometry( w, h, d );
        const material = new THREE.MeshPhongMaterial({
            color: 0xffff00
        });
        this.mesh = new THREE.Mesh( geometry, material );
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.x = positionX;
        this.mesh.position.z = positionZ;
        scene.add(this.mesh);

        this.boxHelper = new THREE.BoxHelper( this.mesh, 0xff0000 );
        scene.add(this.boxHelper);

        this.boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

        this.width = w;
        this.height = h;
        this.depth = d;
        this.speedZ = -5;

        this.move = () => {
            this.z += this.speedZ;
            this.boxHelper.update();
            this.mesh.geometry.computeBoundingBox();
            this.boundingBox.setFromObject(this.mesh);
        }
        this.dispose = () => {
            // remove missile from player
            player.removeMissile(this);
            // remove missile from scene
            scene.remove(this.boxHelper);
            scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            renderer.renderLists.dispose();
        }
    }
    set z(updateZ) {
        this.mesh.position.z = updateZ;
        if (this.mesh.position.z < commons.BOARD_MIN_Z) {
            this.dispose();
        }
    }
    get z() {
        return this.mesh.position.z;
    }
}

// Player class
class Player {
    constructor () {
        const { w, h, d } = {w: commons.PLAYER_WIDTH, h: commons.PLAYER_HEIGHT, d: commons.PLAYER_DEPTH};
        const geometry = new THREE.BoxGeometry( w, h, d );
        const material = new THREE.MeshPhongMaterial({
            color: 0x0fd7ff
        });
        this.mesh = new THREE.Mesh( geometry, material );
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.z = 180;
        scene.add(this.mesh);

        this.boxHelper = new THREE.BoxHelper( this.mesh, 0xff0000 );
        scene.add(this.boxHelper);

        this.boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

        this.width = w;
        this.height = h;
        this.depth = d;

        this.speed = 2;
        this.missiles = [];
        this.health = 3;

        this.moveRight = false;
        this.moveLeft = false;

        this.isAlive = true;

        this.initMissile = () => {
            const missile = new PlayerMissile(this.x, this.z - this.depth/2);
            this.missiles.push(missile);
        }
        this.move = () => {
            if (this.moveRight && this.moveLeft)
                return;
            else if (this.moveRight)
                this.x += this.speed;
            else if (this.moveLeft)
                this.x -= this.speed;
            this.boxHelper.update();
            this.mesh.geometry.computeBoundingBox();
            this.boundingBox.setFromObject(this.mesh);
        }
        this.removeMissile = (missile) => {
            let index = player.missiles.indexOf(missile);
            if (index > -1) player.missiles.splice(index, 1);
        }
        this.attack = () => {

        }
        this.gameOver = () => {
            console.log("Game Over!")
        }
        this.dispose = () => {
            if (this.isAlive)
                this.gameOver();
            this.isAlive = false;
            player.missiles.forEach(m => m.dispose());
            scene.remove(this.boxHelper);
            scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            renderer.renderLists.dispose();
        }
    }
    set x(updateX) {
        this.mesh.position.x = updateX;
        if (this.mesh.position.x > commons.BOARD_MAX_X)
            this.mesh.position.x = commons.BOARD_MAX_X
        else if (this.mesh.position.x < commons.BOARD_MIN_X)
            this.mesh.position.x = commons.BOARD_MIN_X
    }
    get x() {
        return this.mesh.position.x;
    }
    get z() {
        return this.mesh.position.z;
    }
}

// Alien class
class Alien {
    constructor (positionX, positionZ) {
        const { w, h, d } = {w: commons.ALIEN_WIDTH, h: commons.ALIEN_HEIGHT, d: commons.ALIEN_DEPTH};
        // const geometry = new THREE.TorusKnotGeometry(25, 10);
        const geometry = new THREE.BoxGeometry( w, h, d );
        const material = new THREE.MeshPhongMaterial({
            color: 0x4bff2b
        });
        this.mesh = new THREE.Mesh( geometry, material );
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.x = positionX;
        this.mesh.position.z = positionZ;
        scene.add(this.mesh);

        this.boxHelper = new THREE.BoxHelper( this.mesh, 0xff0000 );
        scene.add(this.boxHelper);

        this.boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

        this.width = w;
        this.height = h;
        this.depth = d;

        this.speedX = 1;
        this.speedZ = 0.1;

        this.isAlive = true;

        this.move = () => {
            this.x += this.speedX;
            this.z += this.speedZ;
            this.boxHelper.update();
            this.mesh.geometry.computeBoundingBox();
            this.boundingBox.setFromObject(this.mesh);
        }
        this.checkCollide = objectList => {
            objectList.forEach(anyObj => {
                if (this.boundingBox.intersectsBox(anyObj.boundingBox)){
                    this.isAlive = false;
                    anyObj.dispose();
                    this.dispose();
                }
            })
        }
        this.setMoveToLeft = () => {
            this.speedX = Math.abs(this.speedX) * (-1);
        }
        this.setMoveToRight = () => {
            this.speedX = Math.abs(this.speedX);
        }
        this.dispose = () => {
            // remove alien from scene
            scene.remove(this.boxHelper);
            scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            renderer.renderLists.dispose();
        }
    }
    set x(updateX) {
        this.mesh.position.x = updateX;
        if (this.mesh.position.x > commons.BOARD_MAX_X) {
            this.mesh.position.x = commons.BOARD_MAX_X
            // this.setMoveToLeft()
        } else if (this.mesh.position.x < commons.BOARD_MIN_X) {
            this.mesh.position.x = commons.BOARD_MIN_X
            // this.setMoveToRight()
        }
    }
    get x() {
        return this.mesh.position.x;
    }
    set z(updateZ) {
        this.mesh.position.z = updateZ;
        if (this.mesh.position.z > commons.BOARD_MAX_Z - commons.PLAYER_DEPTH/2){
            player.dispose();
            this.dispose();
        } else if (this.mesh.position.z < commons.BOARD_MIN_Z) {
            this.mesh.position.z = commons.BOARD_MIN_Z
        }
    }
    get z() {
        return this.mesh.position.z;
    }
}

// implementation
let scene, camera, renderer, controls;
let player, aliens = [];

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
    const gui = new dat.GUI()
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
            alien.mesh.rotation.x += 0.04;
            alien.mesh.rotation.y += 0.04;
            alien.checkCollide([...player.missiles, player]);
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

    controls.update();
    renderer.render(scene, camera);
}

init();
animate();