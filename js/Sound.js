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
    let soundTemp = new Sound('../assets/sounds/alienBeam.wav');
    beam_sounds.push(soundTemp);
}

export function alien_beam() {
    let sound = beam_sounds.pop();
    beam_sounds.unshift(sound);
    sound.stop();
    sound.play();
}

export function player_bullet() {
    new Sound('../assets/sounds/bulletSound.wav').play();
}

export function game_start() {
    new Sound('../assets/sounds/gameStart.wav').play();
}

export function game_over() {
    new Sound('../assets/sounds/deathSound.wav').play();
}

export function level_up() {
    new Sound('../assets/sounds/levelUpSound.wav').play();
}

export function boss() {
    new Sound('../assets/sounds/bossSound.wav').play();
}

export function damage() {
    new Sound('../assets/sounds/damageSound.wav').play();
}