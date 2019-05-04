import React from 'react';
import Game from './canvas-logic/main';

export default class Canvas extends React.Component {
  componentDidMount() {
    const { updateToolCallback } = this.props;
    Game({ updateToolCallback });
  }

  render() {
    return (
      <div className="canvas-grid">
        <div className="canvas-container">
          <canvas id="main-canvas" />
        </div>
        <div className="canvas-button">
          <input type="text" id="map-width" placeholder="Width" />
          <input type="text" id="map-height" placeholder="Height" />
        </div>
        <div>
          {/* <button onClick="changeSizes()">INIT</button> */}
          {/* <button onClick="wipeBoard()">Wipe Board</button> */}
          {/* <button onclick="giveUp()">Give UP</button> */}
        </div>
      </div>
    );
  }
}
