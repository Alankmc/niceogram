// import Text from './Text';

const canvas = document.getElementById('main-canvas');
const xEdge = window.innerWidth;
const yEdge = window.innerHeight - 200;
canvas.width = xEdge;
canvas.height = yEdge;

const X_START = 30;
const Y_START = 30;
const CELL_SIZE = 25;
const GAP_SIZE = 1;
const GAP_5_SIZE = 3;
const COLOR_BLANK = '#f2f2f2';
const COLOR_CHOSEN = '#e0e0e0';
const COLOR_X = 'red';
const COLOR_FILL = 'black';
const COLOR_DRAG = 'pink';
const COLOR_DIRECTION_INVISIBLE = 'white';
const COLOR_DIRECTION_CHOSEN = '#e0e0e0';
const DIRECTION_GAP = 3;
const DIRECTION_FONT_SIZE = `${CELL_SIZE * 0.8}px`;
const DIRECTION_TEXT_PAD = CELL_SIZE * 0.1;
let mouseX;
let mouseY;
let chosenCell;
let lastChosen = undefined;
let pressedKey = null;
let isPainting = false;

let NUM_X = 3;
let NUM_Y = 3;
const tickType = {
  BLANK: 'BLANK',
  TICKED: 'TICKED',
  X: 'X',
  DELETE: 'DELETE',
};

let xCheatSheet = [];
let yCheatSheet = [];
let cells = [];
let toolText;
let ticks = [];
let chosenTool = tickType.BLANK;
let win = [];
let xDirections = [];
let yDirections = [];
let xDirectionText = [];
let yDirectionText = [];
let maxXdirections = 0;
let maxYdirections = 0;
let xMapStart;
let yMapStart;

let xDirectionHighlight = [];
let yDirectionHighlight = [];
let leftBoard;

function changeSizes() {
  NUM_Y = document.getElementById('map-height').value;
  NUM_X = document.getElementById('map-width').value;
  init();
}

function randomWin(tickedPercentage) {
  for (var i = 0; i < NUM_X; i++) {
    for (var j = 0; j < NUM_Y; j++) {
      win.push(Math.random() < tickedPercentage
        ? tickType.TICKED
        : tickType.BLANK);
    }
  }
}

function buildDirections() {
  xDirections = [];
  yDirections = [];
  maxXdirections = 0;
  maxYdirections = 0;
  let currTrain;
  let currLine;
  for (var i = 0; i < NUM_X; i++) {
    currTrain = 0;
    currLine = [];
    for (var j = 0; j < NUM_Y; j++) {
      if (win[i * NUM_Y + j] === tickType.TICKED) {
        currTrain++;
      } else if (currTrain) {
        currLine.push(currTrain);
        currTrain = 0;
      }
    }
    if (currTrain) {
      currLine.push(currTrain);
    }
    yDirections.push(currLine);
    maxYdirections = Math.max(maxYdirections, currLine.length);
  }
  
  for (var i = 0; i < NUM_Y; i++) {
    currTrain = 0;
    currLine = [];
    for (var j = 0; j < NUM_X; j++) {
      if (win[i + j * NUM_Y] === tickType.TICKED) {
        currTrain++;
      } else if (currTrain) {
        currLine.push(currTrain);
        currTrain = 0;
      }
    }
    if (currTrain) {
      currLine.push(currTrain);
    }
    xDirections.push(currLine);
    maxXdirections = Math.max(maxXdirections, currLine.length);
  }

  xMapStart = X_START + (CELL_SIZE + DIRECTION_GAP) * maxXdirections;
  yMapStart = Y_START + (CELL_SIZE + DIRECTION_GAP) * maxYdirections;
}

/**
 *  GAME FUNCTIONS
 */
