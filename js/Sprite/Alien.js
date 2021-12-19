import * as THREE from "../../js/lib/three/three.module.js";
import { GLTFLoader } from "../../js/lib/three/loaders/GLTFLoader.js";
import { scene, renderer } from "../../main.js"
import { commons,  game } from "../../main.js"
import { getRandomArbitrary } from "../RandomNumber.js"
import * as Sound from "../Sound.js"

export class Alien {
    constructor (positionX, positionZ) {
        const { w, h, d } = {w: commons.ALIEN_WIDTH, h: commons.ALIEN_HEIGHT, d: commons.ALIEN_DEPTH};
        
        this.isLoaded = false;
        let loader = new GLTFLoader();
        // let model_path = './../assets/gltf/player/blender/alien ship/scene.gltf';
        let model_path = window.location.href + '/assets/gltf/alien/scene.gltf';
        loadModel(loader, model_path).then(gltf_scene => {
            this.mesh = gltf_scene;    
            scene.add(this.mesh);
            // this.boxHelper = new THREE.BoxHelper( this.mesh, 0xff0000 );
            // scene.add(this.boxHelper);

            // load sound
            // this.sound_dead = new Sound('../../assets/sounds/hitmarkerSound.wav');
            // this.sound_shoot = new Sound('../../assets/sounds/alienBeam.wav');

            this.isLoaded = true;
        });

        this.boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

        this.width = w;
        this.height = h;
        this.depth = d;

        this.speedX = 1;
        this.speedZ = 0.1;
        this.moveLeft = this.speedX < 0;
        this.moveRight = this.speedX > 0;
        this.missiles = [];

        this.isAlive = true;
        this.missileRate = 0.025 + (game.level * 0.015); // % rate
        this.maxMissile = 1 + Math.floor(game.level/2);

        function loadModel(loader, modelPath) {
            // model loader: low poly alien spaceship
            return new Promise((resolve, reject) => {
                // const geometry = new THREE.BoxGeometry( w, h, d );
                // const material = new THREE.MeshPhongMaterial({
                //     color: 0x4bff2b
                // });
                // let tempMesh = new THREE.Mesh( geometry, material );
                // tempMesh.castShadow = true;
                // tempMesh.receiveShadow = true;
                // tempMesh.position.x = positionX;
                // tempMesh.position.z = positionZ;
                // resolve(tempMesh);

                loader.load(modelPath, function(gltf) {
                    let model = gltf.scene;
                    model.scale.x = w/20;
                    model.scale.y = h/20;
                    model.scale.z = d/20;
                    model.position.x = positionX;
                    model.position.z = positionZ;
                    model.traverse(n => { 
                        if ( n.isMesh ) {
                            n.castShadow = true; 
                            n.receiveShadow = true;
                            n.material.metalness = .1;
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
        const reduceRotation = () => {
            if (this.mesh.rotation.z < 0) {
                this.mesh.rotation.z += 0.1;
                if (this.mesh.rotation.z > 0)
                    this.mesh.rotation.z = 0;
            } else {
                this.mesh.rotation.z -= 0.1;
                if (this.mesh.rotation.z < 0)
                    this.mesh.rotation.z = 0;
            }
        }
        this.move = () => {
            if (this.moveRight) {
                this.mesh.rotation.z -= 0.05;
                if (this.mesh.rotation.z < -Math.PI/4)
                    this.mesh.rotation.z = -Math.PI/4;
            }
            else if (this.moveLeft) {
                this.mesh.rotation.z += 0.05;
                if (this.mesh.rotation.z > Math.PI/4)
                    this.mesh.rotation.z = Math.PI/4;
            }
            else if (this.mesh.rotation.z != 0) {
                reduceRotation();
            }

            this.x += this.speedX;
            this.z += this.speedZ;
            // this.boxHelper.update();
            this.boundingBox.setFromObject(this.mesh);
        }
        this.initMissile = () => {
            if (this.missiles.length < this.maxMissile) {    
                const rng = getRandomArbitrary(0, 100);
                if (rng <= this.missileRate){
                    const missile = new AlienMissile(this, this.x, this.z + this.depth/2);
                    this.missiles.push(missile);
                    Sound.alien_beam();
                }
            }
        }
        this.moveMissile = () => {
            if (this.missiles.length >= 1) {
                this.missiles.forEach(m => m.move())
            }
        }
        this.removeMissile = (missile) => {
            let index = this.missiles.indexOf(missile);
            if (index > -1) this.missiles.splice(index, 1);
        }
        this.checkCollide = objectList => {
            objectList.forEach(anyObj => {
                if (this.boundingBox.intersectsBox(anyObj.boundingBox)){
                    game.addScore();
                    this.isAlive = false;
                    anyObj.dispose();
                    this.dispose();
                }
            })
        }
        this.setMoveToLeft = () => {
            this.speedX = Math.abs(this.speedX) * (-1);
            this.moveLeft = this.speedX < 0;
            this.moveRight = this.speedX > 0;
        }
        this.setMoveToRight = () => {
            this.speedX = Math.abs(this.speedX);
            this.moveLeft = this.speedX < 0;
            this.moveRight = this.speedX > 0;
        }
        this.dispose = () => {
            this.isAlive = false;
            // remove all missiles
            while (this.missiles.length)
                this.missiles.pop().dispose()
            // remove alien from scene
            scene.remove(this.boxHelper);
            scene.remove(this.mesh);
            // this.mesh.geometry.dispose();
            // this.mesh.material.dispose();
            renderer.renderLists.dispose();
            // this.sound_dead.play();
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
        if (this.mesh.position.z > commons.BOARD_MAX_Z - commons.ALIEN_DEPTH/2){
            game.gameOver();
            this.dispose();
            console.log("Alien invasion!")
        } else if (this.mesh.position.z < commons.BOARD_MIN_Z) {
            this.mesh.position.z = commons.BOARD_MIN_Z
        }
    }
    get z() {
        return this.mesh.position.z;
    }
}

class AlienMissile {
    constructor (alien, positionX, positionZ) {
        const { w, h, d } = {w: 2, h: 2, d: 15};
        const geometry = new THREE.BoxGeometry( w, h, d );
        const material = new THREE.MeshPhongMaterial({
            color: 0xff0000
        });
        this.mesh = new THREE.Mesh( geometry, material );
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.x = positionX;
        this.mesh.position.z = positionZ;
        scene.add(this.mesh);

        this.boxHelper = new THREE.BoxHelper( this.mesh, 0xeb4034 );
        scene.add(this.boxHelper);

        this.boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        
        // missile owner
        this.alien = alien;

        this.width = w;
        this.height = h;
        this.depth = d;
        this.speedZ = +3;

        this.move = () => {
            this.z += this.speedZ;
            this.boxHelper.update();
            this.boundingBox.setFromObject(this.mesh);
        }
        this.dispose = () => {
            // remove missile from alien
            this.alien.removeMissile(this);
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
        if (this.mesh.position.z > commons.BOARD_MAX_Z) {
            this.dispose();
        }
    }
    get z() {
        return this.mesh.position.z;
    }
}