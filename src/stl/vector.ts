import { Vector } from "./types/vector.type";

export function getVector(view: DataView, position: number): Vector {
    if (window['stl'].ASCII_MODE) {
        function fixZero(a: number) {
            return a == 0x80000000 ? 0 : a;
        }
        const x = fixZero(view.getUint32(position, true));
        const y = fixZero(view.getUint32(position + 4, true));
        const z = fixZero(view.getUint32(position + 8, true));
        return x.toString(16) + ":" + y.toString(16) + ":" + z.toString(16);
    }

    const x = view.getFloat32(position, true);
    const y = view.getFloat32(position + 4, true);
    const z = view.getFloat32(position + 8, true);
    return [x, y, z]; // x.toString()+","+y.toString()+","+z.toString(); //[x,y,z];
}

export function parseVector(vector: Vector) {
    if (typeof vector === "string") {
        var data = vector.split(":");
        var buf = new ArrayBuffer(4);
        var view = new DataView(buf);
        function parse(s: string) {
            view.setUint32(0, parseInt(s, 16));
            return view.getFloat32(0);
        }
        return [parse(data[0]), parse(data[1]), parse(data[2])];
    }
    else {
        return vector;
    }
}

export function setVector(view: DataView, position: number, vector: Vector) {
    if (typeof vector === "string") {
        var data = vector.split(":");
        view.setUint32(position, parseInt(data[0], 16), true);
        view.setUint32(position + 4, parseInt(data[1], 16), true);
        view.setUint32(position + 8, parseInt(data[2], 16), true);
    }
    else {
        view.setFloat32(position, vector[0], true);
        view.setFloat32(position + 4, vector[1], true);
        view.setFloat32(position + 8, vector[2], true);
    }
}

export function getVectorFromText(line: string, position: any): Vector {
    var data = line.substr(position).split(/[\s,]+/);

    if (data.length < 3)
        throw 'Invalid vector';

    if (window['stl'].ASCII_MODE) {
        var buf = new ArrayBuffer(4);
        var view = new DataView(buf);

        function toHex32(number: string) {
            view.setFloat32(0, parseFloat(number));
            return view.getUint32(0).toString(16);
        }

        return toHex32(data[0]) + ":" + toHex32(data[1]) + ":" + toHex32(data[2]);
    }

    return [parseFloat(data[0]), parseFloat(data[1]), parseFloat(data[2])];
}