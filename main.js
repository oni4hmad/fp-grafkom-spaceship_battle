import * as THREE from "./node_modules/three/build/three.module.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "./node_modules/three/examples/jsm/libs/dat.gui.module.js";

import { addLight } from "./js/lights.js"
import { Player } from "./js/Sprite/Player.js"
import { Alien } from "./js/Sprite/Alien.js"
import { Boss } from "./js/Sprite/Boss.js";

// Commons
export const commons = Object.freeze ({
    BOARD_MAX_X: 180,
    BOARD_MIN_X: -180,
    BOARD_MAX_Z: 200, // default: 180
    BOARD_MIN_Z: -180,
    
    ALIEN_WIDTH: 20,
    ALIEN_HEIGHT: 20,
    ALIEN_DEPTH: 20,
    
    BOSS_WIDTH: 40,
    BOSS_HEIGHT: 40,
    BOSS_DEPTH: 40,

    PLAYER_WIDTH: 20,
    PLAYER_HEIGHT: 20,
    PLAYER_DEPTH: 20,
    PLAYER_HEALTH: 3,
})

// Game
export const game = {
    level: 1,
    score: 0,
    end: false,
    isPaused: false,
    isAnimating: false,
    gameOver: function() {
        document.getElementById("gameover").style.display = "block";
        document.getElementById("fill").style.display = "block";
        game.end = true;
        console.log("Game OVER!");
    },
    levelUp: function () {
        game.level++;
        game.reload();
    },
    addScore: function (score = 100) {
        game.score += score;
        this.updateScore();
    },
    updateScore: function () {
        document.getElementById("score-value").innerHTML = game.score;
    },
    updateHealth: function (health) {
        document.getElementById("health-value").innerHTML = health;
    },
    restart: function () {
        document.getElementById("gameover").style.display = "none";
        document.getElementById("fill").style.display = "none";
        game.end = true;
        game.level = 1;
        game.score = 0;
        this.disposeSprite();
        this.updateScore();
        initGame();
        game.end = false;
        if (!game.isAnimating)
            animate()
    },
    reload: function () {
        this.disposeSprite();
        initGame();
        game.end = false;
        if (!game.isAnimating)
            animate()
    },
    togglePause: function () {
        if(!this.isPaused) {
            document.getElementById("pause").style.display = "block";
            document.getElementById("fill").style.display = "block";
            game.isPaused = true;
            game.end = true;
        } else {
            document.getElementById("pause").style.display = "none";
            document.getElementById("fill").style.display = "none";
            game.isPaused = false;
            game.end = false;
            animate()
        }
    },
    disposeSprite: function () {
        if (aliens.length > 0)
            aliens.forEach(a => a.dispose())
        aliens = []
        player.dispose(true)
        player = null;
        if (boss)
            boss.dispose()
        boss = null;
    },
}

// implementation
export let scene, camera, renderer, controls;
let player, aliens = [], boss;
let gui;

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
        if (!player || game.isPaused) return;
        if (e.code == "KeyA") {
            player.moveLeft = true;
        } else if (e.code == "KeyD") {
            player.moveRight = true;
        }
    });
    document.addEventListener("keyup", e => {
        if (!player || game.isPaused) return;
        if (e.code == "KeyA") {
            player.moveLeft = false;
        } else if (e.code == "KeyD") {
            player.moveRight = false;
        } else if (e.code == "Space") {
            player.initMissile();
        }
    });
    document.addEventListener("keyup", e => {
        if (e.code == "Enter") {
            game.restart()
        } else if (e.code == "KeyP") {
            game.togglePause()
        } else if (e.code == "Backspace") {
            game.reload()
        }
    });

    // Light
    addLight(scene);

    // Panorama

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 1;
    controls.maxDistance = 1000;

    // Helper
    const gridHelper = new THREE.GridHelper( 400, 40, 0x0000ff, 0x808080 );
    gridHelper.position.y = 0;
    gridHelper.position.x = 0;
    scene.add( gridHelper );
}

let initGame = function () {
    if (!player) {
        player = new Player();
        player.health = commons.PLAYER_HEALTH;
    }
    if (game.level % 2 == 1) {
        // alien biasa
        const alien_row = 5;
        const alien_col = 11;
        const distance = 10;
        for(let i = 0; i < alien_row; i++) {
            for(let j = 0; j < alien_col; j++) {
                aliens.push(new Alien((commons.ALIEN_WIDTH * j + distance * j) + commons.BOARD_MIN_X, (commons.ALIEN_DEPTH * i + distance * i) + commons.BOARD_MIN_Z));
            }
        }
    } else {
        // boss
        boss = new Boss(0, commons.BOARD_MIN_Z);
    }

    // Dat GUI
    if (gui) gui.destroy();
    gui = new dat.GUI()
    let guiFolder = gui.addFolder('Camera Adjustment')
    guiFolder.add(camera.position, 'x', -500, 500)
    guiFolder.add(camera.position, 'y', -500, 500)
    guiFolder.add(camera.position, 'z', -500, 500)
    guiFolder.open()
    guiFolder = gui.addFolder('Player Adjustment')
    guiFolder.add(player, 'x', -500, 500)
    guiFolder.add(player, 'z', -500, 500)
    guiFolder.open()
    guiFolder = gui.addFolder('Game Adjustment')
    guiFolder.add(game, 'level', 0, 100).step(1)
    guiFolder.open()
    // Debug
    console.log("game inited!");
}

// Render loop
let fps = 60;
const animate = function() {
    setTimeout( function() {
        if (!game.end) {
            game.isAnimating = true;
            requestAnimationFrame( animate );
        } else {
            game.isAnimating = false;
            console.log("requestAnimationFrame ended.")
        }
    }, 1000 / fps );

    // player move, player missile move
    if (player) {
        player.move();
        player.missiles.forEach(m => m.move())
    }

    // boss move, boss init missile
    if (boss) {
        boss.move()
        boss.initMissile();
        boss.moveMissile();
        boss.checkCollide([...player.missiles, player]);
        player.checkCollide([...boss.missiles])
        player.missiles.forEach(pm => pm.checkCollide([...boss.missiles]))
        if (boss.x >= commons.BOARD_MAX_X) {
            boss.setMoveToLeft()
        } else if (boss.x <= commons.BOARD_MIN_X) {
            boss.setMoveToRight()
        }
    }

    // update aliens
    if (aliens.length >= 1) {
        aliens.forEach(a => {
            if (!a.isAlive) {
                let idx = aliens.indexOf(a);
                if (idx > -1) aliens.splice(idx, 1);
                // level up if all aliens died
                if (aliens.length <= 0) {
                    console.log('level up!')
                    game.levelUp()
                }
            }
        })
    }

    // collision check, alien move, alien init missile
    aliens.forEach(alien => {
        if (alien.isAlive){
            alien.move();
            alien.initMissile();
            alien.moveMissile();
            alien.mesh.rotation.x += 0.04;
            alien.mesh.rotation.y += 0.04;
            alien.checkCollide([...player.missiles, player]);
            player.checkCollide([...alien.missiles])
            player.missiles.forEach(pm => pm.checkCollide([...alien.missiles]))
        }
    })
    
    // aliens geser kanan-kiri
    for (let alien of aliens) {
        if (alien.x >= commons.BOARD_MAX_X) {
            aliens.forEach(a => a.setMoveToLeft())
            break;
        } else if (alien.x <= commons.BOARD_MIN_X) {
            aliens.forEach(a => a.setMoveToRight())
            break;
        }
    }

    gui.updateDisplay();
    controls.update();
    renderer.render(scene, camera);
}

init();
initGame();
animate();