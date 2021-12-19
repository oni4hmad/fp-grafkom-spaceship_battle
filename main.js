import * as THREE from "./js/lib/three/three.module.js";
import { OrbitControls } from "./js/lib/three/controls/OrbitControls.js";
import { GLTFLoader } from "./js/lib/three/loaders/GLTFLoader.js";
import * as dat from "./js/lib/dat.gui.module.js";

import { addLight } from "./js/Lights.js"
import { Player } from "./js/Sprite/Player.js"
import { Alien } from "./js/Sprite/Alien.js"
import { Boss } from "./js/Sprite/Boss.js";
import * as Stars from "./js/SpaceWarp.js";
import * as Sound from "./js/Sound.js";
import { Globe } from "./js/Globe.js";
import * as Fog from "./js/Fog.js";
import { BonusShip, initBonusShip } from "./js/Sprite/BonusShip.js";

// Commons
export const commons = Object.freeze ({
    BOARD_MAX_X: 280,
    BOARD_MIN_X: -280,
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
    powerTime: 10,
    start: false,
    isPaused: false,
    isAnimating: false,
    isLoading: false,
    last_x_position: 0,
    last_c_targetX: 0,
    gameOver: function() {
        document.getElementById("gameover").style.display = "block";
        document.getElementById("fill").style.display = "block";
        game.start = false;
        game.last_x_position = 0;
        game.last_c_targetX = 0;
        Sound.game_over();
        console.log("Game OVER!");
    },
    levelUp: function () {
        if (game.start) {
            game.last_x_position = player.x;
            game.last_c_targetX = controls.target.x;
        }
        game.level++;
        this.updateLevel();
        game.reload();
        Sound.level_up();
    },
    addScore: function (score = 100) {
        game.score += score;
        this.updateScore();
    },
    addPower: function () {
        if(player) player.isPowered = true;
        powerClock.start();
        this.addPowerMissileUI();
        game.updatePower();
    },
    removePower: function () {
        if(player) player.isPowered = false;
        this.removePowerMissileUI();
    },
    updateScore: function () {
        document.getElementById("score-value").innerHTML = game.score;
    },
    updateHealth: function (health) {
        document.getElementById("health-value").innerHTML = health;
    },
    updateLevel: function () {
        document.getElementById("lvl-value").innerHTML = game.level;
    },
    updatePower: function () {
        if (player && player.isPowered) {
            if (powerClock.getElapsedTime() > game.powerTime) {
                powerClock.stop();
                game.removePower();
            } else {
                game.updatePowerMissileUI((game.powerTime-powerClock.getElapsedTime()).toFixed(1));
                setTimeout(game.updatePower, 500);
            }
        }
    },
    restart: function () {
        if (game.isPaused)
            this.togglePause();
        this.clearUI();
        this.removePowerMissileUI();
        game.start = false;
        game.last_x_position = 0;
        game.last_c_targetX = 0;
        game.level = 1;
        game.score = 0;
        this.disposeSprite();
        this.updateScore();
        this.updateLevel();
        initGame();
        game.start = true;
        Sound.game_start();
        if (!game.isAnimating)
            animate()
    },
    reload: function () {
        if (game.isPaused)
            this.togglePause();
        this.clearUI();
        this.disposeSprite();
        this.removePowerMissileUI();
        initGame();
        game.start = true;
        if (!game.isAnimating)
            animate()
    },
    togglePause: function () {
        this.clearUI();
        if(!this.isPaused) {
            document.getElementById("pause").style.display = "block";
            document.getElementById("fill").style.display = "block";
            game.isPaused = true;
            game.start = false;
        } else {
            game.isPaused = false;
            game.start = true;
            animate()
        }
    },
    disposeSprite: function () {
        if (aliens.length > 0)
            aliens.forEach(a => a.dispose())
        aliens = []
        if (player)
            player.dispose(true)
        player = null;
        if (boss)
            boss.dispose()
        if (bonusShip)
            bonusShip.dispose()
        boss = null;
    },
    removeBonusShip: function () {
        bonusShip = null;
    },
    loadingUI: function () {
        document.getElementById("loading").style.display = "block";
        document.getElementById("fill").style.display = "block";
    },
    clearUI: function () {
        document.getElementById("gamestart").style.display = "none";
        document.getElementById("loading").style.display = "none";
        document.getElementById("gameover").style.display = "none";
        document.getElementById("pause").style.display = "none";
        document.getElementById("fill").style.display = "none";
    },
    addPowerMissileUI: function() {
        document.getElementById("power-missile").style.display = "block";
    },
    updatePowerMissileUI: function(time) {
        document.getElementById("power-missile-time").innerHTML = `x3 Missile (${time}s)`;
    },
    removePowerMissileUI: function() {
        document.getElementById("power-missile").style.display = "none";
    },
    isAllObjLoaded: function (...args) {
        for(const obj of args) {
            if (obj == null)
                continue;
            if(!obj.isLoaded)
                return false;
        }
        return true;
    }
}

// implementation
export let scene, camera, renderer, controls;
export let player, aliens = [], boss, bonusShip;
let gui, globe;
let rayCast, mouse;
const powerClock = new THREE.Clock();

let init = function () {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
    camera.position.y = 80;
    camera.position.z = 285;

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
        } else if (e.code == "Space" && !game.isLoading) {
            player.initMissile();
        }
    });
    document.addEventListener("keyup", e => {
        if (e.code == "Enter" && !game.start) {
            game.restart()
        } else if (e.code == "KeyP" && (game.start || game.isPaused)) {
            game.togglePause()
        } else if (e.code == "Backspace") {
            game.reload()
        }
    });

    // Light
    addLight(scene);

    // Panorama
    const panorama = new THREE.CubeTextureLoader();
    const textureCube = panorama.load([
        'assets/panorama/px.jpg',
        'assets/panorama/nx.jpg',
        'assets/panorama/py.jpg',
        'assets/panorama/ny.jpg',
        'assets/panorama/pz.jpg',
        'assets/panorama/nz.jpg'
    ]);
    scene.background = textureCube;

    // Space Warp (Stars particle)
    Stars.init();

    // Globe
    globe = new Globe(0, 0, 0);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 1;
    controls.maxDistance = 1000;
    controls.enablePan = false;
    controls.enableRotate = false;
    controls.enableZoom = false;
    // controls.enabled = false;

    // Raycaster
    rayCast = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    mouse.x = mouse.y = -1;
    
    // Click Event Listener
    document.addEventListener("click", e => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
        mouse.z = camera.position.z;
        rayCast.setFromCamera(mouse, camera);
        
        let intersects = rayCast.intersectObjects(scene.children);
        for (let obj of intersects) {
            if (!bonusShip) return;
            bonusShip.mesh.traverse(n => {
                if (n.isMesh) {
                    if (obj.object === n){
                        bonusShip.gotClick();
                        bonusShip = null;
                        return;
                    }
                }
            });
        }
    }, false);

    // Helper
    // const gridHelper = new THREE.GridHelper( 400, 40, 0x0000ff, 0x808080 );
    // gridHelper.position.y = 0;
    // gridHelper.position.x = 0;
    // scene.add( gridHelper );
}

