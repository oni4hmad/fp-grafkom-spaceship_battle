import * as THREE from "./node_modules/three/build/three.module.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "./node_modules/three/examples/jsm/libs/dat.gui.module.js";

// create geometry object
let createObject = function () {
    const geometry = new THREE.BoxGeometry( 30, 32, 30 );
    const material = new THREE.MeshPhongMaterial({
        color: 0xffff00
    });
    const geoMesh = new THREE.Mesh( geometry, material );
    geoMesh.castShadow = true;
    geoMesh.receiveShadow = true;
    return geoMesh;
}

// addLight
let addLight = function () {
    // AmbientLight
    const ambientLight = new THREE.AmbientLight(0xffffff, .25);
    scene.add(ambientLight);
    // DirectionalLight
    const directionalLight = new THREE.PointLight(0xffffff, 1.0);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}

// implementation
let scene, camera, renderer, controls;
let sphere;

let init = function () {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.y = 50;
    camera.position.z = 125;

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

    // -----------------------------------

    // Object (Geometry)
    sphere = createObject();
    scene.add(sphere);

    // Light
    addLight();

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 1;
    controls.maxDistance = 1000;
}

// Render loop
const animate = function() {
    requestAnimationFrame(animate);

    sphere.rotation.x += 0.01;
    sphere.rotation.y += 0.01;

    controls.update();
    renderer.render(scene, camera);
}

init();
animate();