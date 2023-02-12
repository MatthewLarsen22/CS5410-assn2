let inputBuffer = {};

let startTime = null;
let timerDisplay = null;
let minutes = null;
let seconds = null;

let score = 1000;
let highScore = -1;
let highScoreMapSize = {rows: 10, cols: 10}

let canvas = null;
let context = null;

const COORD_SIZE = 1024;
const COORD_X_OFFSET = 448;

let newMapRequested = false;
let cellsInRow = 10;
let cellsInCol = 10;

let showBreadcrumbs = false;
let shortestPath = [];

let gameWon = false;

let imgFloor = new Image();
imgFloor.isReady = false;
imgFloor.onload = function() {
    this.isReady = true;
};
imgFloor.src = 'floor.png';

function generateMaze(cellsInRow, cellsInCol){
    newMapRequested = false;
    let maze = [];

    for (let row = 0; row < cellsInRow; row++) {
        maze.push([]);
        for (let col = 0; col < cellsInCol; col++) {
            maze[row].push({
                x: col, y: row, added: false, traversed: false, edges: {
                    north: null,
                    south: null,
                    east: null,
                    west: null
                }
            });
        }
    }

    let frontier = [];

    let randomStartY = Math.floor(Math.random() * cellsInCol);
    let randomStartX = Math.floor(Math.random() * cellsInRow);

    maze[randomStartY][randomStartX].added = true;

    if (randomStartY > 0){
        frontier.push(maze[randomStartY - 1][randomStartX]);
    }
    if (randomStartY < cellsInCol - 1){
        frontier.push(maze[randomStartY + 1][randomStartX]);
    }
    if (randomStartX > 0){
        frontier.push(maze[randomStartY][randomStartX - 1]);
    }
    if (randomStartX < cellsInRow - 1){
        frontier.push(maze[randomStartY][randomStartX + 1]);
    }


    while(frontier.length > 0){
        let randomIndex = Math.floor(Math.random() * frontier.length);
        let cellToBeAdded = frontier[randomIndex];

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
        if (cellToBeAdded.y < cellsInCol - 1 && !frontier.includes(maze[cellToBeAdded.y + 1][cellToBeAdded.x]) && maze[cellToBeAdded.y + 1][cellToBeAdded.x].added === false){
            frontier.push(maze[cellToBeAdded.y + 1][cellToBeAdded.x]);
        }
        if (cellToBeAdded.x > 0 && !frontier.includes(maze[cellToBeAdded.y][cellToBeAdded.x - 1]) && maze[cellToBeAdded.y][cellToBeAdded.x - 1].added === false){
            frontier.push(maze[cellToBeAdded.y][cellToBeAdded.x - 1]);
        }
        if (cellToBeAdded.x < cellsInRow - 1 && !frontier.includes(maze[cellToBeAdded.y][cellToBeAdded.x + 1]) && maze[cellToBeAdded.y][cellToBeAdded.x + 1].added === false){
            frontier.push(maze[cellToBeAdded.y][cellToBeAdded.x + 1]);
        }
    }

    return maze;
}

let myMaze = generateMaze(cellsInRow, cellsInCol);

