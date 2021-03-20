import {message} from './message.js';
import {TRIANGLE_SIZE} from './mesh.js';
import * as Vector from './vector.js';

export function getASCIISTL(text) {
  let triangles = [];

  let triangle = [];
  let normal = [0, 0, 0];

  let lines = text.split(/[\r\n]+/);

  message(lines.length + ' lines of data');

  for (let i = 0; i < lines.length; i++) {
    let l = lines[i].trim().toLowerCase();
    // noinspection EqualityComparisonWithCoercionJS
    if (l == 'endfacet') {
      // noinspection EqualityComparisonWithCoercionJS
      if (triangle.length != 3)
        throw 'invalid triangle';
      triangles.push([triangle[0], triangle[1], triangle[2], normal]);
      triangle = [];
      normal = [0, 0, 0];
    } else if (l.startsWith('facet')) {
      if (l.length > 6) {
        if (l.substr(6).startsWith('normal'))
          normal = Vector.getVectorFromText(l, 13);
      }
    } else if (l.startsWith('vertex')) {
      if (l.length > 7)
        triangle.push(Vector.getVectorFromText(l, 7));
    }
  }

  message(String(triangles.length) + ' triangles');

  return triangles;
}

export function getBinarySTL(view) {
  let triangles = [];

  let numTriangles = view.getUint32(80, true);

  message(String(numTriangles) + ' triangles');

  for (let i = 0; i < numTriangles; i++) {
    let position = 84 + TRIANGLE_SIZE * i;

    let normal = Vector.getVector(view, position);
    let v1 = Vector.getVector(view, position + 12);
    let v2 = Vector.getVector(view, position + 12 * 2);
    let v3 = Vector.getVector(view, position + 12 * 3);
    triangles.push([v1, v2, v3, normal]);
  }

  return triangles;
}
