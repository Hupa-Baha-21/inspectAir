import { TestBed } from '@angular/core/testing';
import { PartInfoService } from './part-info.service';

describe('DetailsService', () => {
  let service: PartInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PartInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