function init() {
  win = [];
  cells = [];
  ticks = [];
  xCheatSheet = [];
  yCheatSheet = [];
  xDirectionText = [];
  yDirectionText = [];
  xDirectionHighlight = [];
  yDirectionHighlight = [];
  pressedKey = null;
  isPainting = false;
  chosenTool = tickType.BLANK;

  randomWin(0.6);
  buildDirections();

  let currLine = [];
  let currDirection;
  let temp = 0;
  for (var i = 0; i < NUM_Y; i++) {
    currDirection = xDirections[i];
    currLine = [];
    if (!(i % 5)) {
      temp++;
    }
    xDirectionHighlight.push(new DirectionHighlight(
      X_START,
      yMapStart + i * (CELL_SIZE) + (i - 1) * GAP_SIZE + temp * GAP_5_SIZE,
      xMapStart - X_START - DIRECTION_GAP,
      CELL_SIZE,
      COLOR_DIRECTION_INVISIBLE,
    ));
    for (var j = 0; j < currDirection.length; j++) { 
      currLine.push(new Text(
        xMapStart - (j + 1) * (CELL_SIZE + DIRECTION_GAP) + DIRECTION_TEXT_PAD,
        yMapStart + i * (CELL_SIZE + GAP_SIZE) + temp * GAP_5_SIZE + DIRECTION_TEXT_PAD,
        currDirection[currDirection.length - j - 1].toString(),
        DIRECTION_FONT_SIZE,
        CELL_SIZE * 0.8
        ));
      }
    xDirectionText.push(currLine);
  }
  temp = 0;
  for (var i = 0; i < NUM_X; i++) {
    currDirection = yDirections[i];
    currLine = [];
    if (!(i % 5)) {
      temp++;
    }
    yDirectionHighlight.push(new DirectionHighlight(
      xMapStart + i * (CELL_SIZE) + (i - 1) * GAP_SIZE + temp * GAP_5_SIZE,
      Y_START,
      CELL_SIZE, 
      yMapStart - Y_START - DIRECTION_GAP,
      COLOR_DIRECTION_INVISIBLE,
    ));
    for (var j = 0; j < currDirection.length; j++) { 
      currLine.push(new Text(
        xMapStart + i * (CELL_SIZE + GAP_SIZE) + temp * GAP_5_SIZE + DIRECTION_TEXT_PAD,
        yMapStart - (j + 1) * (CELL_SIZE + DIRECTION_GAP) + DIRECTION_TEXT_PAD,
        currDirection[currDirection.length - j - 1].toString(),
        DIRECTION_FONT_SIZE,
        CELL_SIZE * 0.8
        ));
      }
    yDirectionText.push(currLine);
  }
  // Initiate helpers
  for (var i = 0; i < NUM_X; i++) {
    if (!(i % 5)) {
      temp++;
    }
    let thisIndex = xMapStart + i * CELL_SIZE + (i - 1) * GAP_SIZE + temp * GAP_5_SIZE;
    xCheatSheet.push(thisIndex);
  }
  temp = 0;
  for (var i = 0; i < NUM_Y; i++) {
    if (!(i % 5)) {
      temp++;
    }
    let thisIndex = yMapStart + i * CELL_SIZE + (i - 1) * GAP_SIZE + temp * GAP_5_SIZE;
    yCheatSheet.push(thisIndex);
  }

  // Initiate Renderable objects
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
        xMapStart + i * CELL_SIZE + (i - 1) * GAP_SIZE + x5gaps * GAP_5_SIZE,
        yMapStart + j * CELL_SIZE + (j - 1) * GAP_SIZE + y5gaps * GAP_5_SIZE,
        index++
        ));
        ticks.push(tickType.BLANK);
    }
  }
  toolText = new Text(xCheatSheet[NUM_X - 1] + CELL_SIZE + 20, yMapStart, tickType.BLANK, '30px');
}

function wipeBoard() {
  for (var i = 0; i < NUM_X; i++) {
    for (var j = 0; j < NUM_Y; j++) {
      cells[i * NUM_Y + j].setTick(tickType.BLANK);
      ticks[i * NUM_Y + j] = tickType.BLANK;
    }
  }
}

function giveUp() {
  for (var i = 0; i < NUM_X; i++) {
    for (var j = 0; j < NUM_Y; j++) {
      cells[i * NUM_Y + j].setTick(win[i * NUM_Y + j]);
      ticks[i * NUM_Y + j] = win[i * NUM_Y + j];
    }
  }
}

function checkWin() {
  for (var i = 0; i < ticks.length; i++) {
    if (win[i] === tickType.TICKED) {
      if (ticks[i] !== win[i]) {
        return false;
      }
    }
  }
  alert('You win!');
  init();
  return true;
}

init();

