import * as Mesh from './mesh.js';
import * as Stl from './stl.js';
import {message} from './message.js';

let meshes;

function getString(view, position, length) {
  let out = '';

  for (let i = 0; i < length; i++) {
    let b = view.getUint8(position + i);
    out += String.fromCharCode(b);
  }

  return out;
}

function processSTL(data) {
  length = data.byteLength;
  let view = new DataView(data);

  let header = getString(view, 0, 5);

  let binary = true;
  let text;

  // noinspection EqualityComparisonWithCoercionJS
  if (header == 'solid') {
    // probably ASCII
    text = getString(view, 0, length);
    if (text.includes('endfacet')) {
      binary = false;
    }
  }

  message(binary ? 'binary STL' : 'ASCII STL');
  let triangles = binary ? Stl.getBinarySTL(view) : Stl.getASCIISTL(text);
  message('data successfully read');
  Mesh.splitMesh(triangles);
}

function handleFileSelect(evt) {
  document.getElementById('progress').innerHTML = '';
  let e = document.getElementById('file');
  e.disabled = true;
  Mesh.setAllSplitMeshes([]);
  meshes = [];
  document.getElementById('console').innerHTML = '';

  let f = evt.target.files[0];

  message('reading ' + String(f.size) + ' bytes');

  Mesh.setBaseFileName(f.name.replace(/.*[/\\]/, '').
      replace(/\.[sS][tT][lL]$/, ''));

  let reader = new FileReader();
  reader.onload = function(event) {
    try {
      processSTL(event.target.result);
    } catch (err) {
      message('Error: ' + err);
      console.error(err.stack);
      let e = document.getElementById('file');
      e.disabled = false;
    }
  };
  reader.readAsArrayBuffer(f);
}

document.getElementById('file').
    addEventListener('change', handleFileSelect, false);
window['downloadMeshCombo'] = Mesh.downloadMeshCombo;
window['downloadMesh'] = Mesh.downloadMesh;
