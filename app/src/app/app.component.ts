import { Component, OnInit } from '@angular/core';
import { Details } from './services/details/details';
import { DetailsService } from './services/details/details.service';
import { ModelService } from './services/model/model.service';
import { ModelConfig } from './services/model/modelConfig';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLoaded = false;

  private config: ModelConfig = {
    distanceFromModel: 5,
    modelPath: 'assets/oil.glb',
    modelHeight: 1.5,
    onModelLoadProgress: (xhr) => {},
    onModelLoadError: console.error
  };

  details: Details;

  constructor (private modelService: ModelService, private detailsService: DetailsService) {  
    this.details = {
      title: "",
      text: ""
    };
  }
  
  ngOnInit(): void { 
    const canvas = <HTMLCanvasElement> document.querySelector('#view');

    this.modelService.setHdrEnvironment('assets/light1.hdr');
    const isLoaded = this.modelService.createModelView(canvas, this.config);
    this.modelService.partSelect.subscribe(part => 
      this.details = this.detailsService.retrieveDetails(part)
    );

    isLoaded.subscribe(isDone => this.isLoaded = isDone);
  }
}
