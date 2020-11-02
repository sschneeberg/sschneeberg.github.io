//Set up Canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const computedStyle = getComputedStyle(canvas);
const height = computedStyle.height;
const width = computedStyle.width;
canvas.setAttribute('height', height);
canvas.setAttribute('width', width);

//create objects and rule sets

let fruitGroup = [];
const movement = 10;
let movementSpeed = 300;
let movePiece = null;
const gameOver = false;
//adjust this when the board fills up, for now just the bottom of the canvas
let baseline = canvas.height;

class Fruit {
    constructor(x, y, color) {
        //all fruit have radius 25 (take up a 50x50 square with some padding) and sAngle 0, eAngle 2Pi
        //all fruit start vertical
        this.x = x;
        this.y = y;
        this.color = color;
        this.r = 25;
        this.sAngle = 0;
        this.eAngle = 2 * Math.PI;
        this.orientation = 'vertical';
        this.mobile = true;
    }

    render() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, this.sAngle, this.eAngle);
        ctx.fill();
    }

    //move side to side with arrow keys
    move(dX) {
        this.x = this.x + dX;
    }

    //check if hits x boundaries
    //return true if piece can move, return false if piece will go over the edge
    checkBoundaries(dX) {
        let outsideL = this.x - this.r + dX;
        let outsideR = this.x + this.r + dX;
        if (outsideL < 0 || outsideR > canvas.width) {
            //currently at the edge, cannot go further
            return false;
        } else {
            return true;
        }

    }

    checkHit() {
        let bottom = this.y + this.r + movement;
        if (bottom > baseline) {
            this.mobile = false;
            return false;
        } else {
            return true;
        }
    }
}


function createFruitGroup(x, y, n) {
    let colors = ['red', 'green', 'blue', 'yellow']
    while (n > 0) {
        let index = Math.floor(Math.random() * colors.length);
        let color = colors[index];

        const fruit = new Fruit(x, y, color);
        fruitGroup.push(fruit);
        y = y - 50;
        n = n - 1;
    }
    return fruitGroup;
}

function drawFruitGroup() {
    //reset spped to normal
    clearInterval(movePiece);
    movementSpeed = 300;
    movePiece = setInterval(dropFruitGroup, movementSpeed);
    //for now they'll always start in the middle above the canvas and always be groups of 3
    const startX = canvas.width / 2;
    const startY = -25;
    const n = 3;
    //make new fruit group
    fruitGroup = createFruitGroup(startX, startY, n);
    for (fruit of fruitGroup) {
        fruit.render();
    }
}

function dropFruitGroup() {
    //if everything can move
    if (checkBottom()) {
        //drop pieces
        for (fruit of fruitGroup) {
            fruit.y = fruit.y + movement;
        }
    }

}

function checkBottom() {
    for (fruit of fruitGroup) {
        if (!fruit.checkHit()) {
            return false;
        }
    }
    return true;
}


function moveFruitGroup(dX) {
    if (fruitGroup[0].checkBoundaries(dX) && fruitGroup[2].checkBoundaries(dX)) {
        for (fruit of fruitGroup) {
            fruit.move(dX);
        }
    }
}

function rotateFruitGroup(direction) {
    //get center piece coordinates
    let [x1, y1] = [fruitGroup[0].x, fruitGroup[0].y]
    let [x2, y2] = [fruitGroup[1].x, fruitGroup[1].y];
    let [x3, y3] = [fruitGroup[2].x, fruitGroup[2].y];
    //only need to check one to know entire group, only need to reset this one
    let orientation = fruitGroup[1].orientation;
    //take down to base transformations
    x1 = x1 - x2;
    y1 = y1 - y2;
    x3 = x3 - x2;
    y3 = y3 - y2;
    //make transformations
    if (direction === 'CW' && orientation === 'vertical') {
        //CW from vertical to horizontal: x = -y, y = x
        [x1, y1] = [-y1, x1];
        [x3, y3] = [-y3, x3];
    } else if (direction === 'CCW' && orientation === 'horizontal') {
        //CCW from horizontal to vertical: y = -x, x = y
        [x1, y1] = [y1, -x1];
        [x3, y3] = [y3, -x3];
    } else {
        //all other transformtions: x = y, y = x
        [x1, y1] = [y1, x1];
        [x3, y3] = [y3, x3];
    }
    //reset to full value
    fruitGroup[0].x = x1 + x2;
    fruitGroup[0].y = y1 + y2;
    fruitGroup[2].x = x3 + x2;
    fruitGroup[2].y = y3 + y2;
    //change orientation to current
    if (orientation === 'vertical') {
        fruitGroup[1].orientation = 'horizontal';
    } else {
        fruitGroup[1].orientation = 'vertical';
    }
}

function rePaint() {
    if (!gameOver) {
        //clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //re render
        for (fruit of fruitGroup) {
            fruit.render();
        }
    }
}



//React to player input
document.addEventListener('DOMContentLoaded', function() {
    //on start and when the previous fruit group hits
    drawFruitGroup();
    //COME BACK TO THIS
    movePiece = setInterval(dropFruitGroup, movementSpeed);
    //move pieces
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            //left
            let dX = -50;
            moveFruitGroup(dX);
        } else if (e.key === 'ArrowRight') {
            //right
            let dX = 50;
            moveFruitGroup(dX);
        } else if (e.key === ' ') {
            //speed up on press NOT HOLD
            //Reset when new piece is drawn
            clearInterval(movePiece);
            movementSpeed = 100;
            movePiece = setInterval(dropFruitGroup, movementSpeed);
        } else if (e.key === 'ArrowDown') {
            //CW
            let rot = 'CW';
            rotateFruitGroup(rot);
        } else if (e.key === 'ArrowUp') {
            //CCW
            let rot = 'CCW';
            rotateFruitGroup(rot);

        }
    })

})

setInterval(rePaint, 80);