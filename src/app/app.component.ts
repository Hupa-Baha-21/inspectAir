import { Component, OnInit } from '@angular/core';
import { IPartInfo } from './services/part-info/IPartInfo';
import { PartInfoService } from './services/part-info/part-info.service';
import { ModelService } from './services/model/model.service';
import { ModelConfig } from './services/model/modelConfig';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLoaded = false;
  partInfo: IPartInfo;

  private config: ModelConfig = {
    distanceFromModel: 5,
    modelPath: 'assets/oil.glb',
    modelHeight: 1.5,
    onModelLoadProgress: (xhr) => { },
    onModelLoadError: console.error
  };


  constructor(private modelService: ModelService, private partInfoService: PartInfoService) {
    this.partInfo = {
      title: '',
      description: ''
    }
  }

  ngOnInit(): void {
    const canvas = <HTMLCanvasElement>document.querySelector('#view');

    this.modelService.setHdrEnvironment('assets/light1.hdr');
    const isLoaded = this.modelService.createModelView(canvas, this.config);
    this.modelService.partSelect.subscribe(part => {
      this.partInfo = this.partInfoService.retrieveDetails(part) || this.partInfo;
    });

    isLoaded.subscribe(isDone => this.isLoaded = isDone);
  }
}