let initGame = function () {
    if (!player) {
        player = new Player(game.last_x_position, game.last_c_targetX);
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
        Fog.fogAlien();
    } else {
        // boss
        boss = new Boss(0, commons.BOARD_MIN_Z);
        Fog.fogBoss();
    }

    // // Dat GUI
    // if (gui) gui.destroy();
    // gui = new dat.GUI()
    // let guiFolder = gui.addFolder('Camera Adjustment')
    // guiFolder.add(camera.position, 'x', -500, 500)
    // guiFolder.add(camera.position, 'y', -500, 500)
    // guiFolder.add(camera.position, 'z', -500, 500)
    // guiFolder.open()
    // guiFolder = gui.addFolder('Player Adjustment')
    // guiFolder.add(player, 'x', -500, 500)
    // guiFolder.add(player, 'z', -500, 500)
    // guiFolder.open()
    // guiFolder = gui.addFolder('Game Adjustment')
    // guiFolder.add(game, 'level', 0, 100).step(1)
    // guiFolder.open()
    // guiFolder.open()

    // Debug
    console.log("game inited!");
}

// Render loop
let fps = 60;
const animate = function() {
    setTimeout( function() {
        if (game.start) {
            game.isAnimating = true;
            requestAnimationFrame( animate );
        } else {
            game.isAnimating = false;
            console.log("requestAnimationFrame ended.")
        }
    }, 1000 / fps );

    // check obj loading 
    if (!game.isAllObjLoaded(player, ...aliens, boss, globe)) {
        if (!game.isLoading) {
            game.loadingUI();
            game.isLoading = true;
        }
        return;
    } else {
        if (game.isLoading)
            game.isLoading = false;
        game.clearUI();
    }

    // bonus ship move
    if (bonusShip) {
        if (bonusShip.isLoaded) bonusShip.move();
    } else {
        if (bonusShip) bonusShip.dispose();
        bonusShip = initBonusShip();
    }

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
            // alien.mesh.rotation.x += 0.04;
            // alien.mesh.rotation.y += 0.04;
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

    // stars animate
    Stars.animate();

    // globe animate
    globe.mesh.rotation.x += 0.001;
    globe.mesh.rotation.y += 0.001;

    if (gui) gui.updateDisplay();
    controls.update();
    renderer.render(scene, camera);
}

init();
// initGame();
// animate();

document.getElementById("start-btn").addEventListener("click", function() {
    game.restart();
});