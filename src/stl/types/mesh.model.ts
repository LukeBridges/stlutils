import { Triangles } from "./triangles.type";
import * as mesh from "src/stl/mesh";

export class Mesh {
    points: {} = {};
    triangles: Triangles = [];
    bounds: number[] = [];

    constructor() {
    }

    describeBounds(): string {
        if (this.bounds.length !== 6) return '';
        return "(" + this.bounds[0].toFixed(2) + ", " + this.bounds[1].toFixed(2) + ", " + this.bounds[2].toFixed(2) + ") - (" +
            this.bounds[3].toFixed(2) + ", " + this.bounds[4].toFixed(2) + ", " + this.bounds[5].toFixed(2) + ")";
    }

    getRawFile() {
        return window.URL.createObjectURL(new Blob([mesh.makeMeshByteArray([this.triangles])]));
    }

    static compareByBounds(m: Mesh, mm: Mesh) {
        for (let i = 0; i < 6; i++) {
            if (m.bounds[i] < mm.bounds[i])
                return -1;
            else if (mm.bounds[i] < m.bounds[i])
                return 1;
        }
        return 0;
    }
}