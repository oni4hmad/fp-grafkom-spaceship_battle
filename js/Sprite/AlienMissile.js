import * as THREE from "../../node_modules/three/build/three.module.js";
import { scene, renderer } from "../../main.js"
import { commons } from "../../main.js"

export class AlienMissile {
    constructor (alien, positionX, positionZ) {
        const { w, h, d } = {w: 5, h: 5, d: 5};
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

        this.move = () => {
            this.z += this.speedZ;
            this.boxHelper.update();
            this.mesh.geometry.computeBoundingBox();
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