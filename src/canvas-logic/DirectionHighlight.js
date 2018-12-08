export default function DirectionHighlight(x, y, width, height, color, context) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.color = color;
  this.c = context;

  this.setColor = (color) => {
    this.color = color;
  }
  
  this.draw = () => {
    this.c.fillStyle = this.color;
    this.c.fillRect(
      this.x,
      this.y,
      this.width,
      this.height,
    );
  }

  this.update = () => {
    this.draw();
  }
}