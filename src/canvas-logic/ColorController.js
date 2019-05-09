import { hex2rgb } from './toolbox';

const colors = {
  debug: {
    COLOR_BLANK: '#f2f2f2',
    COLOR_CHOSEN: '#e0e0e0',
    COLOR_X: 'red',
    COLOR_FILL: 'black',
    COLOR_DIRECTION_INVISIBLE: 'rgba(0, 0, 0, 0)',
    COLOR_DIRECTION_CHOSEN: '#e0e0e0',
    COLOR_DIRECTION_TEXT: 'black',
    TEXT_COLOR: 'black',
    BACKGROUND_COLOR: 'pink',
  },
  brown: {
    COLOR_BLANK: '#F1F1F1',
    COLOR_CHOSEN: '#D1C3B7',
    COLOR_X: '#DDC1BD',
    COLOR_FILL: '#836853',
    COLOR_DIRECTION_INVISIBLE: 'rgba(0, 0, 0, 0)',
    COLOR_DIRECTION_CHOSEN: '#D1C3B7',
    COLOR_DIRECTION_TEXT: '#836853',
    TEXT_COLOR: '#836853',
    BACKGROUND_COLOR: '#D1C3B7',
  },
};

function ColorController(colorScheme) {
  this.colorScheme = colors[colorScheme || 'brown'];

  this.setColorScheme = (newScheme) => { this.colorScheme = colors[newScheme]; };
  this.getColor = (key) => {
    if (key === 'COLOR_CORRECT_DIRECTION_TEXT') {
      const thisColor = hex2rgb(this.colorScheme.COLOR_DIRECTION_TEXT);

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
