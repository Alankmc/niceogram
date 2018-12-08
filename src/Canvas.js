import React from 'react';
import Game from './canvas-logic/main';
export default class Canvas extends React.Component {
  componentDidMount() {
    Game();
  }

  render() {
    console.log('Rendering canvas');
    return (
      <div>
        <canvas id="main-canvas"></canvas>
        <input type="text" id="map-width" placeholder="Width" />
        <input type="text" id="map-height" placeholder="Height" />
        {/* <button onClick="changeSizes()">INIT</button> */}
        <br />
        {/* <button onClick="wipeBoard()">Wipe Board</button> */}
        {/* <button onclick="giveUp()">Give UP</button> */}
      </div>
    );
  }
}
