let inputBuffer = {};

let startTime = null;
let timerDisplay = null;
let minutes = null;
let seconds = null;

let score = 1000;

let canvas = null;
let context = null;

const COORD_SIZE = 1024;
const COORD_X_OFFSET = 448;

let cellsInRow = 20;
let cellsInCol = 20;

let imgFloor = new Image();
imgFloor.isReady = false;
imgFloor.onload = function() {
    this.isReady = true;
};
imgFloor.src = 'floor.png';

let maze = [];

for (let row = 0; row < cellsInRow; row++) {
    maze.push([]);
    for (let col = 0; col < cellsInCol; col++) {
        maze[row].push({
            x: col, y: row, added: false, edges: {
                north: null,
                south: null,
                east: null,
                west: null
            }
        });
    }
}

function generateMaze(){
    frontier = [];

    maze[0][0].added = true;
    frontier.push(maze[0][1]);
    frontier.push(maze[1][0]);

    while(frontier.length > 0){
        let randomIndex = Math.floor(Math.random() * frontier.length);
        let cellToBeAdded = frontier[randomIndex];
        console.log(cellToBeAdded);

        // Randomly select and remove an edge connecting the cell to be added to cells already existing in the maze
        let edgeRemoved = false;
        while (! edgeRemoved){
            switch (Math.floor(Math.random() * 4)){
                case 0:
                    if (cellToBeAdded.edges.north === null && cellToBeAdded.y > 0 && maze[cellToBeAdded.y - 1][cellToBeAdded.x].added){
                        maze[cellToBeAdded.y][cellToBeAdded.x].edges.north = maze[cellToBeAdded.y - 1][cellToBeAdded.x];
                        maze[cellToBeAdded.y - 1][cellToBeAdded.x].edges.south = maze[cellToBeAdded.y][cellToBeAdded.x];
                        edgeRemoved = true;
                    }
                    break;
                case 1:
                    if (cellToBeAdded.edges.south === null && cellToBeAdded.y < cellsInCol - 1 && maze[cellToBeAdded.y + 1][cellToBeAdded.x].added){
                        maze[cellToBeAdded.y][cellToBeAdded.x].edges.south = maze[cellToBeAdded.y + 1][cellToBeAdded.x];
                        maze[cellToBeAdded.y + 1][cellToBeAdded.x].edges.north = maze[cellToBeAdded.y][cellToBeAdded.x];
                        edgeRemoved = true;
                    }
                    break;
                case 2:
                    if (cellToBeAdded.edges.east === null && cellToBeAdded.x < cellsInRow - 1 && maze[cellToBeAdded.y][cellToBeAdded.x + 1].added){
                        maze[cellToBeAdded.y][cellToBeAdded.x].edges.east = maze[cellToBeAdded.y][cellToBeAdded.x + 1];
                        maze[cellToBeAdded.y][cellToBeAdded.x + 1].edges.west = maze[cellToBeAdded.y][cellToBeAdded.x];
                        edgeRemoved = true;
                    }
                    break;
                case 3:
                    if (cellToBeAdded.edges.west === null && cellToBeAdded.x > 0 && maze[cellToBeAdded.y][cellToBeAdded.x - 1].added){
                        maze[cellToBeAdded.y][cellToBeAdded.x].edges.west = maze[cellToBeAdded.y][cellToBeAdded.x - 1];
                        maze[cellToBeAdded.y][cellToBeAdded.x - 1].edges.east = maze[cellToBeAdded.y][cellToBeAdded.x];
                        edgeRemoved = true;
                    }
                    break;
            }
        }

        // Add the cell to the maze
        maze[cellToBeAdded.y][cellToBeAdded.x].added = true;

        // Remove the cell to be added from the frontier
        frontier.splice(randomIndex, 1);

        // Add the cell's neighbors to the frontier if they are not already a part of the maze or the frontier
        if (cellToBeAdded.y > 0 && !frontier.includes(maze[cellToBeAdded.y - 1][cellToBeAdded.x]) && maze[cellToBeAdded.y - 1][cellToBeAdded.x].added === false){
            frontier.push(maze[cellToBeAdded.y - 1][cellToBeAdded.x]);
        }
        if (cellToBeAdded.y < cellsInRow - 1 && !frontier.includes(maze[cellToBeAdded.y + 1][cellToBeAdded.x]) && maze[cellToBeAdded.y + 1][cellToBeAdded.x].added === false){
            frontier.push(maze[cellToBeAdded.y + 1][cellToBeAdded.x]);
        }
        if (cellToBeAdded.x > 0 && !frontier.includes(maze[cellToBeAdded.y][cellToBeAdded.x - 1]) && maze[cellToBeAdded.y][cellToBeAdded.x - 1].added === false){
            frontier.push(maze[cellToBeAdded.y][cellToBeAdded.x - 1]);
        }
        if (cellToBeAdded.x < cellsInCol - 1 && !frontier.includes(maze[cellToBeAdded.y][cellToBeAdded.x + 1]) && maze[cellToBeAdded.y][cellToBeAdded.x + 1].added === false){
            frontier.push(maze[cellToBeAdded.y][cellToBeAdded.x + 1]);
        }
    }
}


