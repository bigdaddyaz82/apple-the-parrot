// Game Variables
let bird;
let pipes = [];
let score = 0;
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let birdImg, pipeImg, backgroundImg;
let jumpSound, scoreSound, hitSound;

const GRAVITY = 0.6;
const BIRD_LIFT = -12;
const BIRD_SIZE = 32;
const PIPE_WIDTH = 80;
const PIPE_SPACING_HORIZONTAL = 350; // How far apart pipes are horizontally
const PIPE_SPACING_VERTICAL = 150; // Vertical gap between pipes
const PIPE_SPEED = 3;

function preload() {
    // Ensure these image files are in the ROOT of your project,
    // or adjust paths if you place them in an 'assets' folder (e.g., 'assets/parrot.png')
    birdImg = loadImage('parrot.png');
    pipeImg = loadImage('pipe.png'); // This will be used for both top and bottom
    backgroundImg = loadImage('background.png');

    // Optional: Sound effects (you'll need to add sound files)
    // soundFormats('mp3', 'wav');
    // jumpSound = loadSound('sounds/jump.wav');
    // scoreSound = loadSound('sounds/score.wav');
    // hitSound = loadSound('sounds/hit.wav');
}

function setup() {
    createCanvas(400, 600);
    resetGame();
}

function draw() {
    image(backgroundImg, 0, 0, width, height); // Draw background first

    if (gameState === 'start') {
        drawStartScreen();
    } else if (gameState === 'playing') {
        bird.update();
        bird.show();

        handlePipes();
        checkCollisions();
        updateScore();
        drawScore();
    } else if (gameState === 'gameOver') {
        drawGameOverScreen();
        handlePipes(); // Keep showing pipes for context
        bird.show();   // Show where the bird ended up
    }
}

function mousePressed() {
    if (gameState === 'start') {
        gameState = 'playing';
        bird.flap();
        // if (jumpSound) jumpSound.play();
    } else if (gameState === 'playing') {
        bird.flap();
        // if (jumpSound) jumpSound.play();
    } else if (gameState === 'gameOver') {
        // Check if "Play Again" button is clicked (simple example)
        if (mouseX > width / 2 - 50 && mouseX < width / 2 + 50 &&
            mouseY > height / 2 + 20 && mouseY < height / 2 + 60) {
            resetGame();
            gameState = 'playing'; // Or 'start' if you prefer
        }
    }
}

function keyPressed() {
    if (key === ' ' || keyCode === UP_ARROW) { // Space bar or Up Arrow
        if (gameState === 'start') {
            gameState = 'playing';
            bird.flap();
            // if (jumpSound) jumpSound.play();
        } else if (gameState === 'playing') {
            bird.flap();
            // if (jumpSound) jumpSound.play();
        }
        return false; // Prevent default browser behavior for space
    }
}

function resetGame() {
    bird = new Bird();
    pipes = [];
    score = 0;
    // Add an initial pipe
    pipes.push(new Pipe());
    gameState = 'start'; // Or 'playing' if you want to start immediately after reset
}

// Bird Class
class Bird {
    constructor() {
        this.y = height / 2;
        this.x = 64;
        this.velocity = 0;
        this.size = BIRD_SIZE;
    }

    show() {
        imageMode(CENTER);
        image(birdImg, this.x, this.y, this.size, this.size);
    }

    update() {
        this.velocity += GRAVITY;
        this.y += this.velocity;

        // Prevent going off screen (top/bottom)
        if (this.y + this.size / 2 > height) {
            this.y = height - this.size / 2;
            this.velocity = 0;
            gameOver();
        }
        if (this.y - this.size / 2 < 0) {
            this.y = this.size / 2;
            this.velocity = 0;
            gameOver();
        }
    }

    flap() {
        this.velocity = BIRD_LIFT;
    }
}

// Pipe Class
class Pipe {
    constructor() {
        this.top = random(height / 6, (3 / 4) * height - PIPE_SPACING_VERTICAL); // Ensure gap is possible
        this.bottom = this.top + PIPE_SPACING_VERTICAL;
        this.x = width;
        this.w = PIPE_WIDTH;
        this.speed = PIPE_SPEED;
        this.highlight = false;
        this.passed = false;
    }

    show() {
        // Use pipeImg for both top and bottom parts
        // Top pipe (flipped)
        push();
        translate(this.x + this.w / 2, this.top / 2);
        scale(1, -1); // Flip vertically
        image(pipeImg, 0, 0, this.w, this.top);
        pop();

        // Bottom pipe
        image(pipeImg, this.x, this.bottom, this.w, height - this.bottom);

        if (this.highlight) {
            // Optional: visual cue for collision for debugging
            // fill(255, 0, 0, 100);
            // rect(this.x, 0, this.w, this.top);
            // rect(this.x, this.bottom, this.w, height - this.bottom);
        }
    }

    update() {
        this.x -= this.speed;
    }

    offscreen() {
        return this.x < -this.w;
    }

    hits(bird) {
        if (bird.y - bird.size / 2 < this.top || bird.y + bird.size / 2 > this.bottom) {
            if (bird.x + bird.size / 2 > this.x && bird.x - bird.size / 2 < this.x + this.w) {
                this.highlight = true;
                return true;
            }
        }
        this.highlight = false;
        return false;
    }
}

function handlePipes() {
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].show();
        if (gameState === 'playing') {
            pipes[i].update();
        }

        if (pipes[i].offscreen()) {
            pipes.splice(i, 1);
        }
    }

    // Add new pipes
    if (gameState === 'playing' && frameCount % Math.floor(PIPE_SPACING_HORIZONTAL / PIPE_SPEED) === 0) {
        pipes.push(new Pipe());
    }
}

function checkCollisions() {
    for (let pipe of pipes) {
        if (pipe.hits(bird)) {
            gameOver();
            break;
        }
    }
}

function updateScore() {
    for (let pipe of pipes) {
        if (!pipe.passed && pipe.x + pipe.w < bird.x - bird.size / 2) {
            pipe.passed = true;
            score++;
            // if (scoreSound) scoreSound.play();
        }
    }
}

function drawScore() {
    fill(255);
    stroke(0);
    strokeWeight(3);
    textAlign(LEFT, TOP);
    textSize(32);
    text("Score: " + score, 10, 10);
}

function drawStartScreen() {
    fill(0, 0, 0, 150); // Semi-transparent overlay
    rect(0,0,width,height);
    fill(255);
    stroke(0);
    strokeWeight(4);
    textAlign(CENTER, CENTER);
    textSize(48);
    text("Apple The Parrot", width / 2, height / 3);
    textSize(24);
    text("Click or Press Space to Start", width / 2, height / 2);
}

function drawGameOverScreen() {
    fill(0, 0, 0, 150); // Semi-transparent overlay
    rect(0,0,width,height);
    fill(255, 50, 50); // Reddish color for game over text
    stroke(0);
    strokeWeight(4);
    textAlign(CENTER, CENTER);
    textSize(64);
    text("Game Over", width / 2, height / 3);
    textSize(32);
    fill(255);
    text("Score: " + score, width / 2, height / 2 - 30);

    // "Play Again" button area
    fill(100, 200, 100);
    rect(width / 2 - 75, height / 2 + 30, 150, 40, 10); // Rounded rectangle
    fill(0);
    textSize(24);
    text("Play Again", width / 2, height / 2 + 50);
    noStroke(); // Reset stroke for other text
}

function gameOver() {
    if (gameState === 'playing') { // Only trigger once
        gameState = 'gameOver';
        // if (hitSound) hitSound.play();
    }
}
