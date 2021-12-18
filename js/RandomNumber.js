/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
export function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
/**
 * Returns a random number between min (inclusive) and max (inclusive)
 */
export function randomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}
