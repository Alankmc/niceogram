import React from 'react';

const toolIcons = {
  X: 'flag',
  TICKED: 'pencil-alt',
  DELETE: 'eraser',
};

export default function Toolbubble(props) {
  const { chosen, tool } = props;
  return (
    <div className={`toolbubble ${chosen ? 'toolbubble--chosen' : ''} toolbubble--${tool}`}>
      <div>
        <i className={`fas fa-${toolIcons[tool]}`} />
      </div>
    </div>
  );
}
