// For hashing during splitting, ASCII mode is used, where vectors are stored
// as strings. From a binary STL, the vectors are stored as hex strings, and
// from an ASCII STL, they are stored as directly extracted ASCII.

const ASCII_MODE = true;

export function getVector(view, position) {
  let x, y, z;

  if (ASCII_MODE) {
    function fixZero(a) {
      // noinspection EqualityComparisonWithCoercionJS
      return a == 0x80000000 ? 0 : a;
    }

    x = fixZero(view.getUint32(position, true));
    y = fixZero(view.getUint32(position + 4, true));
    z = fixZero(view.getUint32(position + 8, true));
    return x.toString(16) + ':' + y.toString(16) + ':' + z.toString(16);
  }

  x = view.getFloat32(position, true);
  y = view.getFloat32(position + 4, true);
  z = view.getFloat32(position + 8, true);
  return [x, y, z];
}

export function parseVector(vector) {
  if (typeof vector === 'string') {
    let data = vector.split(':');
    let buf = new ArrayBuffer(4);
    let view = new DataView(buf);

    function parse(s) {
      view.setUint32(0, parseInt(s, 16));
      return view.getFloat32(0);
    }

    return [parse(data[0]), parse(data[1]), parse(data[2])];
  } else {
    return vector;
  }
}

export function setVector(view, position, vector) {
  if (typeof vector === 'string') {
    let data = vector.split(':');
    view.setUint32(position, parseInt(data[0], 16), true);
    view.setUint32(position + 4, parseInt(data[1], 16), true);
    view.setUint32(position + 8, parseInt(data[2], 16), true);
  } else {
    view.setFloat32(position, vector[0], true);
    view.setFloat32(position + 4, vector[1], true);
    view.setFloat32(position + 8, vector[2], true);
  }
}

export function getVectorFromText(line, position) {
  let data = line.substr(position).split(/[\s,]+/);

  if (data.length < 3)
    throw 'Invalid vector';

  if (ASCII_MODE) {
    let buf = new ArrayBuffer(4);
    let view = new DataView(buf);

    function toHex32(number) {
      view.setFloat32(0, parseFloat(number));
      return view.getUint32(0).toString(16);
    }

    return toHex32(data[0]) + ':' + toHex32(data[1]) + ':' + toHex32(data[2]);
  }

  return [parseFloat(data[0]), parseFloat(data[1]), parseFloat(data[2])];
}
