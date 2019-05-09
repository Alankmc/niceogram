import { hex2rgb } from './toolbox';

const OPACITY_SPEED = 0.1;

export default function DirectionHighlight(x, y, width, height, color, context) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.color = hex2rgb(color);
  this.c = context;
  this.isActive = false;
  this.opacity = 0;

  this.setColor = (newColor) => {
    this.color = newColor;
  };

  this.setActive = (isActive) => {
    this.isActive = isActive;
  };

  this.draw = () => {
    if (this.isActive && this.opacity < 1) {
      this.opacity = Math.min(this.opacity + OPACITY_SPEED, 1);
    } else if (!this.isActive && this.opacity > 0) {
      this.opacity = Math.max(this.opacity - OPACITY_SPEED, 0);
    }

    this.c.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${this.opacity})`;
    this.c.fillRect(
      this.x,
      this.y,
      this.width,
      this.height,
    );
  };

  this.update = () => {
    this.draw();
  };
}
