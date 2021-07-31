import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Details } from '../services/details/details';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnChanges {
  isVisible = false;
  @Input('details') details: Details = {
    title: 'title',
    text: 'text'
  };

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    this.isVisible = true;
  }

  ngOnInit(): void {
    this.isVisible = false;
  }
}
