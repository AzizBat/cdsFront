import { Injectable } from '@angular/core';
import { FormBuilder} from '@angular/forms';
import {HttpClient, HttpResponse} from "@angular/common/http";
import { Event } from '../models/event.model';
import { environment } from 'src/environments/environment';
import {Observable} from "rxjs";
import {Audit} from "../models/audit.model";

@Injectable({
  providedIn: 'root'
})
export class EventService {
    formData: Event= {

        id : null,
        status : null,
        name : null,
        description : null,
        picture : null,
        deadline : null,
        areaId : null,
        assignedUser : null,
        assignedUserId : null,
        areaName : null,
        maxPossibleScore : null,
        date : null,
        modifiedDate : null,
        score : null,

        };


  constructor(private fb: FormBuilder, private http: HttpClient) { }
  readonly BaseURI = environment.apiUrl;

  list : Event[]



  postEvent() {
    return this.http.post(this.BaseURI + '/api/events', this.formData);
  }

  refreshList(){
    this.http.get(this.BaseURI +'/api/organisations/events')
    .toPromise()
    .then(  (res: any) => {
        this.list = res.content as Event[]
      },
      err => {
        if (err.status == 400)
         console.log(err);
      });
  }

  countEventsByStatus(): Observable<HttpResponse<Audit[]>> {
    return this.http
      .get<Audit[]>(this.BaseURI + '/api/dashboard/event-status-count', {observe: 'response'})
  }

}
