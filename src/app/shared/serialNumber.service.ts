import { Injectable } from '@angular/core';
import {FormBuilder} from '@angular/forms';
import { HttpClient,HttpResponse} from "@angular/common/http";
import { environment } from 'src/environments/environment';
import {Observable} from "rxjs";
import {createRequestOption} from "../util/request-util";
import {SerialNumber} from "../models/serialNumber.model";

@Injectable({
  providedIn: 'root'
})
export class SerialNumberService {

  formData:  {

    id : null;
    reference : null;
    picture : null;
    designation : null;
    archived : null;
    deleted : null;
    auditType : null;
    organisationId : null;
    createdDate: null;
    createdBy  : null;
    lastModifiedBy : null;
  };


  constructor(private fb: FormBuilder, private http: HttpClient) { }
  readonly BaseURI = environment.apiUrl;

  getSerialNumber(req?: any): Observable<HttpResponse<SerialNumber[]>>{
    const options = createRequestOption(req);
    return this.http.get<SerialNumber[]>(this.BaseURI +'/api/serialNumbers/serialNumbersWeb', {params: options, observe: 'response' })
  }

  getGeneralDatas(id : number){
    return this.http.get(this.BaseURI +'/api/serialNumbers/generaldatas/' +id)
  }

  getTodaySN(id){
    return this.http.get(this.BaseURI +'/api/serialNumbers/today/'+ id)
  }

  getSerialNumberById(id) {
    return this.http.get(this.BaseURI + '/api/serialNumbers/'+ id)
  }

  getdetailedStats(req?: any): Observable<HttpResponse<SerialNumber[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<SerialNumber[]>(this.BaseURI + '/api/serialNumbers/statsDetail' ,  { params: options, observe: 'response' })
  }

  getDefects(req?: any): Observable<HttpResponse<SerialNumber[]>>{
    const options = createRequestOption(req);
    return this.http.get<SerialNumber[]>(this.BaseURI +'/api/serialNumbers/defects', {params: options, observe: 'response' })
  }

  updateProducts(id:number, productId:number){
    return this.http.put<SerialNumber[]>( `${this.BaseURI}/api/serialNumbers/product/${id}/${productId}` , {observe: 'response' });
  }

  updateSerialNumber(id:number, serialNumber : String){
    return this.http.put<SerialNumber[]>( `${this.BaseURI}/api/serialNumbers/ChangeSN/${id}/${serialNumber}` , {observe: 'response' });
  }

  updateReference(id:number, reference : String){
    return this.http.put<SerialNumber[]>( `${this.BaseURI}/api/serialNumbers/ChangeRef/${id}/${reference}` , {observe: 'response' });
  }

  updateBatchNumber(id:number, batchNumber : String){
    return this.http.put<SerialNumber[]>( `${this.BaseURI}/api/serialNumbers/ChangeBatchNumber/${id}/${batchNumber}` , {observe: 'response' });
  }
}
