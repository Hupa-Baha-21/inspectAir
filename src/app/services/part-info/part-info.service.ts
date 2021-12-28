import { Injectable } from '@angular/core';
import { IPartInfo } from './IPartInfo';
import { partsInfo } from '../../mock-data/parts-info';

@Injectable({
  providedIn: 'root'
})

export class PartInfoService {
  partsInfo: IPartInfo[] = partsInfo;

  constructor() { }

  public retrieveDetails(key: string): IPartInfo | undefined {
    let partInfo: IPartInfo | undefined;
    partsInfo.forEach(info => {
      if (info.title === key) {
        partInfo = { ...info };
        return;
      }
    })
    return partInfo;
  }

  public partInfoExists(key: string): boolean {
    let exists = false;
    partsInfo.forEach(info => {
      if (info.title === key) {
        exists = true;
        return;
      }
    });
    return exists;
  }
}