function getCellByPosition(x, y) {
  if (x < xMapStart || y < yMapStart) {
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
  this.tick = tickType.BLANK;
  this.tickGrownBy = 0;
  this.xGrownBy = 0;
  this.TICK_GROW_SPEED = 3;
  this.TICK_GROW_TO = 0.8 * CELL_SIZE;
  this.X_GROW_SPEED = 3;
  this.X_GROW_TO = 0.3 * CELL_SIZE / 2;
  
  this.getTick = () => this.tick;
  this.setTick = (override) => this.tick = override;

  this.paintCell = (tick) => {
    if (tick === tickType.DELETE) {
      this.tick = tickType.BLANK;
    } else {
      if (this.tick === tickType.BLANK) {
        this.tick = tick;
      }
    }
  }

  this.draw = () => {
    c.fillStyle = this.color;
    c.fillRect(
      this.x,
      this.y,
      this.size,
      this.size
    );
    if (this.tickGrownBy) {
      c.fillStyle = COLOR_FILL;
      c.fillRect(
        this.x + CELL_SIZE / 2 - this.tickGrownBy / 2,
        this.y + CELL_SIZE / 2 - this.tickGrownBy / 2,
        this.tickGrownBy,
        this.tickGrownBy,
      )
    }
    if (this.xGrownBy) {
      c.fillStyle = COLOR_X;
      c.beginPath();
      c.arc(
        this.x + CELL_SIZE / 2,
        this.y + CELL_SIZE / 2,
        this.xGrownBy,
        0,
        Math.PI * 2,
        false);
      c.fill();
      c.stroke();
    }
  };

  this.growTick = () => {
    this.tickGrownBy = this.tickGrownBy + this.TICK_GROW_SPEED > this.TICK_GROW_TO
      ? this.TICK_GROW_TO
      : this.TICK_GROW_SPEED + this.tickGrownBy;
  }

  this.reduceTick = () => {
    this.tickGrownBy = this.tickGrownBy - this.TICK_GROW_SPEED < 0
      ? 0
      : this.tickGrownBy - this.TICK_GROW_SPEED;
  }

  this.growX = () => {
    this.xGrownBy = this.xGrownBy + this.X_GROW_SPEED > this.X_GROW_TO
      ? this.X_GROW_TO
      : this.X_GROW_SPEED + this.xGrownBy;
  }

  this.reduceX = () => {
    this.xGrownBy = this.xGrownBy - this.X_GROW_SPEED < 0
      ? 0
      : this.xGrownBy - this.X_GROW_SPEED;
  }

  this.update = () => {
    this.isChosen = mouseX >= this.x
      && mouseY >= this.y
      && mouseX < this.x + this.size
      && mouseY < this.y + this.size;
    
    if (this.isChosen) {
      if (this.color !== COLOR_CHOSEN) {
        this.color = COLOR_CHOSEN;
      }
      chosenCell = this.index;
    } else if (chosenCell === this.index){
      if (this.color === COLOR_CHOSEN) {
        this.color = COLOR_BLANK;
      }
      if (leftBoard) {
        chosenCell = undefined;
      }
    }
    
    if (this.tick !== tickType.BLANK) {
      if (this.tick === tickType.X) {
       this.growX();
      } else if (this.tickGrownBy < this.TICK_GROW_TO) {
       this.growTick();
      }
    } else {  
      if (this.tickGrownBy > 0) {
        this.reduceTick();
      }
      if (this.xGrownBy > 0) {
        this.reduceX();
      }
    }
    
    this.draw();
  };
}

/**
 *  EVENT HANDLERS
 */
const keyMapping = {
  [tickType.X]: 'KeyA',
  [tickType.TICKED]: 'KeyW',
  [tickType.DELETE]: 'KeyD',
}
document.addEventListener("keypress", (e) => {
  if (!pressedKey) {
    switch (e.code) {
      case keyMapping[tickType.X]:
        chosenTool = tickType.X;
        break;
      case keyMapping[tickType.TICKED]:
        chosenTool = tickType.TICKED;
        break;
      case keyMapping[tickType.DELETE]:
        chosenTool = tickType.DELETE;
        break;
      default:
        return;
    }
    pressedKey = e.code;
    toolText.setText(chosenTool);
  }
}, false);

document.addEventListener("keyup", (e) => {
  if (e.code === pressedKey) {
    pressedKey = null;
    chosenTool = tickType.BLANK;
    toolText.setText(chosenTool);
  }
}, false);

canvas.onmousemove = (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  leftBoard = mouseX > xCheatSheet[xCheatSheet.length - 1] + CELL_SIZE
    || mouseX < xMapStart
    || mouseY > yCheatSheet[yCheatSheet.length - 1] + CELL_SIZE
    || mouseY < yMapStart;
  if (lastChosen !== chosenCell) {
    console.log(lastChosen, chosenCell);
    // Direction Highlights
    (lastChosen >= 0) && yDirectionHighlight[Math.floor(lastChosen / NUM_Y)].setColor(COLOR_DIRECTION_INVISIBLE);
    (chosenCell >= 0) && yDirectionHighlight[Math.floor(chosenCell / NUM_Y)].setColor(COLOR_DIRECTION_CHOSEN);
    (lastChosen >= 0) && xDirectionHighlight[lastChosen % NUM_Y].setColor(COLOR_DIRECTION_INVISIBLE);
    (chosenCell >= 0) && xDirectionHighlight[chosenCell % NUM_Y].setColor(COLOR_DIRECTION_CHOSEN);

    lastChosen = chosenCell;
    let paintingAs = chosenTool === tickType.DELETE
      ? tickType.BLANK
      : chosenTool;
    if (isPainting && chosenCell >= 0 && cells[chosenCell].getTick() !== paintingAs) {
      cells[chosenCell].paintCell(chosenTool);
      ticks[chosenCell] = paintingAs;
      checkWin();
    }

  }
};

canvas.onmousedown = (e) => {
  anchorX = e.clientX;
  anchorY = e.clientY;
  if (chosenCell >= 0 && chosenTool !== tickType.BLANK) {
    cells[chosenCell].paintCell(chosenTool);
    ticks[chosenCell] = chosenTool === tickType.DELETE
      ? tickType.BLANK
      : chosenTool;
    isPainting = true;
    checkWin();
  }
}

canvas.onmouseup = (e) => {
  isPainting = false;
}

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, xEdge, yEdge);
  cells.forEach(el => el.update());
  toolText.update();
  yDirectionHighlight.forEach(el => el.update());
  xDirectionHighlight.forEach(el => el.update());
  xDirectionText.forEach(line => line.forEach(el => el.update()));
  yDirectionText.forEach(line => line.forEach(el => el.update()));
}

animate();


/* Ugh I worked so hard on this. 
  Used to be in mousemove

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
  
 */
