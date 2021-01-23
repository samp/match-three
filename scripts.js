let canvas = document.getElementById('canvas');
let ctx = canvas.getContext("2d");

var canvaswidth = 0;

var level = {
    columns: 10,
    rows: 10,
    tilewidth: 0,
    tiles: [],
    selectedtile: { selected: false, column: 0, row: 0 }
};

var types = {
    a:null,
    b:null,
    c:null,
    d:null,
};

class Tile {
    constructor(p) {
        this.x = p.x || 0;
        this.y = p.y || 0;
        this.type = p.type;
    }

    draw() {
        ctx.drawImage(types[this.type], this.x * level.tilewidth, this.y * level.tilewidth, level.tilewidth, level.tilewidth);

        //ctx.font = "bold 30px Arial";
        //ctx.textAlign = "center";
        //ctx.fillStyle = "black";
        //ctx.fillText(this.type, this.x * level.tilewidth + level.tilewidth / 2, this.y * level.tilewidth + level.tilewidth / 2);
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
        canvas.height = canvasheight;
    } else {
        // Device is landscape
        canvaswidth = Math.floor(window.innerHeight / 100) * 100;
        canvas.width = canvaswidth;
        canvas.height = canvaswidth;
    }
    level.tilewidth = canvaswidth / 10;
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

startGame();