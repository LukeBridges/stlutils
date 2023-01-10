import { NgModule } from "@angular/core";
import { StlModelViewerModule } from "angular-stl-model-viewer";
import { ViewerComponent } from "./containers/viewer/viewer.component";

@NgModule({
    declarations: [
        ViewerComponent
    ],
    imports: [
        StlModelViewerModule,
    ],
})
export class ViewerModule {}