let canvas = document.getElementById('canvas');
let ctx = canvas.getContext("2d");

// Debug mode flag
let debug = false;
let debugtimer = 500

// Level
canvas.addEventListener('click', function () { findClick(event); }, false);
var canvaswidth = 0;

var level = {
    columns: 8,
    rows: 8,
    tilewidth: 0,
    tiles: [],
    selectedtile: { selected: false, column: 0, row: 0 }
};

// Tiles
var types = {
    a: null,
    b: null,
    c: null,
    d: null
};

// Game
var canplay = false;
var clicked = null;

class Tile {
    constructor(p) {
        this.x = p.x || 0;
        this.y = p.y || 0;
        this.canvasx = this.x * level.tilewidth;
        this.canvasy = this.y * level.tilewidth;
        this.type = p.type;
        this.selected = false;
    }

    draw() {
        if (this.type != "removed") {
            ctx.drawImage(types[this.type], this.canvasx, this.canvasy, level.tilewidth, level.tilewidth);
            if (this.selected == true) {
                ctx.beginPath();
                ctx.strokeStyle = "red";
                ctx.arc(this.canvasx + level.tilewidth / 2, this.canvasy + level.tilewidth / 2, level.tilewidth / 2, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }

        if (debug == true) {
            ctx.font = "bold 30px Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = "black";
            ctx.fillText(this.type, this.canvasx + level.tilewidth / 2, this.canvasy + level.tilewidth / 2);
            ctx.fillText(this.x, this.canvasx + level.tilewidth / 2 - 20, this.canvasy + level.tilewidth / 2 + 30);
            ctx.fillText(this.y, this.canvasx + level.tilewidth / 2 + 20, this.canvasy + level.tilewidth / 2 + 30);
        }
    }

    click() {
        this.selected = !this.selected;
    }
};

// rembound. com/articles/how-to-load-and-draw-images-with-html5-canvas
// Load images
function loadImages(imagefiles) {
    // Initialize variables
    let loadcount = 0;
    let loadtotal = imagefiles.length;
    let preloaded = false;

    // Load the images
    //let loadedimages = [];
    for (let i = 0; i < imagefiles.length; i++) {
        // Create the image object
        let image = new Image();
        let imagetype = imagefiles[i].slice(6, -4);

        // Add onload event handler
        image.onload = function () {
            loadcount++;
            if (loadcount == loadtotal) {
                // Done loading
                preloaded = true;
            }
        };

        // Set the source url of the image
        image.src = imagefiles[i];

        // Save to the image array
        //loadedimages[i] = image;
        types[imagetype] = image;
    }

    // Return an array of images
    //images = loadedimages;
    console.log("Images loaded.");
    console.log(types);
}

function startGame() {
    if (window.innerHeight > window.innerWidth) {
        // Device is portrait
        canvaswidth = Math.floor(window.innerWidth / 100) * 100;
        canvas.width = canvaswidth;
        canvas.height = canvaswidth;
    } else {
        // Device is landscape
        canvaswidth = Math.floor(window.innerHeight / 100) * 100;
        canvas.width = canvaswidth;
        canvas.height = canvaswidth;
    }
    level.tilewidth = canvaswidth / 8;
    // Initialize the two-dimensional tile array
    for (let i = 0; i < level.columns; i++) {
        level.tiles[i] = [];
        for (let j = 0; j < level.rows; j++) {
            // Define a tile type and a shift parameter for animation
            let t = new Tile({
                x: i,
                y: j,
                type: randomTile(Object.keys(types)),
            });
            level.tiles[i][j] = t;
        }
    }
    console.log(level);
    loadImages(["tiles/a.png", "tiles/b.png", "tiles/c.png", "tiles/d.png"]);
    drawTiles();
    if (debug == true) {
        setTimeout(function () { findMatches(); }, debugtimer);
    } else {
        findMatches();
    }

}

function randomTile(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function drawTiles() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvaswidth, canvaswidth);

    // Draw each car and then move it
    for (let i = 0; i < level.columns; i++) {
        for (let j = 0; j < level.rows; j++) {
            level.tiles[i][j].draw();
        }
    }
    requestAnimationFrame(drawTiles);
}

function findMatches() {
    console.log("Finding matches...");
    let foundmatches = false;
    // Vertical
    console.log("Vertical:");
    for (let x = 0; x < level.columns; x++) {
        let streak = 1;
        let nexttype = "";
        for (let y = 0; y < level.rows; y++) {
            let currenttype = level.tiles[x][y].type;
            if (level.tiles[x][y + 1]) {
                nexttype = level.tiles[x][y + 1].type;
            } else {
                nexttype = "";
            }

            //console.log(`Checking ${x}, ${y}. Streak: ${streak}. Next type: ${nexttype}`)
            if (currenttype == nexttype) {
                streak += 1;
            }
            if (streak >= 3 && currenttype != nexttype) {
                // There was a match
                foundmatches = true;
                matchstartx = level.tiles[x][y].x;
                matchendx = level.tiles[x][y].x;
                matchstarty = level.tiles[x][y - streak + 1].y;
                matchendy = level.tiles[x][y].y;

                console.log(`Found match: x ${matchstartx} to ${matchendx}, y ${matchstarty} to ${matchendy}, type ${currenttype}, streak ${streak}`);
                removeMatch(matchstartx, matchstarty, matchendx, matchendy);
                streak = 1;
            } else if (currenttype != nexttype && streak < 3) {
                streak = 1;
            }
            //console.log(`Checked ${x}, ${y}. Streak: ${streak}. Next type: ${nexttype}`)
        }
    }

    // Horizontal
    console.log("Horizontal:");
    for (let y = 0; y < level.rows; y++) {
        let streak = 1;
        let nexttype = "";
        for (let x = 0; x < level.columns; x++) {
            let currenttype = level.tiles[x][y].type;
            //console.log(`Checking ${x}, ${y}`);
            if (typeof level.tiles[x + 1] === "undefined") {
                nexttype = "";
            } else {
                nexttype = level.tiles[x + 1][y].type;
            }

            //console.log(`Checking ${x}, ${y}. Streak: ${streak}. Next type: ${nexttype}`)
            if (currenttype == nexttype) {
                streak += 1;
            }
            if (streak >= 3 && currenttype != nexttype) {
                // There was a match
                foundmatches = true;
                matchstartx = level.tiles[x - streak + 1][y].x;
                matchendy = level.tiles[x][y].y;
                matchstarty = level.tiles[x][y].y;
                matchendx = level.tiles[x][y].x;

                console.log(`Found match: x ${matchstartx} to ${matchendx}, y ${matchstarty} to ${matchendy}, type ${currenttype}, streak ${streak}`);
                removeMatch(matchstartx, matchstarty, matchendx, matchendy);
                streak = 1;
                lasttype = "";
            } else if (currenttype != nexttype && streak < 3) {
                streak = 1;
            }
        }
    }

    if (foundmatches == true) {
        if (debug == true) {
            setTimeout(function () { gravity(); }, debugtimer);
        } else {
            gravity();
        }
    } else {
        // Board is valid, play OK
        console.log("Board OK");
        canplay = true;
    }
    //console.log(level);
}

function removeMatch(startx, starty, endx, endy) {
    console.log(`Removing: x ${startx} to ${endx}, y ${starty} to ${endy}`);
    for (let x = startx; x <= endx; x++) {
        for (let y = starty; y <= endy; y++) {
            level.tiles[x][y].type = "removed";
            //console.log(level.tiles[x][y].type);
        }
    }
    console.log("Removed match.");
}

function gravity() {
    console.log("Starting gravity...");
    let shifted = false;
    for (let x = 0; x < level.columns; x++) {
        let nexttype = "";
        for (let y = 0; y < level.rows; y++) {
            let currenttype = level.tiles[x][y].type;
            if (typeof level.tiles[x][y + 1] === "undefined") {
                nexttype = "";
            } else {
                nexttype = level.tiles[x][y + 1].type;
            }

            if (nexttype == "removed" && currenttype != "removed") {
                level.tiles[x][y + 1].type = currenttype;
                level.tiles[x][y].type = "removed";
                shifted = true;
            }
        }
    }
    if (shifted == true) {
        if (debug == true) {
            setTimeout(function () { gravity(); }, debugtimer);
        } else {
            gravity();
        }
    } else {
        if (debug == true) {
            setTimeout(function () { newTiles(); }, debugtimer);
        } else {
            newTiles();
        }
    }
}

function newTiles() {
    console.log("Generating new tiles");
    for (let i = 0; i < level.columns; i++) {
        for (let j = 0; j < level.rows; j++) {
            // Define a tile type and a shift parameter for animation
            if (level.tiles[i][j].type == "removed") {
                level.tiles[i][j].type = randomTile(Object.keys(types));
            }
        }
    }
    if (debug == true) {
        setTimeout(function () { findMatches() }, debugtimer);
    } else {
        findMatches()
    }
}

function checkClick(tile) {
    if (clicked == null) {
        // Ok to click
        tile.click();
        clicked = tile;
    } else if (clicked == tile) {
        // Need to remove tile
        tile.click();
        clicked = null;
    } else {
        if ((Math.abs(clicked.x - tile.x) == 1 && !(Math.abs(clicked.y - tile.y) == 1)) || (!(Math.abs(clicked.x - tile.x) == 1) && Math.abs(clicked.y - tile.y) == 1)) {
            // Swap
            console.log("Swap")
            clicked.click();
            tile.click(tile);
            clicked = tile;
        } else {
            // Clear clicks
            clicked.click();
            tile.click();
            clicked = tile;
        }
    }
    console.log("This tile: ");
    console.log(tile);
    console.log("Already clicked: " + clicked.type);
    console.log(clicked);
}

function findClick(event) {
    var x = event.pageX - canvas.offsetLeft,
        y = event.pageY - canvas.offsetTop;
    if (canplay == true) {
        for (let i = 0; i < level.columns; i++) {
            for (let j = 0; j < level.rows; j++) {
                if (y > level.tiles[i][j].canvasy && y < level.tiles[i][j].canvasy + level.tilewidth && x > level.tiles[i][j].canvasx && x < level.tiles[i][j].canvasx + level.tilewidth) {
                    console.log(`clicked ${level.tiles[i][j].type} at: ${level.tiles[i][j].x}, ${level.tiles[i][j].y}`);
                    checkClick(level.tiles[i][j]);
                }
            }
        }
    }

}

startGame();