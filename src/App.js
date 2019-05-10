import React, { Component } from 'react';
import Canvas from './Canvas';
import Toolbelt from './Toolbelt';
import ColorControllerSingleton from './canvas-logic/ColorController';

const colorController = ColorControllerSingleton.getInstance();

class App extends Component {
  state = {
    tool: null,
  }

  updateTool = tool => this.setState({ tool })

  render() {
    return (
      <div className="app-container" style={{ 'background-color': colorController.getColor('BACKGROUND_COLOR') }}>
        <div className="App">
          <Canvas updateToolCallback={this.updateTool} />
          <Toolbelt tool={this.state.tool} />
        </div>
      </div>
    );
  }
}

export default App;
