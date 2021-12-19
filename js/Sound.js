export class Sound {
    constructor(src) {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
        this.play = () => {
            this.sound.play();
        };
        this.stop = () => {
            this.sound.pause();
        };
    }
}

export let beam_sounds = []
for(let i = 0; i < 15; i++) {
    let soundTemp = new Sound('./assets/sounds/alienBeam.wav');
    beam_sounds.push(soundTemp);
}

export function alien_beam() {
    let s = beam_sounds.pop();
    beam_sounds.unshift(s);
    s.sound.volume = 0.20;
    s.stop();
    s.play();
}

export function player_bullet() {
    let s = new Sound('./assets/sounds/bulletSound.wav');
    s.sound.volume = 0.20;
    s.play();
}

export function game_start() {
    let s = new Sound('./assets/sounds/gameStart.wav');
    s.sound.volume = 0.20;
    s.play();
}

export function game_over() {
    let s = new Sound('./assets/sounds/deathSound.wav');
    s.sound.volume = 0.20;
    s.play();
}

export function level_up() {
    let s = new Sound('./assets/sounds/levelUpSound.wav');
    s.sound.volume = 0.20;
    s.play();
}

export function boss() {
    let s = new Sound('./assets/sounds/bossSound.wav');
    s.sound.volume = 0.20;
    s.play();
}

export function damage() {
    let s = new Sound('./assets/sounds/damageSound.wav');
    s.sound.volume = 0.20;
    s.play();
}

export function hit() {
    let s = new Sound('./assets/sounds/hitmarkerSound.wav');
    s.sound.volume = 0.20;
    s.play();
}

export function bonus() {
    let s = new Sound('./assets/sounds/bonusSound.wav');
    s.sound.volume = 0.20;
    s.play();
}