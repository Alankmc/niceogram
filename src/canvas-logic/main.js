// import Text from './Text';
import Cell from './Cell';
import DirectionHighlight from './DirectionHighlight';
import Text from './Text';
import { positions, colors, tickType } from './system-constants';

const DIRECTION_GAP = 3;
const DIRECTION_FONT_SIZE = `${positions.CELL_SIZE * 0.8}px`;
const DIRECTION_TEXT_PAD = positions.CELL_SIZE * 0.1;
let mouseX;
let mouseY;
let lastChosen;
let pressedKey = null;
let isPainting = false;

const NUM_X = 10;
const NUM_Y = 10;

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
const xDirectionHelper = [];
const yDirectionHelper = [];
let maxXdirections = 0;
let maxYdirections = 0;
let xMapStart;
let yMapStart;
let xDirectionHighlight = [];
let yDirectionHighlight = [];
let leftBoard;

const keyMapping = {
  [tickType.X]: 'KeyA',
  [tickType.TICKED]: 'KeyW',
  [tickType.DELETE]: 'KeyD',
};

function Board() {
  this.initialize = (updateToolCallback) => {
    this.canvas = document.getElementById('main-canvas');
    this.xEdge = window.innerWidth;
    this.yEdge = window.innerHeight - 200;
    this.canvas.width = this.xEdge;
    this.canvas.height = this.yEdge;
    this.c = this.canvas.getContext('2d');
    this.initEventListeners(updateToolCallback);
  };

  this.initEventListeners = (updateToolCallback) => {
    this.canvas.onmousedown = () => {
      if (this.chosenCell >= 0 && chosenTool !== tickType.BLANK) {
        cells[this.chosenCell].paintCell(chosenTool);
        ticks[this.chosenCell] = chosenTool === tickType.DELETE
          ? tickType.BLANK
          : chosenTool;
        isPainting = true;
        if (chosenTool !== tickType.X) {
          updateDirectionTextColor(this.chosenCell, updateDirectionHelpers(this.chosenCell));
        }
        this.checkWin();
      }
    };

    this.canvas.onmouseup = (e) => {
      isPainting = false;
    };

    document.addEventListener('keypress', (e) => {
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
        updateToolCallback(chosenTool);
        // toolText.setText(chosenTool);
      }
    }, false);

    document.addEventListener('keyup', (e) => {
      if (e.code === pressedKey) {
        pressedKey = null;
        chosenTool = tickType.BLANK;
        updateToolCallback(chosenTool);
        // toolText.setText(chosenTool);
      }
    }, false);

    this.canvas.onmousemove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      leftBoard = mouseX > xCheatSheet[xCheatSheet.length - 1] + positions.CELL_SIZE
        || mouseX < xMapStart
        || mouseY > yCheatSheet[yCheatSheet.length - 1] + positions.CELL_SIZE
        || mouseY < yMapStart;
      if (lastChosen !== this.chosenCell) {
        // Direction Highlights
        (lastChosen >= 0) && yDirectionHighlight[Math.floor(lastChosen / NUM_Y)].setColor(colors.COLOR_DIRECTION_INVISIBLE);
        (this.chosenCell >= 0) && yDirectionHighlight[Math.floor(this.chosenCell / NUM_Y)].setColor(colors.COLOR_DIRECTION_CHOSEN);
        (lastChosen >= 0) && xDirectionHighlight[lastChosen % NUM_Y].setColor(colors.COLOR_DIRECTION_INVISIBLE);
        (this.chosenCell >= 0) && xDirectionHighlight[this.chosenCell % NUM_Y].setColor(colors.COLOR_DIRECTION_CHOSEN);

        lastChosen = this.chosenCell;
        const paintingAs = chosenTool === tickType.DELETE
          ? tickType.BLANK
          : chosenTool;
        if (isPainting && this.chosenCell >= 0 && cells[this.chosenCell].getTick() !== paintingAs) {
          cells[this.chosenCell].paintCell(chosenTool);
          ticks[this.chosenCell] = paintingAs;
          if (chosenTool !== tickType.X) {
            updateDirectionTextColor(this.chosenCell, updateDirectionHelpers(this.chosenCell));
          }
          this.checkWin();
        }
      }
    };
  };

  this.setChosenCell = newCell => this.chosenCell = newCell;

  this.animate = () => {
    requestAnimationFrame(this.animate);
    this.c.clearRect(0, 0, this.xEdge, this.yEdge);
    cells.forEach(el => el.update(mouseX, mouseY, this.chosenCell, leftBoard, this));
    // toolText.update();
    yDirectionHighlight.forEach(el => el.update());
    xDirectionHighlight.forEach(el => el.update());
    xDirectionText.forEach(line => line.forEach(el => el.update()));
    yDirectionText.forEach(line => line.forEach(el => el.update()));
  };

  this.boardInit = () => {
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
        positions.X_START,
        yMapStart + i * (positions.CELL_SIZE) + (i - 1) * positions.GAP_SIZE + temp * positions.GAP_5_SIZE,
        xMapStart - positions.X_START - DIRECTION_GAP,
        positions.CELL_SIZE,
        colors.COLOR_DIRECTION_INVISIBLE,
        this.c,
      ));
      for (var j = 0; j < currDirection.length; j++) {
        currLine.push(new Text(
          xMapStart - (j + 1) * (positions.CELL_SIZE + DIRECTION_GAP) + DIRECTION_TEXT_PAD,
          yMapStart + i * (positions.CELL_SIZE + positions.GAP_SIZE) + temp * positions.GAP_5_SIZE + DIRECTION_TEXT_PAD,
          currDirection[currDirection.length - j - 1].toString(),
          DIRECTION_FONT_SIZE,
          positions.CELL_SIZE * 0.8,
          this.c,
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
        xMapStart + i * (positions.CELL_SIZE) + (i - 1) * positions.GAP_SIZE + temp * positions.GAP_5_SIZE,
        positions.Y_START,
        positions.CELL_SIZE,
        yMapStart - positions.Y_START - DIRECTION_GAP,
        colors.COLOR_DIRECTION_INVISIBLE,
        this.c,
      ));
      for (var j = 0; j < currDirection.length; j++) {
        currLine.push(new Text(
          xMapStart + i * (positions.CELL_SIZE + positions.GAP_SIZE) + temp * positions.GAP_5_SIZE + DIRECTION_TEXT_PAD,
          yMapStart - (j + 1) * (positions.CELL_SIZE + DIRECTION_GAP) + DIRECTION_TEXT_PAD,
          currDirection[currDirection.length - j - 1].toString(),
          DIRECTION_FONT_SIZE,
          positions.CELL_SIZE * 0.8,
          this.c,
        ));
      }
      yDirectionText.push(currLine);
    }
    // Initiate helpers
    for (var i = 0; i < NUM_X; i++) {
      if (!(i % 5)) {
        temp++;
      }
      const thisIndex = xMapStart + i * positions.CELL_SIZE + (i - 1) * positions.GAP_SIZE + temp * positions.GAP_5_SIZE;
      xCheatSheet.push(thisIndex);
    }
    temp = 0;
    for (var i = 0; i < NUM_Y; i++) {
      if (!(i % 5)) {
        temp++;
      }
      const thisIndex = yMapStart + i * positions.CELL_SIZE + (i - 1) * positions.GAP_SIZE + temp * positions.GAP_5_SIZE;
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
          xMapStart + i * positions.CELL_SIZE + (i - 1) * positions.GAP_SIZE + x5gaps * positions.GAP_5_SIZE,
          yMapStart + j * positions.CELL_SIZE + (j - 1) * positions.GAP_SIZE + y5gaps * positions.GAP_5_SIZE,
          index++,
          this.c,
        ));
        ticks.push(tickType.BLANK);
      }
    }
    // toolText = new Text(
    //   xCheatSheet[NUM_X - 1] + positions.CELL_SIZE + 20,
    //   yMapStart,
    //   tickType.BLANK,
    //   '30px',
    //   200,
    //   this.c,
    // );
  };

  this.checkWin = () => {
    for (let i = 0; i < ticks.length; i++) {
      if (win[i] === tickType.TICKED) {
        if (ticks[i] !== win[i]) {
          return false;
        }
      }
    }
    alert('You win!');
    this.boardInit();
    return true;
  };
}

