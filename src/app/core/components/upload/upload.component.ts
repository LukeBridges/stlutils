import { Component } from "@angular/core";
import { message } from "src/stl/log";
import { processSTL } from "src/stl/stlFile";

@Component({
    selector: 'app-upload',
    templateUrl: './upload.component.html'
})
export class UploadComponent {
    handleFileSelect(event: Event) {
        message('start');

        window['stl'].progress = '';
        window['stl'].allSplitMeshes = [];
        window['stl'].meshes = [];
        window['stl'].console = '';

        if (!event || !event.target) return;

        var f = (event.target as any).files[0];

        message("reading " + String(f.size) + ' bytes');

        var n = f.name.split(/[/\\]+/);
        window['stl'].baseFilename = f.name.replace(/.*[/\\]/, "").replace(/\.[sS][tT][lL]$/, "");

        var reader = new FileReader();
        reader.onload = function (event: Event) {
            try {
                processSTL((event.target as any).result as ArrayBuffer);
            }
            catch (err) {
                message("Error: " + err);
            }
        }
        reader.readAsArrayBuffer(f);
    }
}