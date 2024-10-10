import Canvas from '@/graveyeard/Canvas';
import React from 'react';

const Main = () => {
  const [tool, setTool] = React.useState('');
  return (
    <div>
      Using: {tool}
      <Canvas onToolChange={(newTool) => setTool(newTool)} />
    </div>
  );
};

export default Main;
