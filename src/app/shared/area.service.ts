import { Injectable } from '@angular/core';
import { FormBuilder} from '@angular/forms';
import {HttpClient, HttpResponse} from "@angular/common/http";
import { Area } from '../models/area.model';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AreaService {
    formData: Area= {
        id : null,
        name : null,
        description : null,
      organisationId: null,
      archived : false

    };


  constructor(private fb: FormBuilder, private http: HttpClient, private toastr: ToastrService) { }
  readonly BaseURI = environment.apiUrl;

  list : Area[]
  area :  Area= {
    id: 0,
    name: '',
    description:'',
    organisationId:0,
    archived : false

  };


  postArea(form) {
    return this.http.post(this.BaseURI + '/api/areas', form);
  }

  getAreas1(): Observable<HttpResponse<Area>>{
    return this.http
      .get<Area>(this.BaseURI +'/api/organisations/areas',{observe: 'response' })
  }

  getAreas(){
    this.http.get(this.BaseURI +'/api/organisations/areas')
    .toPromise()
    .then(  (res: any) => {
        this.list = res.content as Area[]
      },
      err => {
        if (err.status == 400)
         {console.log(err);
          this.toastr.error('Couldn t Load Areas.', 'Connection Error.');}
      });
  }

  archiveArea(id) {
    return this.http.put<Area>( `${this.BaseURI}/api/areas/archive/${id}` , {observe: 'response' });
  }

  restoreArea(id) {
    return this.http.put<Area>( `${this.BaseURI}/api/areas/restore/${id}` , {observe: 'response' });
  }

  editArea(form, id) {
    return this.http.put(this.BaseURI + '/api/areas/' + id,  form );
  }


  getAreaById(id) {
    return this.http.get(this.BaseURI + '/api/areas/'+ id)
     .toPromise()
    .then(  (res: any) => {
        this.area = res as Area
      },
      err => {
        if (err.status == 400)
         console.log(err);
      });

  }



}
