import { hex2rgb } from './toolbox';

const colors = {
  debug: {
    COLOR_BLANK: '#f2f2f2',
    COLOR_CHOSEN: '#e0e0e0',
    COLOR_X: 'red',
    COLOR_FILL: 'black',
    COLOR_DIRECTION_INVISIBLE: 'rgba(0, 0, 0, 0)',
    COLOR_DIRECTION_CHOSEN: '#e0e0e0',
    TEXT_COLOR: 'black',
    BACKGROUND_COLOR: 'pink',
  },
  woodBridge: {
    COLOR_BLANK: '#a29a9d',
    COLOR_CHOSEN: '#605c64',
    COLOR_X: '#554853',
    COLOR_FILL: '#251c1c',
    COLOR_DIRECTION_INVISIBLE: 'rgba(0, 0, 0, 0)',
    COLOR_DIRECTION_CHOSEN: '#a29a9d',
    TEXT_COLOR: '#251c1c',
    BACKGROUND_COLOR: '#d6d0d0',
  },
};

function ColorController(colorScheme) {
  this.colorScheme = colors[colorScheme || 'woodBridge'];

  this.setColorScheme = (newScheme) => { this.colorScheme = colors[newScheme]; };
  this.getColor = (key) => {
    if (key === 'COLOR_CORRECT_DIRECTION_TEXT') {
      const thisColor = hex2rgb(this.colorScheme.TEXT_COLOR);

      return `rgba(${thisColor.r}, ${thisColor.g}, ${thisColor.b}, 0.3)`;
    }
    return this.colorScheme[key];
  };
}

let instance = null;

export default class ColorControllerSingleton {
  static createInstance() { return new ColorController(); }

  static getInstance() {
    if (!instance) {
      instance = ColorControllerSingleton.createInstance();
    }
    return instance;
  }
}
