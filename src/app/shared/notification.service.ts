import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {HttpClient, HttpResponse} from "@angular/common/http";
import { Notification } from '../models/notification.model';
import { environment } from 'src/environments/environment';
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private fb: FormBuilder, private http: HttpClient) { }
  readonly BaseURI = environment.apiUrl;

  list : Notification[]





  refreshList(){
    this.http.get(this.BaseURI +'/api/notifications/organisation/')
    .toPromise()
    .then(  (res: any) => {
        this.list = res as Notification[]
      },
      err => {
        if (err.status == 400)
         console.log(err);
      });
  }

  getnotifications(): Observable<HttpResponse<Notification[]>> {
    return this.http
      .get<Notification[]>(this.BaseURI + '/api/notifications/organisation/web' ,  { observe: 'response' })
  }


}
