import * as THREE from "../../js/lib/three/three.module.js";
import { GLTFLoader } from "../../js/lib/three/loaders/GLTFLoader.js";
import { scene, renderer, controls, camera } from "../../main.js"
import { commons, game } from "../../main.js"
import * as Sound from "../Sound.js"

export class Player {
    constructor (positionX = 0, cTargetX = 0) {
        const { w, h, d } = {w: commons.PLAYER_WIDTH, h: commons.PLAYER_HEIGHT, d: commons.PLAYER_DEPTH};

        this.isLoaded = false;
        let loader = new GLTFLoader();
        let model_path = window.location.href + '/assets/gltf/player/spaceship.gltf';
        loadModel(loader, model_path).then(gltf_scene => {
            this.mesh = gltf_scene;    
            scene.add(this.mesh);
            // this.boxHelper = new THREE.BoxHelper( this.mesh, 0xff0000 );
            // scene.add(this.boxHelper);
            
            // load sound
            // this.sound_gameOver = new Sound('../../assets/sounds/deathSound.wav');
            // this.sound_getDamage = new Sound('../../assets/sounds/damageSound.wav')
            // this.sound_levelUp = new Sound('../../assets/sounds/levelUpSound.wav');

            this.isLoaded = true;
        });

        this.boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

        this.width = w;
        this.height = h;
        this.depth = d;

        this.speed = 3;
        this.health = 3;
        game.updateHealth(this.health);
        
        this.missiles = [];
        this.maxMissile = 2 + game.level;
        this.isPowered = false;

        this.moveRight = false;
        this.moveLeft = false;

        this.isAlive = true;

        function loadModel(loader, modelPath) {
            // model loader: low poly spaceship
            return new Promise((resolve, reject) => {
                // const geometry = new THREE.BoxGeometry( w, h, d );
                // const material = new THREE.MeshPhongMaterial({
                //     color: 0x4bff2b
                // });
                // let tempMesh = new THREE.Mesh( geometry, material );
                // tempMesh.castShadow = true;
                // tempMesh.receiveShadow = true;
                // tempMesh.position.x = 0;
                // tempMesh.position.z = commons.BOARD_MAX_Z;
                // resolve(tempMesh);

                loader.load(modelPath, function(gltf) {
                    let model = gltf.scene;
                    model.scale.x = w/75;
                    model.scale.y = h/75;
                    model.scale.z = d/75;
                    model.position.z = commons.BOARD_MAX_Z;
                    model.position.x = positionX;
                    camera.position.x = positionX;
                    controls.target.x = cTargetX;
                    // model.rotation.y = Math.PI / 2; // rotasi 90d
                    model.traverse(n => { 
                        if ( n.isMesh ) {
                            n.castShadow = true; 
                            n.receiveShadow = true;
                            n.material.metalness = 0.25;
                            // n.geometry.computeBoundingBox();
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
        this.initMissile = () => {
            if ((this.missiles.length < this.maxMissile) || this.isPowered) {
                if (this.isPowered) {
                    this.missiles.push(new PlayerMissile(this, this.x - 10, this.z - this.depth/2 + 5));
                    this.missiles.push(new PlayerMissile(this, this.x, this.z - this.depth/2));
                    this.missiles.push(new PlayerMissile(this, this.x + 10, this.z - this.depth/2 + 5));
                } else {
                    const missile = new PlayerMissile(this, this.x, this.z - this.depth/2);
                    this.missiles.push(missile);
                }
                Sound.player_bullet();
            }
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
            if (this.moveRight && this.moveLeft) {
                reduceRotation();
            }
            else if (this.moveRight) {
                this.x += this.speed;
                this.mesh.rotation.z -= 0.1;
                camera.rotation.z -= 1;
                if (this.mesh.rotation.z < -Math.PI/4) {
                    this.mesh.rotation.z = -Math.PI/4;
                }
                if (this.x < commons.BOARD_MAX_X) {
                    camera.position.x += this.speed;
                    controls.target.x += this.speed-0.7;
                }
            }
            else if (this.moveLeft) {
                this.x -= this.speed;
                this.mesh.rotation.z += 0.1;
                if (this.mesh.rotation.z > Math.PI/4)
                    this.mesh.rotation.z = Math.PI/4;
                if (this.x > commons.BOARD_MIN_X) {
                    camera.position.x -= this.speed;
                    controls.target.x -= this.speed-0.7;
                }
            }
            else if (this.mesh.rotation.z != 0) {
                reduceRotation();
            }
            // this.boxHelper.update();
            this.boundingBox.setFromObject(this.mesh);
        }
        this.removeMissile = (missile) => {
            let index = this.missiles.indexOf(missile);
            if (index > -1) this.missiles.splice(index, 1);
        }
        this.checkCollide = objectList => {
            objectList.forEach(anyObj => {
                if (this.boundingBox.intersectsBox(anyObj.boundingBox)){
                    anyObj.dispose();
                    gotAttack();
                }
            })
        }
        const gotAttack = (damage = 1) => {
            Sound.damage();
            this.health -= damage;
            game.updateHealth(this.health);
            console.log(`Player Health: ${this.health}`)
            if (this.health <= 0) {
                this.isAlive = false;
                this.dispose();
            }
        }
        this.dispose = (isReload = false) => {
            if (!isReload) {
                game.gameOver();
                // this.sound_gameOver.play();
            } else {
                // this.sound_levelUp.play();
            }
            // remove all missiles
            while (this.missiles.length)
                this.missiles.pop().dispose()
            // remove player from scene
            scene.remove(this.boxHelper);
            scene.remove(this.mesh);
            // this.mesh.geometry.dispose();
            // this.mesh.material.dispose();
            renderer.renderLists.dispose();
            console.log("Player Disposed.")
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
    set z(updateZ) {
        this.mesh.position.z = updateZ;
        if (this.mesh.position.z > commons.BOARD_MAX_Z)
            this.mesh.position.z = commons.BOARD_MAX_Z
        else if (this.mesh.position.z < commons.BOARD_MIN_Z)
            this.mesh.position.z = commons.BOARD_MIN_Z
    }
    get z() {
        return this.mesh.position.z;
    }
}

class PlayerMissile {
    constructor (player, positionX, positionZ) {
        const { w, h, d } = {w: 2.5, h: 2.5, d: 15};
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

        // this.boxHelper = new THREE.BoxHelper( this.mesh, 0xff0000 );
        // scene.add(this.boxHelper);

        this.boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

        // missile owner
        this.player = player;

        this.width = w;
        this.height = h;
        this.depth = d;
        this.speedZ = -10;

        this.move = () => {
            this.z += this.speedZ;
            // this.boxHelper.update();
            // this.mesh.geometry.computeBoundingBox();
            this.boundingBox.setFromObject(this.mesh);
        }
        this.checkCollide = objectList => {
            objectList.forEach(anyObj => {
                if (this.boundingBox.intersectsBox(anyObj.boundingBox)){
                    anyObj.dispose();
                    this.dispose();
                }
            })
        }
        this.dispose = () => {
            // remove missile from player
            this.player.removeMissile(this);
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