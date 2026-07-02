import { Injectable } from '@angular/core';
import {FormBuilder} from '@angular/forms';
import { HttpClient,HttpResponse} from "@angular/common/http";
import { environment } from 'src/environments/environment';
import {Observable} from "rxjs";
import {Product} from "../models/product.model";


@Injectable({
  providedIn: 'root'
})
export class ProductService {

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

  getProduct(): Observable<HttpResponse<Product[]>>{
    return this.http
      .get<Product[]>( `${this.BaseURI}/api/products`,{ observe: 'response' })
  }

  getAllProduct(): Observable<HttpResponse<Product[]>>{
    return this.http
      .get<Product[]>( `${this.BaseURI}/api/products/all`,{ observe: 'response' })
  }
}
