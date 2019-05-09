import { positions, tickType } from './system-constants';
import { hex2rgb } from './toolbox';

const RGB_CHANGE_SPEED = 3;

function updateRgbColor(from, to) {
  const returnObj = {};
  Object.keys(from).forEach((el) => {
    if (from[el] !== to[el]) {
      if (from[el] > to[el]) {
        returnObj[el] = Math.max(to[el], from[el] - RGB_CHANGE_SPEED);
      } else {
        returnObj[el] = Math.min(to[el], from[el] + RGB_CHANGE_SPEED);
      }
    } else {
      returnObj[el] = to[el];
    }
  });

  return returnObj;
}

function compareRgb(a, b) {
  return a.r === b.r
    && a.g === b.g
    && a.b === b.b;
}

export default function Cell(x, y, index, colorController, context) {
  this.x = x;
  this.y = y;
  this.color = hex2rgb(colorController.getColor('COLOR_BLANK'));
  this.index = index;
  this.size = positions.CELL_SIZE;
  this.isChosen = false;
  this.tick = tickType.BLANK;
  this.tickGrownBy = 0;
  this.xGrownBy = 0;
  this.TICK_GROW_SPEED = 3;
  this.TICK_GROW_TO = 0.8 * positions.CELL_SIZE;
  this.X_GROW_SPEED = 3;
  this.X_GROW_TO = 0.3 * positions.CELL_SIZE / 2;
  this.c = context;

  this.RGB_COLOR_CHOSEN = hex2rgb(colorController.getColor('COLOR_CHOSEN'));
  this.RGB_COLOR_BLANK = hex2rgb(colorController.getColor('COLOR_BLANK'));

  this.getTick = () => this.tick;
  this.setTick = override => this.tick = override;

  this.paintCell = (tick) => {
    if (tick === tickType.DELETE) {
      this.tick = tickType.BLANK;
    } else if (this.tick === tickType.BLANK) {
      this.tick = tick;
    }
  };

  this.draw = (c) => {
    c.fillStyle = `rgb(${this.color.r},${this.color.g},${this.color.b})`;
    c.fillRect(
      this.x,
      this.y,
      this.size,
      this.size,
    );
    if (this.tickGrownBy) {
      c.fillStyle = colorController.getColor('COLOR_FILL');
      c.fillRect(
        this.x + positions.CELL_SIZE / 2 - this.tickGrownBy / 2,
        this.y + positions.CELL_SIZE / 2 - this.tickGrownBy / 2,
        this.tickGrownBy,
        this.tickGrownBy,
      );
    }
    if (this.xGrownBy) {
      c.fillStyle = colorController.getColor('COLOR_X');
      c.beginPath();
      c.arc(
        this.x + positions.CELL_SIZE / 2,
        this.y + positions.CELL_SIZE / 2,
        this.xGrownBy,
        0,
        Math.PI * 2,
        false,
      );
      c.fill();
      c.stroke();
    }
  };

  this.growTick = () => {
    this.tickGrownBy = this.tickGrownBy + this.TICK_GROW_SPEED > this.TICK_GROW_TO
      ? this.TICK_GROW_TO
      : this.TICK_GROW_SPEED + this.tickGrownBy;
  };

  this.reduceTick = () => {
    this.tickGrownBy = this.tickGrownBy - this.TICK_GROW_SPEED < 0
      ? 0
      : this.tickGrownBy - this.TICK_GROW_SPEED;
  };

  this.growX = () => {
    this.xGrownBy = this.xGrownBy + this.X_GROW_SPEED > this.X_GROW_TO
      ? this.X_GROW_TO
      : this.X_GROW_SPEED + this.xGrownBy;
  };

  this.reduceX = () => {
    this.xGrownBy = this.xGrownBy - this.X_GROW_SPEED < 0
      ? 0
      : this.xGrownBy - this.X_GROW_SPEED;
  };

  this.update = (mouseX, mouseY, chosenCell, leftBoard, b) => {
    let thisChosenCell = chosenCell;
    this.isChosen = mouseX >= this.x
      && mouseY >= this.y
      && mouseX < this.x + this.size
      && mouseY < this.y + this.size;

    if (this.isChosen) {
      thisChosenCell = this.index;
      b.setChosenCell(this.index);
    } else if (thisChosenCell === this.index && leftBoard) {
      thisChosenCell = undefined;
      b.setChosenCell(undefined);
    }

    if (thisChosenCell === this.index && !compareRgb(this.color, this.RGB_COLOR_CHOSEN)) {
      this.color = updateRgbColor(this.color, this.RGB_COLOR_CHOSEN);
    } else if (thisChosenCell !== this.index && !compareRgb(this.color, this.RGB_COLOR_BLANK)) {
      this.color = updateRgbColor(this.color, this.RGB_COLOR_BLANK);
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

    this.draw(this.c);
  };
}
