export function hex2rgb(color) {
  const splitColor = color.split('#');
  const justNumbers = splitColor[splitColor.length - 1];
  return {
    r: parseInt(justNumbers[0] + justNumbers[1], 16),
    g: parseInt(justNumbers[2] + justNumbers[3], 16),
    b: parseInt(justNumbers[4] + justNumbers[5], 16),
  };
}

export const hello = 1;
