
export class Shield {
    constructor (positionZ, positionX) {
        const { w, h, d } = {w: 5, h: 5, d: 5};
        
        this.isLoaded = false;
        loadModel(loader, model_path).then(gltf_scene => {
            this.mesh = gltf_scene;    
            scene.add(this.mesh);
            this.isLoaded = true;
        });

        this.width = w;
        this.height = h;
        this.depth = d;

        function loadModel(loader, modelPath) {
            // model loader: low poly spaceship
            return new Promise((resolve, reject) => {
                const geometry = new THREE.BoxGeometry( w, h, d );
                const material = new THREE.MeshPhongMaterial({
                    color: 0x4bff2b
                });
                let tempMesh = new THREE.Mesh( geometry, material );
                tempMesh.castShadow = true;
                tempMesh.receiveShadow = true;
                tempMesh.position.x = positionX;
                tempMesh.position.z = positionZ;
                resolve(tempMesh);
            })
        }
        this.checkCollide = objectList => {
            objectList.forEach(anyObj => {
                if (this.boundingBox.intersectsBox(anyObj.boundingBox)){
                    anyObj.dispose();
                    gotAttack();
                }
            })
        }
        const gotAttack = () => {
            Sound.hit();
            this.dispose();
        }
        this.dispose = (isReload = false) => {
            scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            renderer.renderLists.dispose();
        }
    }
}