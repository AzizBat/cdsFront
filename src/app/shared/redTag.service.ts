import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { RedTag } from '../models/redTag/redTag.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RedTagService {
    formData: RedTag= {

        id : null,
        location : null,
        reason: null,
        reasonId : null,
        action: null,
        actionId : null,
        auditResponseId : null,
        item : null,
        itemType: null,
        itemTypeId : null,
        otherItemType: null,
        otherItemReason: null,
        otherItemAction: null,

        placeToMoveTo: null,
        assignedUserId : null,
        assignedUser : null,
        };

  constructor(private fb: FormBuilder, private http: HttpClient) { }
  readonly BaseURI = environment.apiUrl;

  list : RedTag[]






  refreshList() {

    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })


    return this.http.get(this.BaseURI + '/api/red-tags/', {headers : headers}).toPromise()
    .then(res => this.list = res as RedTag[]);

  }



}
