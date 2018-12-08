import React, { Component } from 'react';
import Canvas from './Canvas';

class App extends Component {
  render() {
    console.log('Rendering App');
    return (
      <div className="App">
        <Canvas />
      </div>
    );
  }
}

export default App;
