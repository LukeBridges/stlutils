import { makeMeshByteArray } from "./mesh";

export function downloadBlob(name: string, blob: Blob | MediaSource) {
    var link = document.createElement('a');
    document.body.appendChild(link);
    link.download = name;
    link.href = window.URL.createObjectURL(blob);
    link.onclick = function (e) {
        setTimeout(function () {
            window.URL.revokeObjectURL(link.href);
        }, 1600);
    };
    link.click();
    try {
        link.remove();
    }
    catch (err) { }
    try {
        document.body.removeChild(link);
    }
    catch (err) { }
}

export function downloadMesh(list: string | any[]) {
    if (list.length == 0)
        return;
    var name = window['stl'].baseFilename;
    var toMake = [];
    for (var i = 0; i < list.length; i++) {
        name += "-" + (list[i] + 1);
        toMake.push(window['stl'].allSplitMeshes[list[i]].triangles);
    }
    downloadBlob(name + ".stl", new Blob([makeMeshByteArray(toMake)], { type: "application/octet-stream" }));
}