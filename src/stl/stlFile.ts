import { message } from "./log";
import { splitMesh } from "./mesh";
import { Vector } from "./types/vector.type";
import { getVectorFromText, getVector } from "./vector";

export function getString(view: DataView, position: number, length: number) {
    var out = "";

    for (var i = 0; i < length; i++) {
        var b = view.getUint8(position + i);
        out += String.fromCharCode(b);
    }

    return out;
}

export function getASCIISTL(text: string | undefined) {
    var triangles = [];

    var triangle = [];
    var normal: any = [0, 0, 0];

    var lines = text?.split(/[\r\n]+/) || [];

    message(lines.length + " lines of data");

    for (var i = 0; i < lines.length; i++) {
        const l = lines[i].trim().toLowerCase();
        if (l == 'endfacet') {
            if (triangle.length != 3)
                throw 'invalid triangle';
            triangles.push([triangle[0], triangle[1], triangle[2], normal]);
            triangle = [];
            normal = [0, 0, 0];
        }
        else if (l.startsWith('facet')) {
            if (l.length > 6) {
                if (l.substr(6).startsWith('normal'))
                    normal = getVectorFromText(l, 13);
            }
        }
        else if (l.startsWith('vertex')) {
            if (l.length > 7)
                triangle.push(getVectorFromText(l, 7));
        }
    }

    message(String(triangles.length) + " triangles");

    return triangles;
}

export function getBinarySTL(view: DataView) {
    let triangles = [];
    let numTriangles = view.getUint32(80, true);

    message(String(numTriangles) + " triangles");

    for (let i = 0; i < numTriangles; i++) {
        const position = 84 + window['stl'].TRIANGLE_SIZE * i;

        const normal: Vector = getVector(view, position);
        const v1: Vector = getVector(view, position + 12);
        const v2: Vector = getVector(view, position + 12 * 2);
        const v3: Vector = getVector(view, position + 12 * 3);
        triangles.push([v1, v2, v3, normal]);
    }

    return triangles;
}

export function processSTL(data: ArrayBuffer) {
    const length = data.byteLength;
    const view = new DataView(data);
    const header = getString(view, 0, 5);

    let binary = true;
    let text;

    if (header == "solid") {
        // probably ASCII
        text = getString(view, 0, length);
        if (text.includes("endfacet")) {
            binary = false;
        }
    }

    message(binary ? "binary STL" : "ASCII STL");
    const triangles = binary ? getBinarySTL(view) : getASCIISTL(text);
    message("data successfully read");
    splitMesh(triangles);
}