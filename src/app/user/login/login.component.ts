import { ToastrService } from 'ngx-toastr';
import { Component, OnInit } from '@angular/core';
import {NgForm, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from './../../shared/user.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  formModel= this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  formModel1= this.formBuilder.group({
    id: [null],
    name: ['', [Validators.required]],
  })

  loading = false;
  loading1 = false;
  submitted = false;
  submitted1 = false;
  returnUrl: string;
  error = '';
  error1 = '';
  orgExits = false;
  organisation : any


  constructor(
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: UserService
  ) {
    // redirect to home if already logged in

  }

  ngOnInit() {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
  get f() { return this.formModel.controls; }
  get g() { return this.formModel1.controls; }


  onSubmit(form: NgForm): any {

    this.submitted = true;

    // stop here if form is invalid
    if (this.formModel.invalid || this.validateEmail(this.formModel.value.email) === false) {
      return;
    }

    this.loading = true;
    this.service.login(form.value)
      .subscribe(
        (res: any) => {
          console.log(res.user)
                localStorage.setItem('token', res.accessToken);
                localStorage.setItem('curUser', JSON.stringify(res.user) );
                localStorage.setItem('subCompanies', JSON.stringify(res.user.subCompanies) );

                if (res.user.subCompanies.length !== 0)
          {
            this.router.navigateByUrl('/home');
            }
                else {
            const form1 = document.getElementById('form1');
            const form2 = document.getElementById('form2');
            form1.style.display = 'none';
            form2.style.display = 'inline';
          }
        // }
        // else{
        //           const form1 = document.getElementById('form1');
        //           const form2 = document.getElementById('message');
        //           form1.style.display = 'none'
        //           form2.style.display = 'inline'
        //           localStorage.removeItem('token');
        //         }
                },
        _error => {
          this.error = 'Incorrect username or password.';
          this.loading = false;
        });
  }

  onSubmit1(form: NgForm) {
    this.submitted1 = true;

    // stop here if form is invalid
    if (this.formModel1.invalid) {
      return;
    }
    else{    this.service.createOrganisation(form.value)
      .subscribe(
        (_res: any) => {
          this.router.navigateByUrl('/home');
        },
        _error => {
          this.error1 = 'this organisation already exists';
          this.loading1 = false;
        });
    }
  }

  public validateEmail(value) : boolean {
    var re = /\S+@\S+\.\S+/;
    if (!re.test(value)){
      return false
    }
    else{
      return true
    }
  }

  createAccount(){
    this.router.navigate(['/user/create-account']);
  }

  changePassword(){
    this.router.navigate(['/user/forgot-password']);
  }
}
