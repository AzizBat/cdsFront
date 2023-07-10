import { Injectable } from '@angular/core';
import {FormBuilder } from '@angular/forms';
import { HttpClient } from "@angular/common/http";

import { environment } from 'src/environments/environment';

import { DomSanitizer } from '@angular/platform-browser';



@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private fb: FormBuilder, private http: HttpClient, private sanitizer: DomSanitizer) { }
  readonly BaseURI = environment.apiUrl;


  login(formData : any) {
    return this.http.post(this.BaseURI + '/auth/sign-in', formData);
  }

  changePassword(formData : any) {
    return this.http.put(this.BaseURI + '/api/users/change-password', formData);
  }

  getChecklists(type : string) {
    return this.http.get(`${this.BaseURI}/api/checklists/all/${type}`);
  }

  saveRequest(formData : any) {
    return this.http.post(this.BaseURI + '/api/request/save', formData);
  }

}
