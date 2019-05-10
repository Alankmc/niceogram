import React from 'react';
import ColorControllerSingleton from './canvas-logic/ColorController';

const colorController = ColorControllerSingleton.getInstance();

const toolIcons = {
  X: 'flag',
  TICKED: 'pencil-alt',
  DELETE: 'eraser',
};

export default function Toolbubble(props) {
  const { chosen, tool, color } = props;
  return (
    <div
      className={`toolbubble ${chosen ? 'toolbubble--chosen' : ''} toolbubble--${tool}`}
      style={{ color: colorController.getColor('COLOR_BLANK'), 'background-color': color }}
    >
      <div>
        <i className={`fas fa-${toolIcons[tool]}`} />
      </div>
    </div>
  );
}
