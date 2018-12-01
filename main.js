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
const COLOR_DIRECTION_TEXT = 'black';
const COLOR_CORRECT_DIRECTION_TEXT = 'rgba(0, 0, 0, 0.28)';
const DIRECTION_GAP = 3;
const DIRECTION_FONT_SIZE = `${CELL_SIZE * 0.8}px`;
const DIRECTION_TEXT_PAD = CELL_SIZE * 0.1;
let mouseX;
let mouseY;
let chosenCell;
let lastChosen = undefined;
let pressedKey = null;
let isPainting = false;

let NUM_X = 10;
let NUM_Y = 10;
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
let xDirectionHelper = [];
let yDirectionHelper = [];
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

function getTrains(tickArray, coord, isX) {
  let trains = [];
  let currTrain = 0;
  let nextCoord;
  const maxCoord = isX ? NUM_Y : NUM_X;
  for (var i = 0; i < maxCoord; i++) {
    nextCoord = isX 
      ? NUM_Y * i + coord
      : i + coord * NUM_X;
    if (tickArray[nextCoord] === tickType.TICKED) {
      currTrain++;
    } else if (currTrain) {
      trains.push(currTrain);
      currTrain = 0;
    }
  }
  if (currTrain) {  
    trains.push(currTrain);
  }
  return trains;
}

function compareTrainArrays(expected, current) {
  const leftCheck = expected.reduce(cum => cum.concat([null]), []);
  const rightCheck = expected.reduce(cum => cum.concat([null]), []);
  let expectedIndex = 0;
  let currIndex = 0;
  while (expectedIndex < expected.length && currIndex < current.length) {
    if (expected[expectedIndex] === current[currIndex]) {
      leftCheck[expectedIndex] = true;
      currIndex++;
    }
    expectedIndex++;
  }
  expectedIndex = expected.length - 1;
  currIndex = current.length - 1;
  while (expectedIndex >= 0 && currIndex >= 0) {
    if (expected[expectedIndex] === current[currIndex]) {
      rightCheck[expectedIndex] = true;
      currIndex--;
    }
    expectedIndex--;
  }
  let truthArray = []
  for (var i = 0; i < leftCheck.length; i++) {
    truthArray.push(leftCheck[i] && rightCheck[i])
  }

  return truthArray;
}

function updateDirectionHelpers(cellIndex) {
  const x = cellIndex % NUM_Y;
  const y = Math.floor(cellIndex / NUM_X);
  
  let thisReturn = compareTrainArrays(
    yDirections[y],
    getTrains(ticks, y, false)
  );
  yDirectionHelper[y] = thisReturn;

  thisReturn = compareTrainArrays(
    xDirections[x],
    getTrains(ticks, x, true)
  );
  xDirectionHelper[x] = thisReturn;
  return {
    x: xDirectionHelper[x], 
    y: yDirectionHelper[y],
  };
}

function buildDirections() {
  xDirections = [];
  yDirections = [];
  maxXdirections = 0;
  maxYdirections = 0;
  let currTrain;
  let currLine;

  for (var i = 0; i < NUM_X; i++) {
    currLine = getTrains(win, i, false);
    yDirections.push(currLine);
    maxYdirections = Math.max(maxYdirections, currLine.length);
    yDirectionHelper.push(currLine.reduce(cum => cum.concat([null]), []));
  }
  
  for (var i = 0; i < NUM_Y; i++) {
    currLine = getTrains(win, i, true);
    xDirections.push(currLine);
    maxXdirections = Math.max(maxXdirections, currLine.length);
    xDirectionHelper.push(currLine.reduce(cum => cum.concat([null]), []));
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
      chosenCell = this.index;
    } else if (chosenCell === this.index && leftBoard){
      chosenCell = undefined;
    }

    if (chosenCell === this.index) {
      if (this.color !== COLOR_CHOSEN) {
        this.color = COLOR_CHOSEN;
      }
    } else if (this.color === COLOR_CHOSEN) {
      this.color = COLOR_BLANK;
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

function updateDirectionTextColor(chosenCell, newHelpers) {
  const x = Math.floor(chosenCell / NUM_X);
  const y = chosenCell % NUM_Y;
  for (var i = 0; i < newHelpers.x.length; i++) {
    if (newHelpers.x[i]) {
      xDirectionText[y][newHelpers.x.length - i - 1].setColor(COLOR_CORRECT_DIRECTION_TEXT);
    } else {
      xDirectionText[y][newHelpers.x.length - i - 1].setColor(COLOR_DIRECTION_TEXT);
    }
  }
  for (var i = 0; i < newHelpers.y.length; i++) {
    if (newHelpers.y[i]) {
      yDirectionText[x][newHelpers.y.length - i - 1].setColor(COLOR_CORRECT_DIRECTION_TEXT);
    } else {
      yDirectionText[x][newHelpers.y.length - i - 1].setColor(COLOR_DIRECTION_TEXT);
    }
  }
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
      if (chosenTool !== tickType.X) {
        // updateDirectionTextColor(chosenCell, updateDirectionHelpers(chosenCell));
      }
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
    if (chosenTool !== tickType.X) {
      // updateDirectionTextColor(chosenCell, updateDirectionHelpers(chosenCell));
    }
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
