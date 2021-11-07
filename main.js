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
    BOARD_MIN_Z: -180
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
    constructor (width, height, depth) {
        const geometry = new THREE.BoxGeometry( width, height, depth );
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

        this.width = width;
        this.height = height;
        this.depth = depth;
        this.speed = 2;
        this.missiles = [];

        this.moveRight = false;
        this.moveLeft = false;

        this.initMissile = () => {
            const missile = new PlayerMissile(this.x, this.z - depth/2);
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
        this.dispose = () => {
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
    constructor (width, height, depth) {
        const geometry = new THREE.TorusKnotGeometry(25, 10);
        // const geometry = new THREE.BoxGeometry( width, height, depth );
        const material = new THREE.MeshPhongMaterial({
            color: 0x4bff2b
        });
        this.mesh = new THREE.Mesh( geometry, material );
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.z = -180;
        scene.add(this.mesh);

        this.boxHelper = new THREE.BoxHelper( this.mesh, 0xff0000 );
        scene.add(this.boxHelper);

        this.boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

        this.width = width;
        this.height = height;
        this.depth = depth;
        
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
                console.log(this.boundingBox.intersectsBox(anyObj.boundingBox));
                if (this.boundingBox.intersectsBox(anyObj.boundingBox)){
                    this.isAlive = false;
                    anyObj.dispose();
                    this.dispose();
                }
            })
        }
        this.reverseSpeed = () => {
            this.collide = false;
            this.speedX *= (-1);
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
            this.speedX *= (-1);
        } else if (this.mesh.position.x < commons.BOARD_MIN_X) {
            this.mesh.position.x = commons.BOARD_MIN_X
            this.speedX *= (-1);
        }
    }
    get x() {
        return this.mesh.position.x;
    }
    set z(updateZ) {
        this.mesh.position.z = updateZ;
        if (this.mesh.position.z > commons.BOARD_MAX_Z){
            this.mesh.position.z = commons.BOARD_MAX_Z
            this.speedZ *= (-1);
        } else if (this.mesh.position.z < commons.BOARD_MIN_Z) {
            this.mesh.position.z = commons.BOARD_MIN_Z
            this.speedZ *= (-1);
        }
    }
    get z() {
        return this.mesh.position.z;
    }
}

// implementation
let scene, camera, renderer, controls;
let sphere;
let player, alien;

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
        console.log("keydown", e.key, e.code);
    }, false);
    document.addEventListener("keyup", e => {
        if (e.code == "KeyA") {
            player.moveLeft = false;
        } else if (e.code == "KeyD") {
            player.moveRight = false;
        } else if (e.code == "Space") {
            player.initMissile();
        }
        console.log("keyup", e.key, e.code);
    }, false);

    // -----------------------------------

    // Object (Geometry)
    player = new Player(25, 25, 25);
    alien = new Alien(25, 25, 25);

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
    console.log(player.mesh);
}

// Render loop
const animate = function() {
    requestAnimationFrame(animate);

    player.move();
    player.missiles.forEach(m => m.move())
    if (alien.isAlive){
        alien.move();
        alien.checkCollide([...player.missiles, player]);
    }

    controls.update();
    renderer.render(scene, camera);
}

init();
animate();