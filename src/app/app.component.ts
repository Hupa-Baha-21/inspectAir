import { Component, OnInit } from '@angular/core';
import { Details } from './details/details';
import { ModelService } from './services/model/model.service';
import { ModelConfig } from './services/model/modelConfig';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private config: ModelConfig = {
    distanceFromModel: 5,
    modelPath: 'assets/oil_purifier_DE_second.glb',
    modelHeight: 1.5,
    onModelLoadProgress: (xhr) => console.log(xhr.loaded / xhr.total * 100),
    onModelLoadError: console.error
  };

  details: Details;

  constructor (private modelService: ModelService) {  
    this.details = {
      title: "",
      text: ""
    };
  }
  
  ngOnInit(): void { 
    const canvas = <HTMLCanvasElement> document.querySelector('#view');

    this.modelService.setHdrEnvironment('assets/light.hdr');
    this.modelService.setLdrBackground('assets/env.jpg');
    this.modelService.createModelView(canvas, this.config);
    
    this.modelService.partSelect.subscribe(part => this.onPartSelect(part));
  }

  onPartSelect(selected: string) {
    console.log(this.details);
    this.details.title = selected;
    console.log(selected);
  }
}
