import React from 'react';
import Toolbubble from './Toolbubble';
import ColorControllerSingleton from './canvas-logic/ColorController';

const colorController = ColorControllerSingleton.getInstance();

export default function Toolbelt(props) {
  const { tool } = props;
  return (
    <div className="toolbelt">
      <Toolbubble chosen={tool === 'X'} tool="X" color={colorController.getColor('COLOR_X')} />
      <Toolbubble chosen={tool === 'TICKED'} tool="TICKED" color={colorController.getColor('COLOR_X')} />
      <Toolbubble chosen={tool === 'DELETE'} tool="DELETE" color={colorController.getColor('COLOR_X')} />
    </div>
  );
}