function randomWin(tickedPercentage) {
  for (let i = 0; i < NUM_X; i++) {
    for (let j = 0; j < NUM_Y; j++) {
      win.push(Math.random() < tickedPercentage
        ? tickType.TICKED
        : tickType.BLANK);
    }
  }
}

function getTrains(tickArray, coord, isX, len) {
  const trains = [];
  let currTrain = 0;
  let nextCoord;
  // const maxCoord = isX ? NUM_Y : NUM_X;
  for (let i = 0; i < len; i++) {
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
  // If current has more numbers or has a bigger max
  if (expected.length < current.length
    || expected.reduce((acc, el) => (el > acc ? el : acc), 0) < current.reduce((acc, el) => (el > acc ? el : acc), 0)) {
    return expected.map(() => false);
  }

  const leftCheck = expected.reduce(cum => cum.concat([null]), []);
  const rightCheck = expected.reduce(cum => cum.concat([null]), []);

  let expectedIndex = 0;
  let currIndex = 0;

  while (expectedIndex < expected.length) {
    if (expected[expectedIndex] === current[currIndex]) {
      leftCheck[expectedIndex] = true;
      currIndex += 1;
    }
    expectedIndex++;
  }
  expectedIndex = expected.length - 1;
  currIndex = current.length - 1;
  while (expectedIndex >= 0) {
    if (expected[expectedIndex] === current[currIndex]) {
      rightCheck[expectedIndex] = true;
      currIndex--;
    }
    expectedIndex--;
  }
  const truthArray = [];
  for (let i = 0; i < leftCheck.length; i++) {
    truthArray.push(leftCheck[i] && rightCheck[i]);
  }

  return truthArray;
}

function updateDirectionHelpers(cellIndex) {
  const x = cellIndex % NUM_Y;
  const y = Math.floor(cellIndex / NUM_X);
  console.log('X and Y', x, y);
  console.log(yDirections);
  let thisReturn = compareTrainArrays(
    yDirections[y],
    getTrains(ticks, y, false, NUM_X),
  );
  yDirectionHelper[y] = thisReturn;

  thisReturn = compareTrainArrays(
    xDirections[x],
    getTrains(ticks, x, true, NUM_Y),
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
  let currLine;

  for (var i = 0; i < NUM_X; i++) {
    currLine = getTrains(win, i, false, NUM_X);
    yDirections.push(currLine);
    maxYdirections = Math.max(maxYdirections, currLine.length);
    yDirectionHelper.push(currLine.reduce(cum => cum.concat([null]), []));
  }

  for (var i = 0; i < NUM_Y; i++) {
    currLine = getTrains(win, i, true, NUM_Y);
    xDirections.push(currLine);
    maxXdirections = Math.max(maxXdirections, currLine.length);
    xDirectionHelper.push(currLine.reduce(cum => cum.concat([null]), []));
  }

  xMapStart = positions.X_START + (positions.CELL_SIZE + DIRECTION_GAP) * maxXdirections;
  yMapStart = positions.Y_START + (positions.CELL_SIZE + DIRECTION_GAP) * maxYdirections;
}

/**
 *  GAME FUNCTIONS
 */
function wipeBoard() {
  for (let i = 0; i < NUM_X; i++) {
    for (let j = 0; j < NUM_Y; j++) {
      cells[i * NUM_Y + j].setTick(tickType.BLANK);
      ticks[i * NUM_Y + j] = tickType.BLANK;
    }
  }
}

function giveUp() {
  for (let i = 0; i < NUM_X; i++) {
    for (let j = 0; j < NUM_Y; j++) {
      cells[i * NUM_Y + j].setTick(win[i * NUM_Y + j]);
      ticks[i * NUM_Y + j] = win[i * NUM_Y + j];
    }
  }
}

function getCellByPosition(x, y) {
  if (x < xMapStart || y < yMapStart) {
    return -1;
  }
  if (x > xCheatSheet[NUM_X - 1] + positions.CELL_SIZE
    || y > yCheatSheet[NUM_Y - 1] + positions.CELL_SIZE) {
    return -2;
  }

  const foundX = xCheatSheet.findIndex((el, ind) => ind === NUM_X || (x >= el && x < xCheatSheet[ind + 1]));
  const foundY = yCheatSheet.findIndex((el, ind) => ind === NUM_Y || (y >= el && y < yCheatSheet[ind + 1]));

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

function updateDirectionTextColor(chosenCell, newHelpers) {
  const x = Math.floor(chosenCell / NUM_X);
  const y = chosenCell % NUM_Y;
  console.log(chosenCell, newHelpers);
  for (var i = 0; i < newHelpers.x.length; i++) {
    if (newHelpers.x[i]) {
      xDirectionText[y][newHelpers.x.length - i - 1].setColor(colors.COLOR_CORRECT_DIRECTION_TEXT);
    } else {
      xDirectionText[y][newHelpers.x.length - i - 1].setColor(colors.COLOR_DIRECTION_TEXT);
    }
  }
  for (var i = 0; i < newHelpers.y.length; i++) {
    if (newHelpers.y[i]) {
      yDirectionText[x][newHelpers.y.length - i - 1].setColor(colors.COLOR_CORRECT_DIRECTION_TEXT);
    } else {
      yDirectionText[x][newHelpers.y.length - i - 1].setColor(colors.COLOR_DIRECTION_TEXT);
    }
  }
}

export default function Game({ updateToolCallback }) {
  const b = new Board();
  b.initialize(updateToolCallback);
  b.boardInit();
  b.animate();
}
