import { Mesh } from "./types/mesh.model";

export function setVars() {
    window['stl'] = {
        baseFilename: '',
        allSplitMeshes: <Mesh[]>[],
        TRIANGLE_SIZE: (3 + 3 * 3) * 4 + 2,
        ASCII_MODE: true,
        splitMeshIndex: 0,
        meshes: <Mesh[]>[],
        progress: '',
        console: '',
    };
}