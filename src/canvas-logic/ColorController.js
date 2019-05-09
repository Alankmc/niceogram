const colors = {
  debug: {
    COLOR_BLANK: '#f2f2f2',
    COLOR_CHOSEN: '#e0e0e0',
    COLOR_X: 'red',
    COLOR_FILL: 'black',
    COLOR_DIRECTION_INVISIBLE: 'rgba(0, 0, 0, 0)',
    COLOR_DIRECTION_CHOSEN: '#e0e0e0',
    COLOR_DIRECTION_TEXT: 'black',
    COLOR_CORRECT_DIRECTION_TEXT: 'rgba(0, 0, 0, 0.28)',
    TEXT_COLOR: 'black',
  },
  joy: {
    COLOR_BLANK: '#ece6d2',
    COLOR_CHOSEN: '#f2d7b4',
    COLOR_X: '#df9881',
    COLOR_FILL: '#58949c',
    COLOR_DIRECTION_INVISIBLE: 'rgba(0, 0, 0, 0)',
    COLOR_DIRECTION_CHOSEN: '#f2d7b4',
    COLOR_DIRECTION_TEXT: '#df9881',
    COLOR_CORRECT_DIRECTION_TEXT: 'rgb(223,152,129, 0.28)',
    TEXT_COLOR: '#df9881',
  },
};

function ColorController(colorScheme) {
  this.colorScheme = colorScheme || 'debug';

  this.setColorScheme = (newScheme) => { this.colorScheme = newScheme; };
  this.getColor = key => colors[this.colorScheme][key];
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
