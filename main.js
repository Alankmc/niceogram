const canvas = document.getElementById('main-canvas');
const xEdge = window.innerWidth;
const yEdge = window.innerHeight;
canvas.width = xEdge;
canvas.height = yEdge;

const X_START = 30;
const Y_START = 30;
const CELL_SIZE = 20;
const GAP_SIZE = 1;
const GAP_5_SIZE = 3;
const COLOR_BLANK = '#f2f2f2';
const COLOR_CHOSEN = '#e0e0e0';
const COLOR_X = 'red';
const COLOR_FILL = 'black';
const COLOR_DRAG = 'pink';
let mouseX;
let mouseY;
let chosenCell;

const NUM_X = 20;
const NUM_Y = 20;

let xCheatSheet = [];
let yCheatSheet = [];
let cells = [];
let ticks = [];

function init() {
  let temp = 0;
  for (var i = 0; i < NUM_X; i++) {
    if (!(i % 5)) {
      temp++;
    }
    let thisIndex = X_START + i * CELL_SIZE + (i - 1) * GAP_SIZE + temp * GAP_5_SIZE;
    xCheatSheet.push(thisIndex);
  }
  temp = 0;
  for (var i = 0; i < NUM_Y; i++) {
    if (!(i % 5)) {
      temp++;
    }
    let thisIndex = Y_START + i * CELL_SIZE + (i - 1) * GAP_SIZE + temp * GAP_5_SIZE;
    yCheatSheet.push(thisIndex);
  }

  cells = [];
  ticks = [];
  let index = 0;
  let x5gaps = 0;
  for (var i = 0; i < NUM_X; i++) {
    let y5gaps = 0;
    if (!(i % 5)) {
      x5gaps++;
    }
    for (var j = 0; j < NUM_Y; j++) {
      if (!(j % 5)) {
        y5gaps++;
      }
      cells.push(new Cell(
        X_START + i * CELL_SIZE + (i - 1) * GAP_SIZE + x5gaps * GAP_5_SIZE,
        Y_START + j * CELL_SIZE + (j - 1) * GAP_SIZE + y5gaps * GAP_5_SIZE,
        index++
        ));
      ticks.push(null);
    }
  }
}

init();

function getCellByPosition(x, y) {
  if (x < X_START || y < Y_START) {
    return -1;
  }
  if (x > xCheatSheet[NUM_X - 1] + CELL_SIZE
    || y > yCheatSheet[NUM_Y - 1] + CELL_SIZE) {
    return -2;
  }

  const foundX = xCheatSheet.findIndex((el, ind) => {
    return ind === NUM_X || (x >= el && x < xCheatSheet[ind + 1]);
  });
  const foundY = yCheatSheet.findIndex((el, ind) => {
    return ind === NUM_Y || (y >= el && y < yCheatSheet[ind + 1]);
  });

  if (foundX >= 0 && foundY >= 0) {
    return foundX * NUM_X + foundY;
  }
  return null;
}

// Comes in as index
function getCellDifference(a, b) {
  return {
    x: Math.floor(b / NUM_X) - Math.floor(a / NUM_X),
    y: b % NUM_Y - a % NUM_Y,
  };
}

const c = canvas.getContext('2d');

let possibleRange = [];
function Cell(x, y, index) {
  this.x = x;
  this.y = y;
  this.color = COLOR_BLANK;
  this.index = index;
  this.size = CELL_SIZE;
  this.isChosen = false;
  this.tick = 1;
  this.grownBy = 0;
  this.underDrag = false;

  this.CELL_GROW = 2;
  this.GROW_TO = 12;
  
  this.toggleTick = override => this.tick = override || (this.tick) % 3 + 1;
  this.getTick = () => this.tick;
  this.setTick = (override) => this.tick = override;
  
  this.toggleUnderDrag = () => {
    this.underDrag = !this.underDrag;
  }
  this.setUnderDrag = (override) => this.underDrag = override;

  this.draw = () => {
    c.fillStyle = this.color;
    c.fillRect(
      this.x - this.grownBy / 2,
      this.y - this.grownBy / 2,
      this.size + this.grownBy,
      this.size + this.grownBy
    );
  };

  this.update = () => {
    this.isChosen = mouseX >= this.x
      && mouseY >= this.y
      && mouseX < this.x + this.size
      && mouseY < this.y + this.size;
    
    if (this.isChosen) {
      chosenCell = this.index;
    } else if (chosenCell === this.index){
      chosenCell = undefined;
    }
    
    if (this.tick !== 1) {
       if (this.tick === 2) {
        this.color = COLOR_X;
       } else {
        this.color = COLOR_FILL;
       }
    } else {  
      if (this.isChosen && this.color !== COLOR_CHOSEN) {
        this.color = COLOR_CHOSEN;
      } else if (!this.isChosen && this.color === COLOR_CHOSEN) {
        this.color = COLOR_BLANK;
      }
    }

    if(this.underDrag && this.tick === 1) {
      this.color = COLOR_DRAG;
    } else {
      if (this.color === COLOR_DRAG) {
        this.color = COLOR_BLANK;
      }
    }
    
    this.draw();
  };
}

