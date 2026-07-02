import { Injectable } from '@angular/core';
import { FormBuilder} from '@angular/forms';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import { Audit } from '../models/audit.model';
import { AuditType } from '../models/auditType.model';
import { AuditTasksGroup } from '../models/auditTasksGroup.model';
import { AuditTask } from '../models/auditTask.model';
import { environment } from 'src/environments/environment';
import {Observable} from 'rxjs';
import {createRequestOption} from '../util/request-util';
import {Responses} from '../models/responses.model';
import {Enquete} from '../models/enquete.model';
import {QuestionsGroup} from '../models/questionGroup.model';
import {Question} from '../models/question.model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
    formData: Audit = {

        id : null,
        name : null,
        score : null,
        maxPossibleScore : null,
        areaId : null,
        areaName : null,
        auditorId : null,
        auditorName : null,
        auditTypeId : null,
        organisationId : null,
        date : null,
        modifiedDate : null,
        auditType : null,
        area : null,
        status : null

        };


  constructor(private fb: FormBuilder, private http: HttpClient) { }
  readonly BaseURI = environment.apiUrl;

  list: Audit[];
  auditTypeList: AuditType[];
  auditTasksGroupsList: AuditTasksGroup[];
  auditTasksList: AuditTask[];
  auditsRetrieved = true;



  postAudit(): any {
    return this.http.post(this.BaseURI + '/api/audits', this.formData);
  }

  refreshList(): any{
    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      });
    this.http.get(this.BaseURI + '/api/audits')
    .toPromise()
    .then(  (res: any) => {
        this.list = res.content as Audit[];
        console.log(this.list);
        this.auditTasksGroupsList = res.content.auditTasksGroups as AuditTasksGroup[];
        this.auditsRetrieved = false;
       // res => this.list = res as Audit[]
      },
      err => {
         this.auditsRetrieved = false;
         if (err.status === 400) {
          console.log(err);
        }
      });
  }

  getAuditTypes(): Observable<HttpResponse<AuditType[]>>{
    return this.http.get<AuditType[]>(this.BaseURI + '/api/audit-types/org', {observe: 'response' });
  }

  getEnqueteStatusbyId(id: number): Observable<HttpResponse<Enquete[]>>{
    // return this.http.get<Enquete[]>(this.BaseURI +'/api/enquetes/getEnqueteByPAP', {observe: 'response' })
    return this.http.get<Enquete[]>( `${this.BaseURI}/api/enquetes/getEnqueteByPAP/${id}` , {observe: 'response' });
  }

  getEnquetebyId(id: number): Observable<HttpResponse<Enquete[]>>{
    // return this.http.get<Enquete[]>(this.BaseURI +'/api/enquetes/getEnqueteByPAP', {observe: 'response' })
    return this.http.get<Enquete[]>( `${this.BaseURI}/api/request/getRequest/${id}` , {observe: 'response' });
  }

  getQuestionsByEnqueteId(id: number): Observable<HttpResponse<Question[]>>{
    // return this.http.get<Enquete[]>(this.BaseURI +'/api/enquetes/getEnqueteByPAP', {observe: 'response' })
    return this.http.get<Question[]>( `${this.BaseURI}/api/enquetes/getQuestionsByEnqueteId/${id}` , {observe: 'response' });
  }

  getCodePapByEnqueteId(id: number): Observable<HttpResponse<Responses[]>>{
    // return this.http.get<Enquete[]>(this.BaseURI +'/api/enquetes/getEnqueteByPAP', {observe: 'response' })
    return this.http.get<Responses[]>( `${this.BaseURI}/api/enquetes/getPAP/${id}` , {observe: 'response' });
  }


  getWithoutAnswers(id: number): Observable<HttpResponse<Responses[]>>{
    // return this.http.get<Enquete[]>(this.BaseURI +'/api/enquetes/getEnqueteByPAP', {observe: 'response' })
    return this.http.get<Responses[]>( `${this.BaseURI}/api/enquetes/noAnswers/${id}` , {observe: 'response' });
  }

  getQuestionGroupByEnqueteId(id: number): Observable<HttpResponse<QuestionsGroup[]>>{
    // return this.http.get<Enquete[]>(this.BaseURI +'/api/enquetes/getEnqueteByPAP', {observe: 'response' })
    return this.http.get<QuestionsGroup[]>( `${this.BaseURI}/api/enquetes/getQuestionsGroupByEnqueteId/${id}` , {observe: 'response' });
  }

  getCodeAnswersbyEnqueteId(id: number): Observable<HttpResponse<Responses[]>>{
    // return this.http.get<Enquete[]>(this.BaseURI +'/api/enquetes/getEnqueteByPAP', {observe: 'response' })
    return this.http.get<Responses[]>( `${this.BaseURI}/api/enquetes/getAnswers/${id}` , {observe: 'response' });
  }

  getSubAnswersByAnswersId(id: number): Observable<HttpResponse<Question[]>>{
    // return this.http.get<Enquete[]>(this.BaseURI +'/api/enquetes/getEnqueteByPAP', {observe: 'response' })
    return this.http.get<Question[]>( `${this.BaseURI}/api/enquetes/getSubAnswers/${id}` , {observe: 'response' });
  }

  getAllAuditTypes(): Observable<HttpResponse<AuditType[]>>{
    return this.http.get<AuditType[]>(this.BaseURI + '/api/audit-types/all', {observe: 'response' });
  }

  getRequest(req?: any): Observable<HttpResponse<any>>{
      const options = createRequestOption(req);
      return this.http
        .get<any>(this.BaseURI + '/api/request/all', { params: options, observe: 'response' });

      // return this.http.get<Audit[]>(this.BaseURI +'/api/audits', {observe: 'response' })
    }

  countAuditsByStatus(): Observable<HttpResponse<Audit[]>> {
    return this.http
      .get<Audit[]>(this.BaseURI + '/api/dashboard/audit-status-count', {observe: 'response'});
  }

  getdetailedStats(req?: any): Observable<HttpResponse<Audit[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<Audit[]>(this.BaseURI + '/api/dashboard/StatsDetail' ,  { params: options, observe: 'response' });
  }

  archiveAuditTypes(id): any {
    return this.http.put<AuditType>( `${this.BaseURI}/api/audit-types/archive/${id}` , {observe: 'response' });
  }

  restoreAuditTypes(id): any {
    return this.http.put<AuditType>( `${this.BaseURI}/api/audit-types/restore/${id}` , {observe: 'response' });
  }

  uploadChecklist(files: File): any {
    const headers = new HttpHeaders({
      'Content-Type': 'multipart/form-data;boundary=calculated when request is sent',
      // 'Content-Length' : 'calculated when request is sent',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    const filesMultipartFormParam = 'file';
    const file: FormData = new FormData();
    file.append(filesMultipartFormParam, files);
    return this.http.post<AuditType>(this.BaseURI + '/api/audit-types/uploadExcel' , file, { observe: 'response' });
  }

  changeStatus(id: number, status: string): any{
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.put(this.BaseURI + '/api/request/changeStatus/' + id, status);
  }

  comment(id: number, comment: string): any{
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.put(this.BaseURI + '/api/request/comment/' + id, comment);
  }



  getRequestsByStatus(req?: any): Observable<HttpResponse<Audit[]>>{
    const options = createRequestOption(req);
    return this.http
      .get<Audit[]>(this.BaseURI + '/api/request/allRequests', { params: options, observe: 'response' });
  }
}
