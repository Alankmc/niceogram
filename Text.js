function Text(x, y, text, size, maxWidth) {
  this.x = x;
  this.y = y;
  this.text = text;
  this.size = size;
  this.setText = text => this.text = text;

  this.draw = () => {
    c.textBaseline = 'hanging';
    c.textAlign = 'left';
    c.font = this.size + ' Arial';
    c.strokeText(this.text, this.x, this.y, maxWidth);
  };

  this.update = () => {
    this.draw();
  };
}