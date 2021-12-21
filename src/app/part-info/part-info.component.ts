import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IPartInfo } from '../services/part-info/IPartInfo';
import { ModelService } from '../services/model/model.service';

@Component({
  selector: 'app-part-info',
  templateUrl: './part-info.component.html',
  styleUrls: ['./part-info.component.scss']
})
export class PartInfoComponent implements OnInit, OnChanges {
  modelService: ModelService;
  isVisible = false;

  @Input() partInfo: IPartInfo | undefined;

  constructor(modelService: ModelService) {
    this.modelService = modelService;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isVisible = true;
  }

  ngOnInit(): void {
    this.isVisible = false;
  }
}
