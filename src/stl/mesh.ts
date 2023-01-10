import { downloadMesh } from "./download";
import { message } from "./log";
import { Mesh } from "./types/mesh.model";
import { Triangles } from "./types/triangles.type";
import { Vector } from "./types/vector.type";
import { parseVector, setVector } from "./vector";

export function meshSelection(meshes: string | any[]) {
    message(String(meshes.length) + " meshes extracted");

    window['stl'].allSplitMeshes = [];

    for (var i = 0; i < meshes.length; i++) {
        window['stl'].allSplitMeshes.push(meshes[i]);
    }
}

export function downloadMeshCombo() {
    const list: any[] = [];
    for (var i = 0; i < window['stl'].allSplitMeshes.length; i++) {
        // if (document.getElementById('mesh'+i).checked)
        // list.push(i);
    }
    if (list.length == 0)
        return;
    downloadMesh(list);
}

export function splitMesh(triangles: Triangles) {
    window['stl'].meshes = [];
    window['stl'].splitMeshIndex = 0;

    function process() {
        var i = window['stl'].splitMeshIndex;
        var t0 = Date.now();

        window['stl'].progress = "Splitting " + (i / triangles.length * 100).toFixed(1) + '% done (' + (window['stl'].meshes.length) + ' parts found)';

        for (; i < triangles.length; i++) {
            var t = triangles[i];
            var matches = [];

            for (var j = 0; j < 3; j++) {
                for (var k = 0; k < window['stl'].meshes.length; k++) {
                    if (matches.indexOf(k) == -1 && t[j] in window['stl'].meshes[k].points) {
                        matches.push(k);
                    }
                }
            }

            matches.sort((x, y) => (x < y ? -1 : (x > y ? 1 : 0)));

            let m: Mesh = new Mesh();
            if (matches.length == 0) {
                window['stl'].meshes.push(m);
            } else {
                m = window['stl'].meshes[matches[0]];
                for (let j = matches.length - 1; j >= 1; j--) {
                    const mm: Mesh = window['stl'].meshes[matches[j]];
                    for (let key in mm.points) {
                        if (mm.points.hasOwnProperty(key) && m.points)
                            m.points[key] = true;
                    }
                    for (let k = 0; k < mm.triangles.length; k++) {
                        m.triangles.push(mm.triangles[k]);
                    }
                    window['stl'].meshes.splice(matches[j], 1);
                }
            }
            for (var k = 0; k < 3; k++) {
                if (m && m.points) m.points[t[k]] = true;
            }
            m.triangles.push(t);

            if (Date.now() >= t0 + 500) {
                setTimeout(process, 0);
                window['stl'].splitMeshIndex = i + 1;
                return;
            }
        }

        for (var i = 0; i < window['stl'].meshes.length; i++) {
            var bounds = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];

            for (var key in window['stl'].meshes[i].points) {
                if (window['stl'].meshes[i].points.hasOwnProperty(key)) {
                    var v = parseVector(key);
                    for (var k = 0; k < 3; k++) {
                        bounds[k] = Math.min(bounds[k], v[k]);
                        bounds[3 + k] = Math.max(bounds[3 + k], v[k]);
                    }
                }
            }

            window['stl'].meshes[i].bounds = bounds;
            delete window['stl'].meshes[i].points;
        }

        window['stl'].meshes.sort(Mesh.compareByBounds);
        window['stl'].progress = '';

        if (window['stl'].meshes.length == 0) {
            message("No mesh found in file.");
        }
        else {
            meshSelection(window['stl'].meshes);
        }

        window['stl'].meshes = [];
    }

    process();
}

export function makeMeshByteArray(triangleLists: string | any[]) {
    var totalTriangles = 0;

    for (var i = 0; i < triangleLists.length; i++)
        totalTriangles += triangleLists[i].length;

    var data = new ArrayBuffer(84 + totalTriangles * window['stl'].TRIANGLE_SIZE);
    var view = new DataView(data);
    view.setUint32(80, totalTriangles, true);
    var offset = 84;
    for (var i = 0; i < triangleLists.length; i++) {
        var triangles = triangleLists[i];
        for (var j = 0; j < triangles.length; j++) {
            setVector(view, offset, triangles[j][3]); // normal
            setVector(view, offset + 12, triangles[j][0]); // v1
            setVector(view, offset + 12 * 2, triangles[j][1]); // v2
            setVector(view, offset + 12 * 3, triangles[j][2]); // v3
            offset += window['stl'].TRIANGLE_SIZE;
        }
    }
    return view.buffer;
}