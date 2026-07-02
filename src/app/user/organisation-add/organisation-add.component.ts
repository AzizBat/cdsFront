import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/shared/user.service';

@Component({
  selector: 'app-organisation-add',
  templateUrl: './organisation-add.component.html',
  styles: [
  ]
})
export class OrganisationAddComponent implements OnInit {
curUser : User;
orgExits : boolean;
test: string;

  constructor( public service : UserService, private router: Router, private toastr: ToastrService) { }

  ngOnInit() {

    if (localStorage.getItem('token') == null)
      this.router.navigateByUrl('/user/login');
    this.service.getUserProfile();
    this.test = 'hey';
  }

  resetForm(form?: NgForm) {
    if (form != null)
      form.resetForm();
    this.service.formDataOrg = {
      id: 0,
      name: '',
    }
  }
  checkOrgExistance(){
    this.orgExits = false;
        if (this.service.currUser.organisationId!==null )
     {
        this.orgExits = true;}
  }



  onSubmit(form: NgForm) {
    if (form.value.id == null)
      this.insertRecord(form);
    if (form.value.name == ' ' ||  form.value.name !== 'undefined' || form.value.name.length === 0)
      this.toastr.error('Enter Name first', 'EMP. Register');
  }


  insertRecord(form: NgForm) {
    this.service.postOrganisation().subscribe(
      _res => {

      this.toastr.success('Organisation Inserted successfully', 'EMP. Register');
      this.resetForm(form);
      this.service.refreshList();
      this.router.navigateByUrl('/home');
    },
    err => {
      console.log(err);
    });
  }



  onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/user/login']);
  }
}