function drawCell(cell) {

    if (imgFloor.isReady) {
        context.drawImage(imgFloor,
        COORD_X_OFFSET + (cell.x * (COORD_SIZE / cellsInRow)), cell.y * (COORD_SIZE / cellsInCol),
        COORD_SIZE / cellsInRow + 0.5, COORD_SIZE / cellsInCol + 0.5);
    }

    if (cell.edges.north === null) {
        context.moveTo(COORD_X_OFFSET + (cell.x * (COORD_SIZE / cellsInRow)), cell.y * (COORD_SIZE / cellsInCol));
        context.lineTo(COORD_X_OFFSET + ((cell.x + 1) * (COORD_SIZE / cellsInRow)), cell.y * (COORD_SIZE / cellsInCol));
    }

    if (cell.edges.south === null) {
            context.moveTo(COORD_X_OFFSET + (cell.x * (COORD_SIZE / cellsInRow)), (cell.y + 1) * (COORD_SIZE / cellsInCol));
            context.lineTo(COORD_X_OFFSET + ((cell.x + 1) * (COORD_SIZE / cellsInRow)), (cell.y + 1) * (COORD_SIZE / cellsInCol));
    }

    if (cell.edges.east === null) {
            context.moveTo(COORD_X_OFFSET + ((cell.x + 1) * (COORD_SIZE / cellsInRow)), cell.y * (COORD_SIZE / cellsInCol));
            context.lineTo(COORD_X_OFFSET + ((cell.x + 1) * (COORD_SIZE / cellsInRow)), (cell.y + 1) * (COORD_SIZE / cellsInCol));
    }

    if (cell.edges.west === null) {
            context.moveTo(COORD_X_OFFSET + (cell.x * (COORD_SIZE / cellsInRow)), cell.y * (COORD_SIZE / cellsInCol));
            context.lineTo(COORD_X_OFFSET + (cell.x * (COORD_SIZE / cellsInRow)), (cell.y + 1) * (COORD_SIZE / cellsInCol));
    }
}

function renderCharacter(character) {
    if (character.image.isReady) {
        context.drawImage(character.image,
        COORD_X_OFFSET + (character.location.x * (COORD_SIZE / cellsInRow)), character.location.y * (COORD_SIZE / cellsInCol),
        COORD_SIZE / cellsInRow + 0.5, COORD_SIZE / cellsInCol + 0.5);
    }
}

function moveCharacter(key, character) {
    if (key === 'ArrowDown') {
        if (character.location.edges.south) {
            character.location = character.location.edges.south;
            score -= 5;
        }
    }
    if (key === 'ArrowUp') {
        if (character.location.edges.north) {
            character.location = character.location.edges.north;
            score -= 5;
        }
    }
    if (key === 'ArrowRight') {
        if (character.location.edges.east) {
            character.location = character.location.edges.east;
            score -= 5;
        }
    }
    if (key === 'ArrowLeft') {
        if (character.location.edges.west) {
            character.location = character.location.edges.west;
            score -= 5;
        }
    }
    if (score < 0) {
        score = 0;
    }
}

function renderMaze() {
    // Render the cells first
    context.beginPath();
    for (let row = 0; row < cellsInRow; row++) {
        for (let col = 0; col < cellsInCol; col++) {
            drawCell(maze[row][col]);
        }
    }
    context.strokeStyle = 'rgb(255, 255, 255)';
    context.lineWidth = 6;
    context.stroke();

    // Draw a black border around the whole maze
    context.beginPath();
    context.moveTo(COORD_X_OFFSET,0);
    context.lineTo(COORD_X_OFFSET + (COORD_SIZE - 1), 0);
    context.lineTo(COORD_X_OFFSET + (COORD_SIZE - 1), COORD_SIZE - 1);
    context.lineTo(COORD_X_OFFSET, COORD_SIZE - 1);
    context.closePath();
    context.strokeStyle = 'rgb(0, 0, 0)';
    context.stroke();
}

let myCharacter = function(imageSource, location) {
    let image = new Image();
    image.isReady = false;
    image.onload = function() {
        this.isReady = true;
    };
    image.src = imageSource;
    return {
        location: location,
        image: image
    };
}('character.png', maze[0][0]);

function updateTimer() {
    let now = performance.now();
    minutes = Math.floor((now - startTime) / (60 * 1000));
    seconds = Math.floor(((now - startTime) / 1000) % 60);

    if (seconds < 10) {
        seconds = "0" + seconds;
    }
}

function renderTimer() {
    timerDisplay.innerHTML = "Time: " + minutes + ":" + seconds;
}

function renderScore() {
    scoreDisplay.innerHTML = "Score: " + score;
}

function initialize() {
    timerDisplay = document.getElementById('timer');
    scoreDisplay = document.getElementById('score');

    canvas = document.getElementById('canvas-main');
    context = canvas.getContext('2d');

    generateMaze();

    window.addEventListener('keydown', function(event) {
        inputBuffer[event.key] = event.key;
    });

    let startTime = performance.now();

    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    processInput();
    update();
    render();

    window.requestAnimationFrame(gameLoop);
}

function processInput(){
    for (input in inputBuffer) {
        moveCharacter(inputBuffer[input], myCharacter);
    }
    inputBuffer = {};
}

function update() {
    updateTimer();
}

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    renderTimer();
    renderScore();
    renderMaze();
    renderCharacter(myCharacter);
}