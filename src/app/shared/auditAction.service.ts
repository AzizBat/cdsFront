import { Injectable } from '@angular/core';
import { FormBuilder, Validators} from '@angular/forms';
import {HttpClient, HttpHeaders, HttpResponse} from "@angular/common/http";
import { AuditAction } from '../models/auditAction.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {createRequestOption} from "../util/request-util";
import {Audit} from "../models/audit.model";

@Injectable({
  providedIn: 'root'
})
export class AuditActionService {

  formData: AuditAction= {

    id : null,
    date : null,
    modifiedDate : null,
 //   illustrationUri : null,
    status : null,
    instruction : null,
    deadline : null,
    auditResponseId : null,
    auditName : null,
    areaName : null,
    affectedUsers : null,
    comments : null,
    organisationId : null,
    picture : null,
    creatorId: null,
    validated: null,
    creatorName:null,
  }

 /* commentData :  {
    id : null,
    comment :  null,
  } */

  commentData = this.fb.group({
    comment : ['', Validators.required],

  });

  constructor(private fb: FormBuilder, private http: HttpClient) { }
  readonly BaseURI = environment.apiUrl;

  list : AuditAction[]
  auditAction : AuditAction;


  updateAnswer(id){
    return this.http.put(this.BaseURI + '/api/enquetes/answer/updateAnswer' , id ,{});
  }

  validate(id){
    return this.http.put(this.BaseURI + '/api/enquetes/validate/' + id ,{});
  }

  doubleValidate(id){
    return this.http.put(this.BaseURI + '/api/enquetes/doubleValidate/' + id ,{});
  }


  createAnswer(req?: any): Observable<HttpResponse<Audit[]>>{
    const options = createRequestOption(req);
    return this.http
      .get<Audit[]>(this.BaseURI +'/api/enquetes/answer/createAnswer', { params: options, observe: 'response' })

    // return this.http.get<Audit[]>(this.BaseURI +'/api/audits', {observe: 'response' })
  }

  updateSubAnswer(id){
    return this.http.put(this.BaseURI + '/api/enquetes/subAnswer/updateSubAnswer' , id ,{});
  }


  postAuditAction() {
    return this.http.post(this.BaseURI + '/api/audit-actions', this.formData);
  }

  getAuditActionById(id) {
    return this.http.get(this.BaseURI + '/api/organisations/auditActions/'+ id).toPromise()
    .then(  (res: any) => {
        this.auditAction = res as AuditAction
      },
      err => {
        if (err.status == 400)
         console.log(err);
      });
  }

  getAuditActionById2(id) {
    return this.http.get(this.BaseURI + '/api/organisations/auditActions/'+ id)
  }

  getAuditActionByAudit(id) {
    return this.http.get(this.BaseURI + '/api/organisations/auditActions/audit/'+ id)
  }

  refreshList(){
    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    this.http.get(this.BaseURI +'/api/organisations/auditActions')
    .toPromise()
    .then(  (res: any) => {
        this.list = res.content as AuditAction[]
      },
      err => {
        if (err.status == 400)
         console.log(err);
      });
  }


thumbnailFetchUrl : string = "https://south/generateThumbnail?width=100&height=100";

getBlobThumbnail(): Observable<Blob> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });
  return this.http.post<Blob>(this.thumbnailFetchUrl,
    {
      "url": "http://acs/Logo.png"
    }, {headers: headers, responseType: 'blob' as 'json' });
}


postComment(id){
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  })
  var body = {
    comment: this.commentData.value.comment,
  };
  this.commentData.value.comment = ""
  return this.http.post(this.BaseURI + '/api/audit-actions/comment/' + id, body,{headers : headers});
}

  getActions(req?: any): Observable<HttpResponse<AuditAction[]>>{
    const options = createRequestOption(req);
    return this.http.get<AuditAction[]>(this.BaseURI +'/api/organisations/auditActionsweb', {params: options, observe: 'response' })
  }

  startAction(id){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    })
    return this.http.post(this.BaseURI + '/api/audit-actions/start/' + id, {headers : headers});
  }

  finishAction(id){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    })
    return this.http.post(this.BaseURI + '/api/audit-actions/finish/' + id, {headers : headers});
  }

  cancelAction(id, comment: string){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    })
    return this.http.post(this.BaseURI + '/api/audit-actions/cancel/' + id, comment, {headers : headers});
  }

  updateProgress(id, editRequest: number){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    })
    return this.http.put(this.BaseURI + '/api/audit-actions/progress/' + id, editRequest,{headers : headers});
  }

  countActionsByStatus(): Observable<HttpResponse<Audit[]>> {
    return this.http
      .get<Audit[]>(this.BaseURI + '/api/dashboard/action-status-count', {observe: 'response'})
  }

  updateAffectedUser(id, editRequest: number){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    })
    return this.http.put(this.BaseURI + '/api/audit-actions/affectedUser/' + id, editRequest,{headers : headers});
  }

  updateDeadline(id, editRequest: Date){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    })
    return this.http.put(this.BaseURI + '/api/audit-actions/deadline/' + id, editRequest,{headers : headers});
  }


  validateAction(id){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    })
    return this.http.put(this.BaseURI + '/api/audit-actions/validate/' + id, {headers : headers});
  }
}
