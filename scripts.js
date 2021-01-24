let canvas = document.getElementById('canvas');
let ctx = canvas.getContext("2d");

var canvaswidth = 0;

var level = {
    columns: 8,
    rows: 8,
    tilewidth: 0,
    tiles: [],
    selectedtile: { selected: false, column: 0, row: 0 }
};

var types = {
    a: null,
    b: null,
    c: null,
    d: null
};

class Tile {
    constructor(p) {
        this.x = p.x || 0;
        this.y = p.y || 0;
        this.type = p.type;
    }

    draw() {
        ctx.drawImage(types[this.type], this.x * level.tilewidth, this.y * level.tilewidth, level.tilewidth, level.tilewidth);

        ctx.font = "bold 30px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.fillText(this.type, this.x * level.tilewidth + level.tilewidth / 2, this.y * level.tilewidth + level.tilewidth / 2);
        ctx.fillText(this.x, this.x * level.tilewidth + level.tilewidth / 2 - 20, this.y * level.tilewidth + level.tilewidth / 2 + 30);
        ctx.fillText(this.y, this.x * level.tilewidth + level.tilewidth / 2 + 20, this.y * level.tilewidth + level.tilewidth / 2 + 30);
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
    findMatches();
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
        //    findMatches();
    }
    console.log(level);
}

function removeMatch(startx, starty, endx, endy) {
    console.log(`Removing: x ${startx} to ${endx}, y ${starty} to ${endy}`);
    for (let x = startx; x <= endx; x++) {
        for (let y = starty; y <= endy; y++) {
            //level.tiles[x][y].type = "removed";
            //console.log(level.tiles[x][y].type);
        }
    }
    console.log("Removed match.");
}

function gravity() {

}

startGame();