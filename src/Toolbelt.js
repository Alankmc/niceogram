import React from 'react';
import Toolbubble from './Toolbubble';

export default function Toolbelt(props) {
  const { tool } = props;
  return (
    <div className="toolbelt">
      <Toolbubble chosen={tool === 'X'} tool="X" />
      <Toolbubble chosen={tool === 'TICKED'} tool="TICKED" />
      <Toolbubble chosen={tool === 'DELETE'} tool="DELETE" />
    </div>
  );
}
