import * as THREE from "../../node_modules/three/build/three.module.js";
import { scene, renderer } from "../../main.js"
import { commons } from "../../main.js"
import { AlienMissile } from "./AlienMissile.js"
import { getRandomArbitrary } from "../randomNumber.js"

export class Alien {
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
        this.missiles = [];

        this.isAlive = true;
        this.missileRate = 0.1; // % rate

        this.move = () => {
            this.x += this.speedX;
            this.z += this.speedZ;
            this.boxHelper.update();
            this.mesh.geometry.computeBoundingBox();
            this.boundingBox.setFromObject(this.mesh);
        }
        this.initMissile = () => {
            const rng = getRandomArbitrary(0, 100);
            if (rng <= this.missileRate){
                const missile = new AlienMissile(this, this.x, this.z + this.depth/2);
                this.missiles.push(missile);
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
            // remove all missiles
            while (this.missiles.length)
                this.missiles.pop().dispose()
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
        if (this.mesh.position.z > commons.BOARD_MAX_Z - commons.ALIEN_DEPTH/2){
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