let clickAnchorIndex = undefined;
let upAnchorIndex = undefined;
let paintToggle = undefined;
let anchorX, anchorY;
let lastDirection = undefined;

function resetAllCellUnderDrag() {
  for (var i = 0; i < possibleRange.length; i++) {
    cells[possibleRange[i]].setUnderDrag(false);
  }
}

function resetPR() {
  resetAllCellUnderDrag();
  possibleRange = [];
  return 0;
}

canvas.onmousemove = (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (clickAnchorIndex) {
    const mouseCell = getCellByPosition(mouseX, mouseY);
    const cellDif = getCellDifference(clickAnchorIndex, mouseCell);
    let currPR = possibleRange.length;
    if (Math.abs(mouseX - anchorX) > Math.abs(mouseY - anchorY)) {
      if (mouseX - anchorX > 0) {
        if (lastDirection !== 'RIGHT') {
          currPR = resetPR();
        }
        lastDirection = 'RIGHT';
        if (cellDif.x - currPR > 0) {
          for (var i = 0; i < cellDif.x - currPR; i++) {
            cells[clickAnchorIndex + (currPR + i + 1) * NUM_Y].setUnderDrag(true);
            possibleRange.push(clickAnchorIndex + (currPR + i + 1) * NUM_Y);
          }
        } else if (cellDif.x - currPR < 0) {
          for (var i = 0; i < currPR - cellDif.x; i++) {
            cells[possibleRange.pop()].setUnderDrag(false);
          }
        }
      } else {
        if (lastDirection !== 'LEFT') {
          currPR = resetPR();
        }
        lastDirection = 'LEFT';
        if (Math.abs(cellDif.x) - currPR > 0) {
          for (var i = 0; i < Math.abs(cellDif.x) - currPR; i++) {
            cells[clickAnchorIndex - (currPR + i + 1) * NUM_Y].setUnderDrag(true);
            possibleRange.push(clickAnchorIndex - (currPR + i + 1) * NUM_Y);
          }
        } else if (Math.abs(cellDif.x) - currPR < 0) {
          for (var i = 0; i < currPR - Math.abs(cellDif.x); i++) {
            cells[possibleRange.pop()].setUnderDrag(false);
          }
        }
      }
    } else {
      if (mouseY - anchorY > 0) {
        if (lastDirection !== 'DOWN') {
          currPR = resetPR();
        }
        lastDirection = 'DOWN';
        if (cellDif.y - currPR > 0) {
          for (var i = 0; i < cellDif.y - currPR; i++) {
            cells[clickAnchorIndex + (currPR + i + 1)].setUnderDrag(true);
            possibleRange.push(clickAnchorIndex + (currPR + i + 1));
          }
        } else if (cellDif.y - currPR < 0) {
          for (var i = 0; i < currPR - cellDif.y; i++) {
            cells[possibleRange.pop()].setUnderDrag(false);
          }
        }
      } else {
        if (lastDirection !== 'UP') {
          currPR = resetPR();
        }
        lastDirection = 'UP';
        if (Math.abs(cellDif.y) - currPR > 0) {
          for (var i = 0; i < Math.abs(cellDif.y) - currPR; i++) {
            cells[clickAnchorIndex - (currPR + i + 1)].setUnderDrag(true);
            possibleRange.push(clickAnchorIndex - (currPR + i + 1));
          }
        } else if (Math.abs(cellDif.y) - currPR < 0) {
          for (var i = 0; i < currPR - Math.abs(cellDif.y); i++) {
            cells[possibleRange.pop()].setUnderDrag(false);
          }
        }
      }
    }
  }
};

canvas.onmousedown = (e) => {
  anchorX = e.clientX;
  anchorY = e.clientY;
  if (chosenCell) {
    clickAnchorIndex = chosenCell;
    paintToggle = (cells[chosenCell].getTick() % 3) + 1;
    cells[chosenCell].toggleTick();
  }
}

function fillPRWithTick() {
  for (var i = 0; i < possibleRange.length; i++) {
    if (cells[possibleRange[i]].getTick() === 1) {
      cells[possibleRange[i]].setTick(paintToggle);
    }
  }
}

canvas.onmouseup = (e) => {
  fillPRWithTick();
  resetAllCellUnderDrag();
  anchorX = undefined;
  anchorY = undefined;
  possibleRange = [];
  clickAnchorIndex = undefined; 
  lastDirection = undefined;
}

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, xEdge, yEdge);
  cells.forEach(el => el.update());
}

animate();