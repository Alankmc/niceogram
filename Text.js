function Text(x, y, text, size, maxWidth) {
  this.x = x;
  this.y = y;
  this.text = text;
  this.size = size;
  this.color = 'black';

  this.setText = text => this.text = text;
  this.setColor = color => this.color = color;

  this.draw = () => {
    c.textBaseline = 'hanging';
    c.textAlign = 'left';
    c.fillStyle = this.color;
    c.font = this.size + ' Arial';
    c.fillText(this.text, this.x, this.y);
  };

  this.update = () => {
    this.draw();
  };
}