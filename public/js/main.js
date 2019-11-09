/* eslint-disable */
async function load() {
    const splashes = await fetch('../data/splashes.txt').then(r => r.text());
    const splashArray = splashes.split('\n');
    document.querySelector('.splash').innerText = splashArray[Math.floor(Math.random() * splashArray.length)];
}