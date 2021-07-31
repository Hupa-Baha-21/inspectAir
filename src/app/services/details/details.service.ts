import { Injectable } from '@angular/core';
import { Details } from './details';

@Injectable({
  providedIn: 'root'
})

export class DetailsService {

  constructor() { }

  public retrieveDetails(key: string) : Details {
    return {
      title: key,
      text: 'תיאור'
    };
  }
}
