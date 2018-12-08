export default function Text(x, y, text, size, maxWidth, context) {
  this.x = x;
  this.y = y;
  this.text = text;
  this.size = size;
  this.color = 'black';
  this.c = context;
  this.setText = text => this.text = text;
  this.setColor = color => this.color = color;

  this.draw = () => {
    this.c.textBaseline = 'hanging';
    this.c.textAlign = 'left';
    this.c.fillStyle = this.color;
    this.c.font = this.size + ' Arial';
    this.c.fillText(this.text, this.x, this.y, maxWidth);
  };

  this.update = () => {
    this.draw();
  };
}