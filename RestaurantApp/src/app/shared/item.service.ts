import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  constructor(public http: HttpClient) {}

  getItemList() {
    return this.http.get(environment.apiURL + '/Item').toPromise();
  }
}
