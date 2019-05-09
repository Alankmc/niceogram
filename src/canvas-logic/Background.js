export default function Background(color, width, height, c) {
  this.update = () => {
    c.fillStyle = color;
    c.fillRect(0, 0, width, height);
  };
}
