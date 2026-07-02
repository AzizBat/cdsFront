import { Injectable } from '@angular/core';
import {FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { CreateUser, User } from '../models/user.model';
import { Role } from '../models/role.model';
import { Organisation } from '../models/organisation.model';
import { environment } from 'src/environments/environment';
import {Observable} from 'rxjs';
import {createRequestOption} from '../util/request-util';
import {AuditType} from '../models/auditType.model';

type EntityResponseType = HttpResponse<User>;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  formData: {

    id: null,
    firstName: null,
    lastName: null,
    phoneNumber: null,
    email: null,
    roleName: null,
    };

    formDataReq: CreateUser = {

      id : null,
      firstName : null,
      lastName : null,
      phoneNumber : null,
      email : null,
      roleName : null,
      rpiRoleName : null,
      archived : false,
      username : null,
      hasEmail : null,
      isEnabled : null
      };


      formDataOrg: Organisation = {
        id : null,
        name : null,
        };

  currUser: User;
  list: User[];
  listt: Role[];

  constructor(private fb: FormBuilder, private http: HttpClient) { }
 readonly BaseURI = environment.apiUrl;

  formModel = this.fb.group({
    firstName : ['', Validators.required],
    lastName : ['', Validators.required],
    phoneNumber : ['', Validators.required],
    email: ['', Validators.email],
    Passwords: this.fb.group({
      Password: ['', [Validators.required, Validators.minLength(4)]],
      ConfirmPassword: ['', Validators.required]
    }, { validator: this.comparePasswords })


  });

  formModelReq = this.fb.group({
    firstName : ['', Validators.required],
    lastName : ['', Validators.required],
    phoneNumber : ['', Validators.required],
    email: ['', Validators.email],
    roleName: ['', Validators.required],


  });

  comparePasswords(fb: FormGroup): any {
    const confirmPswrdCtrl = fb.get('ConfirmPassword');
    if (confirmPswrdCtrl.errors == null || 'passwordMismatch' in confirmPswrdCtrl.errors) {
      if (fb.get('Password').value !== confirmPswrdCtrl.value){
        confirmPswrdCtrl.setErrors({ passwordMismatch: true });
      }
      else{
        confirmPswrdCtrl.setErrors(null);
      }
    }
  }

  register(form: any): any {
    console.log(form);
    const body = {
      firstName: form.FirstName,
      lastName: form.LastName,
      phoneNumber: form.Phone,
      email: form.email,
      password: form.password
    };
    console.log(body);
    return this.http.post(this.BaseURI + '/auth/sign-upp', body);
  }

  login(formData): any {
    return this.http.post(this.BaseURI + '/auth/sign-in', formData);
  }

  resetPassword(formData): any {
    return this.http.post(this.BaseURI + '/auth/resetPassword', formData);
  }

  sendToken(formData): any {
    return this.http.post(this.BaseURI + '/auth/resetPassword/validateToken', formData);
  }

  newPassword(formData): any {
    return this.http.post(this.BaseURI + '/auth/resetPassword/newPassword', formData);
  }

  getUserProfile(): any {
     return this.http.get(this.BaseURI + '/api/users/me', )
    .toPromise()
    .then(  (res: any) => {
        this.currUser = res as User;
      },
      err => {
        if (err.status === 400){
         console.log(err);
        }
      });


  }

  getAllOrganisationUsers(): any {
    return this.http.get<User[]>(`${this.BaseURI}/api/organisations/users`);
}

  getOrganisation(): any{
    return this.http.get<Organisation[]>(`${this.BaseURI}/api/company/sub-company`);
  }

  getUserWithPicture(id: string): Observable<HttpResponse<User>>{
    return this.http
      .get<User>(`${this.BaseURI}/api/users/userWithPicture/${id}`, {observe: 'response' });
  }

  getUsers(req?: any): Observable<HttpResponse<User[]>>{
    const options = createRequestOption(req);
    return this.http
      .get<User[]>(`${this.BaseURI}/api/users/users`, {params: options, observe: 'response' });
  }

  updatePassword(id, password: string): any{

    return this.http.put(this.BaseURI + '/api/users/editPassword/' + id, password);
  }

refreshList(): any{
 return this.http.get(this.BaseURI + '/api/organisations/users')
  .toPromise()
  .then(  (res: any) => {
      this.list = res.content as User[];
      this.listt = res.content.roles as Role[];
    },
    err => {
      if (err.status === 400){
       console.log(err);
      }
    });
}


  roleMatch(allowedRoles): boolean {
    let isMatch = false;
    const payLoad = JSON.parse(window.atob(localStorage.getItem('token').split('.')[1]));
    const userRole = payLoad.role;
    allowedRoles.forEach(element => {
      if (userRole === element) {
        isMatch = true;
        return false;
      }
    });
    return isMatch;
  }

  postUser(): any {
    return this.http.post(this.BaseURI + '/api/users/invite', this.formDataReq);
  }


  inviteUser(form): any {
    const body = {
        name: form.username,
        matricule: form.matricule,
        email: form.email,
        organisationFunction: form.organisationsFunction,
        organisationService: form.organisationsService,
        serviceCode: form.serviceCode,
        hasEmail : form.hasEmail,
        archived: false
    };
    console.log(body);

    return this.http.post(`${this.BaseURI}/api/users/invite/${form.roleName}`, body);
  }
  inviteUserWithUsername(form): any {
    console.log(form);
    const body = {users: [{
        firstName: form.FirstName,
        lastName: form.LastName,
        phoneNumber: form.Phone,
        email: form.email,
        roleName: form.roleName,
        rpiRoleName: form.roleName1,
        username: form.username,
        hasEmail : form.hasEmail,
        isEnabled : form.isEnabled
      }]};
    return this.http.post(this.BaseURI + '/api/users/invite-with-username', body);
  }

  postOrganisation(): any {
    const body = {
      name: this.formDataOrg.name,
    };
    return this.http.post(this.BaseURI + '/api/organisations', this.formDataOrg);
  }

  createOrganisation(formData: any): any{
    console.log(formData);
    return this.http.post(this.BaseURI + '/api/organisations', formData);
  }

  updateUser(formData: any , id: any): Observable<EntityResponseType>{
    // console.log(formData.roleName1)
    const body = {
      id,
      name: formData.username,
      matricule: formData.matricule,
      email: formData.email,
      organisationFunction: formData.organisationsFunction,
      organisationService: formData.organisationsService,
      serviceCode: formData.serviceCode,
      hasEmail : formData.hasEmail,
      archived: false
    };
    console.log(body);
    return this.http.put<User>(`${this.BaseURI}/api/users/update/${formData.roleName}`, body , {observe: 'response' });
  }

  archiveUser(id: any): any{
    return this.http.put<User>( `${this.BaseURI}/api/users/archive/${id}` , {observe: 'response' });
  }

  activateUser(id: any): any{
    return this.http.put<User>( `${this.BaseURI}/api/users/activate/${id}` , {observe: 'response' });
  }

  confirmAccount(token: any): Observable<HttpResponse<User>>{
    return this.http.post<User>( this.BaseURI + '/auth/confirm-user-account' , token, {observe: 'response' });
  }

  getAllUsers(): Observable<HttpResponse<User[]>>{
    return this.http.get<User[]>(this.BaseURI + '/api/users/allUsers', {observe: 'response' });
  }

  getAllOrganisationServices(): Observable<HttpResponse<User[]>>{
    return this.http.get<User[]>(this.BaseURI + '/api/users/allOrganisationServices', {observe: 'response' });
  }

  getAllOrganisationFunctions(): Observable<HttpResponse<User[]>>{
    return this.http.get<User[]>(this.BaseURI + '/api/users/allOrganisationFunctions', {observe: 'response' });
  }
}
