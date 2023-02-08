let prevTime = performance.now();

function gameLoop() {
    let timeStamp = performance.now();
    let elapsedTime = timeStamp - prevTime;
    prevTime = timeStamp;

    processInput(elapsedTime);
    update(elapsedTime);
    render();

    window.requestAnimationFrame(gameLoop);
}

function update(elapsedTime) {
}

function render() {
}

function processInput(){
}