function newMap(rowWidth, colHeight){
    cellsInRow = rowWidth;
    cellsInCol = colHeight;

    newMapRequested = true;
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

    // Draw a circle over the cell for breadcrumbs trail if requested
    if (showBreadcrumbs && cell.traversed) {
        context.moveTo(COORD_X_OFFSET + ((cell.x + 0.8) * (COORD_SIZE / cellsInRow)), (cell.y + 0.5) * (COORD_SIZE / cellsInCol));
        context.arc(COORD_X_OFFSET + ((cell.x + 0.5) * (COORD_SIZE / cellsInRow)), (cell.y + 0.5) * (COORD_SIZE / cellsInCol), 0.6 * COORD_SIZE / (cellsInRow * 2), 0, 2 * Math.PI)
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
    if (! gameWon){
        if (key === 'b'){
            showBreadcrumbs = !showBreadcrumbs;
        }
        if (key === 'ArrowDown') {
            if (character.location.edges.south) {
                myMaze[character.location.y][character.location.x].traversed = true;
                character.location = character.location.edges.south;
                score -= 5;
            }
        }
        if (key === 'ArrowUp') {
            if (character.location.edges.north) {
                myMaze[character.location.y][character.location.x].traversed = true;
                character.location = character.location.edges.north;
                score -= 5;
            }
        }
        if (key === 'ArrowRight') {
            if (character.location.edges.east) {
                myMaze[character.location.y][character.location.x].traversed = true;
                character.location = character.location.edges.east;
                score -= 5;
            }
        }
        if (key === 'ArrowLeft') {
            if (character.location.edges.west) {
                myMaze[character.location.y][character.location.x].traversed = true;
                character.location = character.location.edges.west;
                score -= 5;
            }
        }
        if (score < 0) {
            score = 0;
        }

        if (character.location.x === cellsInRow - 1 && character.location.y === cellsInCol - 1){
            gameWon = true;
            saveHighScore();
        }
    }
}

function saveHighScore(){
    if(score > highScore){
        highScore = score;
        highScoreMapSize = {rows: cellsInRow, cols: cellsInCol};
    }
}

function renderMaze() {
    // Render the cells first
    context.beginPath();
    for (let row = 0; row < cellsInRow; row++) {
        for (let col = 0; col < cellsInCol; col++) {
            drawCell(myMaze[row][col]);
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

function resetCharacter(imageSource, location) {
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
}

let myCharacter = resetCharacter('character.png', myMaze[0][0]);

function updateTimer() {
    if (! gameWon){
        let now = performance.now();
        minutes = Math.floor((now - startTime) / (60 * 1000));
        seconds = Math.floor(((now - startTime) / 1000) % 60);

        if (seconds < 10) {
            seconds = "0" + seconds;
        }
    }
}

function renderTimer() {
    timerDisplay.innerHTML = "Time: " + minutes + ":" + seconds;
}

function renderScore() {
    scoreDisplay.innerHTML = "Score: " + score;
}

function renderHighScore() {
    highScoreDisplay.innerHTML = "High Score: " + highScore;
    mapSizeDisplay.innerHTML = "Map Size: " + highScoreMapSize.rows + "x" + highScoreMapSize.cols;
}

function findShortestPath() {
    let queue = [];
    queue.push(myMaze[0][0]);

    let visited = [];
    let prev = [];
    prev.push(null);

    while (queue.length > 0) {
        let nextCell = queue.shift();
        for (edge in nextCell.edges) {
            if (nextCell.edges[edge] != null && !visited.includes(nextCell.edges[edge]) && !queue.includes(nextCell.edges[edge])){
                queue.push(nextCell.edges[edge]);
                prev.push(nextCell);
            }
        }
        visited.push(nextCell);
    }

    let path = [];
    for (let cell = prev[visited.indexOf(myMaze[cellsInCol - 1][cellsInRow - 1])]; cell!= null; cell = prev[visited.indexOf(cell)]){
        path.push(cell);
    }

    path.reverse();
    path.shift();

    shortestPath = path;
}

function initialize() {
    timerDisplay = document.getElementById('timer');
    scoreDisplay = document.getElementById('score');
    highScoreDisplay = document.getElementById('highScore');
    mapSizeDisplay = document.getElementById('mapSize');

    canvas = document.getElementById('canvas-main');
    context = canvas.getContext('2d');

    findShortestPath();

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

    if (newMapRequested){
        gameWon = false;
        score = 1000;
        myMaze = generateMaze(cellsInRow, cellsInCol);
        myCharacter = resetCharacter('character.png', myMaze[0][0]);
        findShortestPath();
        startTime = performance.now();
    }
}

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    renderTimer();
    renderScore();
    renderMaze();
    renderCharacter(myCharacter);
    if (gameWon) {
        renderHighScore();
    }
}