export default function Text(x, y, text, size, color, maxWidth, context) {
  this.x = x + maxWidth / 2;
  this.y = y;
  this.text = text;
  this.size = size;
  this.color = color;
  this.c = context;

  this.setText = text => this.text = text;
  this.setColor = color => this.color = color;
  this.draw = () => {
    this.c.textBaseline = 'hanging';
    this.c.textAlign = 'center';
    this.c.fillStyle = this.color;
    this.c.font = `bold ${this.size} Quicksand`;
    this.c.fillText(this.text, this.x, this.y, maxWidth);
  };

  this.update = () => {
    this.draw();
  };
}
