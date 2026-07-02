import { ToastrService } from 'ngx-toastr';
import { Component, OnInit } from '@angular/core';
import {NgForm, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from './../../shared/user.service';
import {MustMatch} from "../../shared/helpers/must-match.validator";

@Component({
  selector: 'app-sign-in',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  email: any;
  password: any
  lowercase = false
  uppercase = false
  num = false
  incorrect = false
  formModel= this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });

  formModel1= this.formBuilder.group({
    token: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
  });

  formModel2= this.formBuilder.group({
    token:[],
    password: ['', [Validators.required,Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required,Validators.minLength(6)]],
  },
    {  validator:MustMatch('password', 'confirmPassword'),
    }
);
  signinModel= this.formBuilder.group({
    email:[],
    password : []
  })



  loading1 = false;
  loading2 = false;
  loading3 = false;
  submitted = false;
  submitted1 = false;
  submitted2 = false;
  returnUrl: string;
  error = '';
  error1 = '';
  error2 = '';
  token = '';

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
  get h() { return this.formModel2.controls; }


  onSubmit(form: NgForm) {
    this.submitted = true;

    // stop here if form is invalid
    if (this.formModel.invalid || this.validateEmail(this.formModel.value.email) === false) {
      return;
    }

    this.loading1 = true;
    //send email service


    this.service.resetPassword(form.value)
      .subscribe(
        (_res: any) => {
          this.error = '';
          this.email = form.value.email
          const form1 = document.getElementById('form1');
          const form2 = document.getElementById('form2');
          form1.style.display = 'none'
          form2.style.display = 'inline'
          this.loading1 = false;

        },
        _error => {
          this.error = 'Email not found';
          this.loading1 = false;
        });
  }

  onSubmit1(form: NgForm) {
    this.submitted1 =true
    console.log(form.value)
    if (this.formModel1.invalid) {
      return;
    }

    this.service.sendToken(form.value)
      .subscribe(
        (_res: any) => {
          this.token= form.value.token
          this.error1 = ''
    this.loading2 = true;
    const form2 = document.getElementById('form2');
    const form3 = document.getElementById('form3');
    form2.style.display = 'none'
    form3.style.display = 'inline'
    this.loading2 = false},
    _error => {
      this.error1 = 'Invalid verification code';
      this.loading1 = false;
    });
  }

  onSubmit2(form: NgForm) {
    this.submitted2 =true
    console.log(form.value)
    if (this.formModel2.invalid) {
      console.log("incorrect")
      return;
    }
    console.log("correct")

    this.password= form.value.password
    for(let i=0; i< this.password.length; i++){
    if (this.password.charAt(i) >= 'a' && this.password.charAt(i) <= 'z'){
      this.lowercase= true
    }
      if (this.password.charAt(i) >= 'A' && this.password.charAt(i) <= 'Z'){
        this.uppercase= true
      }
      if (this.password.charAt(i) >= '0' && this.password.charAt(i) <= '9'){
        this.num= true
      }
    }
    if (this.lowercase ===true && this.uppercase === true && this.num ===true ){
      form.value.token = this.token
      this.service.newPassword(form.value)
        .subscribe(
          (_res: any) => {
            this.loading3 = true;
            this.signinModel.value.email = this.email
            this.signinModel.value.password = this.password
            this.service.login(this.signinModel.value)
              .subscribe(
                (res: any) => {
                  localStorage.setItem('token', res.accessToken);
                  localStorage.setItem('curUser', res.user);
                  this.router.navigateByUrl('/home');
                },);
          },
          )
    }
    else{
      this.incorrect =true
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

  public numbersOnlyValidator(event: any) {
    const pattern = /^[0-9\-]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/\D/g, "");
    }
  }

  previousState(): void {
    this.router.navigate(['/user/login']);
  }

  goToForm1(): void {
    const form1 = document.getElementById('form1');
    const form2 = document.getElementById('form2');
    form1.style.display = 'inline'
    form2.style.display = 'none'  }


  firstState(): void {
    const form1 = document.getElementById('form1');
    const form3 = document.getElementById('form3');
    form1.style.display = 'inline'
    form3.style.display = 'none'  }
}
