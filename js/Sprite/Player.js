import * as THREE from "../../node_modules/three/build/three.module.js";
import { scene, renderer } from "../../main.js"
import { commons, game } from "../../main.js"

export class Player {
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

        this.speed = 3;
        this.health = 3;
        this.missiles = [];
        this.maxMissile = game.level;

        this.moveRight = false;
        this.moveLeft = false;

        this.isAlive = true;

        this.initMissile = () => {
            if (this.missiles.length < this.maxMissile) {    
                const missile = new PlayerMissile(this, this.x, this.z - this.depth/2);
                this.missiles.push(missile);
            }
        }
        this.move = () => {
            if (this.moveRight && this.moveLeft)
                return;
            else if (this.moveRight)
                this.x += this.speed;
            else if (this.moveLeft)
                this.x -= this.speed;
            this.boxHelper.update();
            // this.mesh.geometry.computeBoundingBox();
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
            this.health -= damage;
            console.log(`Player Health: ${this.health}`)
            if (this.health <= 0) {
                this.dispose();
            }
        }
        this.dispose = () => {
            game.gameOver();
            this.isAlive = false;
            // remove all missiles
            while (this.missiles.length)
                this.missiles.pop().dispose()
            // remove player from scene
            scene.remove(this.boxHelper);
            scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
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

        // missile owner
        this.player = player;

        this.width = w;
        this.height = h;
        this.depth = d;
        this.speedZ = -5;

        this.move = () => {
            this.z += this.speedZ;
            this.boxHelper.update();
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