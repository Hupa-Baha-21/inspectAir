import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnChanges {
  isVisible = false;
  @Input('text') text = "";
  @Input('title') title = "";

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    this.isVisible = true;
  }

  ngOnInit(): void {
    this.isVisible = false;
  }
}
