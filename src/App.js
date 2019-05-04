import React, { Component } from 'react';
import Canvas from './Canvas';
import Toolbelt from './Toolbelt';

class App extends Component {
  state = {
    tool: null,
  }

  updateTool = tool => this.setState({ tool })

  render() {
    console.log('Rendering App');
    return (
      <div className="App">
        <Canvas updateToolCallback={this.updateTool} />
        <Toolbelt tool={this.state.tool} />
      </div>
    );
  }
}

export default App;
