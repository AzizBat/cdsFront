import {Problem} from "../models/prob/problem.model";
import {FormBuilder, Validators} from "@angular/forms";
import {HttpClient, HttpHeaders, HttpResponse} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {createRequestOption} from "../util/request-util";

@Injectable({
  providedIn: 'root'
})

export class ProblemService {

  formData: Problem= {
    id : null,
    description : null,
    creatorId: null,
    creatorName:null,
    date : null,
    modifiedDate : null,
    type : null,
    resolutionMethod : null,
    image : null,
    images : null,
    organisationId : null,
    auditResponseId : null,
    problems : null
  }

  commentData = this.fb.group({
    comment : ['', Validators.required],
  });

  constructor(private fb: FormBuilder, private http: HttpClient) { }
  readonly BaseURI = environment.apiUrl;

  list : Problem[]
  problem : Problem;


  postProblem() {
    return this.http.post(this.BaseURI + '/api/problems', this.formData);
  }

  getProblemById(id) {
    return this.http.get(this.BaseURI + '/api/problems/'+ id).toPromise()
      .then(  (res: any) => {
          this.problem = res as Problem
        },
        err => {
          if (err.status == 400)
            console.log(err);
        });
  }

  refreshList(){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    })
    this.http.get(this.BaseURI +'/api/problems')
      .toPromise()
      .then(  (res: any) => {
          this.list = res.content as Problem[]
        },
        err => {
          if (err.status == 400)
            console.log(err);
        });
  }

  deleteProblem(id){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    })
    return this.http.delete(this.BaseURI + '/api/problems/' + id, {headers : headers});
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

  getProblems(req?: any): Observable<HttpResponse<Problem[]>>{
    const options = createRequestOption(req);
    return this.http.get<Problem[]>(this.BaseURI +'/api/problems/problemsweb', {params: options, observe: 'response' })
  }


  getProblemById2(id) {
    return this.http.get(this.BaseURI + '/api/organisations/problems/'+ id)
  }


  updateResolutionMethod(id, editRequest: String){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    })
    return this.http.put(this.BaseURI + '/api/problems/resolutionMethod/' + id, editRequest,{headers : headers});
  }

}
