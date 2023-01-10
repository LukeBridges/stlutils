import { Component, Input } from "@angular/core";
import { Mesh } from "src/stl/types/mesh.model";

@Component({
    selector: 'app-viewer',
    templateUrl: './viewer.component.html'
})
export class ViewerComponent {
    @Input() mesh: Mesh = new Mesh();
}