import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './core/containers/app/app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { MeshList } from "./core/components/mesh-list/mesh-list.component";
import { StlModelViewerModule } from 'angular-stl-model-viewer';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UploadComponent } from "./core/components/upload/upload.component";
import { ViewerModule } from './viewer/viewer.module';

@NgModule({
    declarations: [
        AppComponent,
        MeshList,
        UploadComponent
    ],
    providers: [],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        NoopAnimationsModule,
        StoreModule.forRoot({}, {}),
        MatCardModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        StlModelViewerModule,
        ViewerModule
    ]
})
export class AppModule { }
