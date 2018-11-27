const canvas = document.getElementById('main-canvas');
const xEdge = window.innerWidth;
const yEdge = window.innerHeight;
canvas.width = xEdge;
canvas.height = yEdge;

const X_START = 30;
const Y_START = 30;
const CELL_SIZE = 25;
const GAP_SIZE = 1;
const COLOR_BLANK = '#f2f2f2';
const COLOR_CHOSEN = '#e0e0e0';
let mouseX;
let mouseY;
let chosenCell;
const c = canvas.getContext('2d');

function Cell(x, y, index) {
  this.x = x;
  this.y = y;
  this.color = COLOR_BLANK;
  this.index = index;

  this.CELL_GROW = 2;
  this.GROW_TO = 12;
  this.grownBy = 0;
  this.size = CELL_SIZE;
  this.isChosen = false;

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
    if (this.isChosen && this.color !== COLOR_CHOSEN) {
      chosenCell = this.index;
      this.color = COLOR_CHOSEN;
    } else if (!this.isChosen && this.color === COLOR_CHOSEN) {
      this.color = COLOR_BLANK;
    }
    // if (this.isChosen && this.grownBy < this.GROW_TO) {
      // this.grownBy += this.CELL_GROW;
    // } else if (!this.isChosen && this.grownBy > 0) {
      // this.grownBy -= this.CELL_GROW;
    // }

    this.draw();
  };
}

canvas.onmousemove = (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
};

const cells = [];
const ticks = [];
let index = 0;
let colorFlip = false;
for (var i = 0; i < 20; i++) {
  for (var j = 0; j < 20; j++) {
    cells.push(new Cell(
      X_START + i * CELL_SIZE + (i - 1) * GAP_SIZE,
      Y_START + j * CELL_SIZE + (j - 1) * GAP_SIZE,
      colorFlip ? '#f2f2f2' : '#e0e0e0',
      index++
      ));
    ticks.push(null);
    colorFlip = !colorFlip;
  }
  colorFlip = !colorFlip;
}

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, xEdge, yEdge);
  cells.forEach(el => el.update());
  cells[chosenCell].draw();
}
animate();