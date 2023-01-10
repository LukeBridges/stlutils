import { Component, Input } from '@angular/core';
import * as download from 'src/stl/download';
import { Mesh } from 'src/stl/types/mesh.model';

@Component({
    selector: 'app-mesh-list',
    templateUrl: './mesh-list.component.html',
    styleUrls: ['./mesh-list.component.scss']
})
export class MeshList {
    @Input() meshes: Mesh[] = [];

    downloadMesh = download.downloadMesh;
}