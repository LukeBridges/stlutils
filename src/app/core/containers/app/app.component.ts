import { Component, OnInit, ViewChild } from '@angular/core';
import { setVars } from 'src/stl/vars';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('file') file!: HTMLElement;

  ngOnInit() {
    setVars();
  }

  console() {
    return window['stl'].console;
  }

  meshes() {
    return window['stl'].allSplitMeshes;
  }
}
