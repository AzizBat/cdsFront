import {Injectable} from "@angular/core";
import {FormBuilder} from "@angular/forms";
import {HttpClient, HttpResponse} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {createRequestOption} from "../util/request-util";
import {Complaint} from "../models/complaint.model";

@Injectable({
  providedIn: 'root'
})
export class ComplaintService{

  constructor(private fb: FormBuilder, private http: HttpClient) { }
  readonly BaseURI = environment.apiUrl;


    postComplaint(req : any, pictures : FileList) {
    console.log(req)

    const complaintMultipartFormParam = 'complaint';
    const filesMultipartFormParam = 'files';
    const formData: FormData = new FormData();
    const complaintAsJsonBlob: Blob = new Blob([JSON.stringify(req)], { type: 'application/json' });
    formData.append(complaintMultipartFormParam, complaintAsJsonBlob);

    const filesAsArray = Array.from(pictures);
    for (let i of filesAsArray.keys()) {
      formData.append(filesMultipartFormParam, filesAsArray[i]);
    }
    return this.http.post(this.BaseURI + '/api/complaint', formData);
  }


  getComplaints(req?: any): Observable<HttpResponse<Complaint[]>>{
    const options = createRequestOption(req);
    return this.http.get<Complaint[]>(this.BaseURI +'/api/complaint', {params: options, observe: 'response' })
  }

  getComplaintById2(id) {
    return this.http.get(this.BaseURI + '/api/complaint/'+ id)
  }

}
