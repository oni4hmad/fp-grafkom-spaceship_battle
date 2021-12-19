import * as THREE from "../../js/lib/three/three.module.js";
import { GLTFLoader } from "../../js/lib/three/loaders/GLTFLoader.js";
import { scene, renderer } from "../../main.js"
import { commons,  game } from "../../main.js"
import { getRandomArbitrary, randomInt } from "../RandomNumber.js"
import * as Sound from "../Sound.js"

export class Boss {
    constructor (positionX, positionZ) {
        const { w, h, d } = {w: commons.BOSS_WIDTH, h: commons.BOSS_HEIGHT, d: commons.BOSS_DEPTH};
        
        this.isLoaded = false;
        let loader = new GLTFLoader();
        // let model_path = '../../assets/gltf/boss/scene.gltf';
        let model_path = window.location.href + '/assets/gltf/boss/scene.gltf';
        loadModel(loader, model_path).then(gltf_scene => {
            this.mesh = gltf_scene;    
            scene.add(this.mesh);
            // this.boxHelper = new THREE.BoxHelper( this.mesh, 0xff0000 );
            // scene.add(this.boxHelper);

            this.isLoaded = true;
            Sound.boss();
        });

        this.boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

        this.width = w;
        this.height = h;
        this.depth = d;

        this.speedX = 1;
        this.speedZ = 0.1;
        this.missiles = [];
        this.health = 7.5 * game.level;
        document.getElementById("bosshealth").style.display = "block";
        document.getElementById("boss-health-value").innerHTML = this.health;

        this.isAlive = true;
        this.missileRate = game.level * 3; // % rate
        this.maxMissile = 5 * Math.floor(game.level/2);
        this.zOffset = 180;

        function loadModel(loader, modelPath) {
            // model loader
            return new Promise((resolve, reject) => {
                // const geometry = new THREE.BoxGeometry( w, h, d );
                // const material = new THREE.MeshPhongMaterial({
                //     color: 0xf500bc
                // });
                // let tempMesh = new THREE.Mesh( geometry, material );
                // tempMesh.castShadow = true;
                // tempMesh.receiveShadow = true;
                // tempMesh.position.x = positionX;
                // tempMesh.position.z = positionZ;
                // resolve(tempMesh);

                loader.load(modelPath, function(gltf) {
                    let model = gltf.scene;
                    model.scale.x = w/5;
                    model.scale.y = h/5;
                    model.scale.z = d/5;
                    model.position.z = positionZ-100;
                    model.position.x = positionX;
                    // model.rotation.y = Math.PI / 2; // rotasi 90d
                    model.traverse(n => { 
                        if ( n.isMesh ) {
                            n.castShadow = true; 
                            n.receiveShadow = true;
                            n.material.metalness = 0;
                            n.geometry.computeBoundingBox();
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
        this.move = () => {
            this.x += this.speedX;
            this.z += this.speedZ;
            // this.boxHelper.update();
            // this.mesh.geometry.computeBoundingBox();
            this.boundingBox.setFromObject(this.mesh);
        }
        this.initMissile = () => {
            if (this.missiles.length < this.maxMissile) {    
                const rng = getRandomArbitrary(0, 100);
                if (rng <= this.missileRate){
                    const rng2 = randomInt(0, 2);
                    switch(rng2) {
                        case 0:
                            this.missiles.push(new BossMissile(this, this.x, this.z + this.depth/2, true, false));
                            break;
                        case 1:
                            this.missiles.push(new BossMissile(this, this.x, this.z + this.depth/2, false, true));
                            break;
                        case 2:
                            this.missiles.push(new BossMissile(this, this.x, this.z + this.depth/2));
                            break;
                    }
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
                    anyObj.dispose();
                    gotAttack();
                }
            })
        }
        const gotAttack = (damage = 1) => {
            this.health -= damage;
            document.getElementById("boss-health-value").innerHTML = this.health;
            console.log(`Boss Health: ${this.health}`)
            if (this.health <= 0) {
                died()
            }
        }
        const died = () => {
            game.levelUp();
            this.dispose();
        }
        this.setMoveToLeft = () => {
            this.speedX = Math.abs(this.speedX) * (-1);
        }
        this.setMoveToRight = () => {
            this.speedX = Math.abs(this.speedX);
        }
        this.dispose = () => {
            document.getElementById("bosshealth").style.display = "none";
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
            console.log("alien take over you!")
        } else if (this.mesh.position.z < commons.BOARD_MIN_Z-this.zOffset) {
            this.mesh.position.z = commons.BOARD_MIN_Z
        }
    }
    get z() {
        return this.mesh.position.z;
    }
}

class BossMissile {
    constructor (alien, positionX, positionZ, typeL = false, typeR = false) {
        const { w, h, d } = {w: 2, h: 2, d: 15};
        const geometry = new THREE.BoxGeometry( w, h, d );
        const material = new THREE.MeshPhongMaterial({
            color: 0xebbd34
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
        
        // missile owner
        this.alien = alien;

        this.width = w;
        this.height = h;
        this.depth = d;
        this.speedZ = +5;
        this.speedX = typeL ? -5 : (typeR ? +5 : 0);

        this.move = () => {
            this.z += this.speedZ;
            this.x += this.speedX;
            this.boxHelper.update();
            // this.mesh.geometry.computeBoundingBox();
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
    set x(updateX) {
        this.mesh.position.x = updateX;
        if (this.mesh.position.x > commons.BOARD_MAX_X) {
            this.mesh.position.x = commons.BOARD_MAX_X;
            this.speedX = Math.abs(this.speedX) * (-1);
        } else if (this.mesh.position.x < commons.BOARD_MIN_X) {
            this.mesh.position.x = commons.BOARD_MIN_X;
            this.speedX = Math.abs(this.speedX);
        }
    }
    get x() {
        return this.mesh.position.x;
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