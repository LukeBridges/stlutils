import {message} from './message.js';
import * as Vector from './vector.js';

export const TRIANGLE_SIZE = (3 + 3 * 3) * 4 + 2;
let allSplitMeshes = [];
let splitMeshIndex;
let baseFileName = '';

export function getAllSplitMeshes() {
  return allSplitMeshes;
}

export function setAllSplitMeshes(inMeshes) {
  allSplitMeshes = inMeshes;
}

export function setBaseFileName(fileName) {
  baseFileName = fileName;
}

function describeBounds(bounds) {
  return '(' + bounds[0].toFixed(2) + ', ' + bounds[1].toFixed(2) + ', ' +
      bounds[2].toFixed(2) + ') - (' +
      bounds[3].toFixed(2) + ', ' + bounds[4].toFixed(2) + ', ' +
      bounds[5].toFixed(2) + ')';
}

function meshSelection(meshes) {
  message(String(meshes.length) + ' meshes extracted');

  let out = '<p>Download individual part meshes or combine them with checkmarks:<br/>';

  allSplitMeshes = [];

  for (let i = 0; i < meshes.length; i++) {
    allSplitMeshes.push(meshes[i].triangles);
    out += '<input type=\'checkbox\' id=\'mesh' + i +
        '\'/><a href=\'#\' onclick=\'downloadMesh([' + i + ']);\'>mesh part ' +
        (i + 1) + '</a> ' + describeBounds(meshes[i].bounds) + '<br/>';
  }

  out += '<button onclick=\'downloadMeshCombo();\'>Download combination</button></p>';

  document.getElementById('progress').innerHTML = out;
}

function downloadBlob(name, blob) {
  let link = document.createElement('a');
  document.body.appendChild(link);
  link.download = name;
  link.href = window.URL.createObjectURL(blob);
  link.onclick = function() {
    setTimeout(function() {
      window.URL.revokeObjectURL(link.href);
    }, 1600);
  };
  link.click();
  try {
    link.remove();
  } catch (err) {
  }
  try {
    document.body.removeChild(link);
  } catch (err) {
  }
}

export function downloadMeshCombo() {
  let list = [];
  for (let i = 0; i < allSplitMeshes.length; i++) {
    if (document.getElementById('mesh' + i).checked)
      list.push(i);
  }
  // noinspection EqualityComparisonWithCoercionJS
  if (list.length == 0)
    return;
  downloadMesh(list);
}

export function splitMesh(triangles) {
  let meshes = [];
  splitMeshIndex = 0;

  function process() {
    let i = splitMeshIndex;
    let t0 = Date.now();

    document.getElementById('progress').innerHTML = 'Splitting ' +
        (i / triangles.length * 100).toFixed(1) + '% done (' + (meshes.length) +
        ' parts found)';

    for (; i < triangles.length; i++) {
      let t = triangles[i];
      let matches = [];

      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < meshes.length; k++) {
          // noinspection EqualityComparisonWithCoercionJS
          if (matches.indexOf(k) == -1 && t[j] in meshes[k].points) {
            matches.push(k);
          }
        }
      }

      matches.sort((x, y) => (x < y ? -1 : (x > y ? 1 : 0)));

      let m, mm;
      // noinspection EqualityComparisonWithCoercionJS
      if (matches.length == 0) {
        m = {points: {}, triangles: []};
        meshes.push(m);
      } else {
        m = meshes[matches[0]];
        for (let j = matches.length - 1; j >= 1; j--) {
          mm = meshes[matches[j]];
          for (let key in mm.points) {
            if (mm.points.hasOwnProperty(key))
              m.points[key] = true;
          }
          for (let k = 0; k < mm.triangles.length; k++) {
            m.triangles.push(mm.triangles[k]);
          }
          meshes.splice(matches[j], 1);
        }
      }
      for (let k = 0; k < 3; k++) {
        m.points[t[k]] = true;
      }
      m.triangles.push(t);

      if (Date.now() >= t0 + 500) {
        setTimeout(process, 0);
        splitMeshIndex = i + 1;
        return;
      }
    }

    for (let i = 0; i < meshes.length; i++) {
      let bounds = [
        Number.POSITIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.NEGATIVE_INFINITY];

      for (let key in meshes[i].points) {
        if (meshes[i].points.hasOwnProperty(key)) {
          let v = Vector.parseVector(key);
          for (let k = 0; k < 3; k++) {
            bounds[k] = Math.min(bounds[k], v[k]);
            bounds[3 + k] = Math.max(bounds[3 + k], v[k]);
          }
        }
      }

      meshes[i].bounds = bounds;
      delete meshes[i].points;
    }

    function compareByBounds(m, mm) {
      for (let i = 0; i < 6; i++) {
        if (m.bounds[i] < mm.bounds[i])
          return -1;
        else if (mm.bounds[i] < m.bounds[i])
          return 1;
      }
      return 0;
    }

    meshes.sort(compareByBounds);

    document.getElementById('progress').innerHTML = '';
    document.getElementById('file').disabled = false;

    // noinspection EqualityComparisonWithCoercionJS
    if (meshes.length == 1) {
      window.message('No splitting done: Only one mesh in file.');
    } else { // noinspection EqualityComparisonWithCoercionJS
      if (meshes.length == 0) {
            window.message('No mesh found in file.');
          } else {
            meshSelection(meshes);
          }
    }

    meshes = [];
  }

  process();
}

function makeMeshByteArray(triangleLists) {
  let totalTriangles = 0;

  for (let i = 0; i < triangleLists.length; i++)
    totalTriangles += triangleLists[i].length;

  let data = new ArrayBuffer(84 + totalTriangles * TRIANGLE_SIZE);
  let view = new DataView(data);
  view.setUint32(80, totalTriangles, true);
  let offset = 84;
  for (let i = 0; i < triangleLists.length; i++) {
    let triangles = triangleLists[i];
    for (let j = 0; j < triangles.length; j++) {
      Vector.setVector(view, offset, triangles[j][3]); // normal
      Vector.setVector(view, offset + 12, triangles[j][0]); // v1
      Vector.setVector(view, offset + 12 * 2, triangles[j][1]); // v2
      Vector.setVector(view, offset + 12 * 3, triangles[j][2]); // v3
      offset += TRIANGLE_SIZE;
    }
  }
  return view.buffer;
}

export function downloadMesh(list) {
  // noinspection EqualityComparisonWithCoercionJS
  if (list.length == 0)
    return;
  let name = baseFileName;
  let toMake = [];
  for (let i = 0; i < list.length; i++) {
    name += '-' + (list[i] + 1);
    toMake.push(allSplitMeshes[list[i]]);
  }
  downloadBlob(name + '.stl', new Blob([makeMeshByteArray(toMake)],
      {type: 'application/octet-stream'}));
}
