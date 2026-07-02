import { ToastrService } from 'ngx-toastr';
import { Component, OnInit } from '@angular/core';
import {NgForm, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from './../../shared/user.service';
import {MustMatch} from "../../shared/helpers/must-match.validator";

@Component({
  selector: 'app-sign-in',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})
export class CreateAccountComponent implements OnInit {

  formModel= this.formBuilder.group({
      FirstName: ['', [Validators.required, Validators.maxLength(50)]],
      LastName: ['', [Validators.required, Validators.maxLength(50)]],
      Phone: ['', Validators.required, Validators.pattern(
        '/^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/'
      ),],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required,Validators.minLength(6)]],
      ConfirmPassword: ['', [Validators.required,Validators.minLength(6)]]
    },
    {
      validator: MustMatch('password', 'ConfirmPassword'),
    }
  );

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
  incorrect = false;
  password: any
  confirm : any
  lowercase = false
  uppercase = false
  num = false


  constructor(
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: UserService
  ) {

  }

  ngOnInit() {
    // this.formModel =
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
  get f() { return this.formModel.controls; }
  get g() { return this.formModel1.controls; }

  onSubmit(form: NgForm) {
    this.submitted = true;

    // stop here if form is invalid
    if (this.formModel.invalid || this.validateEmail(this.formModel.value.email) === false) {
      return;
    }
    else{
      this.password= form.value.password
      this.confirm = form.value.ConfirmPassword

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
     // this.incorrect =true
      if (this.lowercase ===true && this.uppercase === true && this.num ===true && this.password === this.confirm ) {
        this.loading = true;
        //this.incorrect =false;
        this.service.register(form.value)
          .subscribe(
            (res: any) => {
              localStorage.setItem('token', res.accessToken);
              localStorage.setItem('curUser', res.user);
              const form1 = document.getElementById('form1');
              const form2 = document.getElementById('form2');
              form1.style.display = 'none'
              form2.style.display = 'inline'
            },
            _error => {
              this.error = 'Email Address already in use!';
              this.loading = false;
            });
      }
      else{
        this.incorrect =true
      }
    }
  }

  onSubmit1(form: NgForm) {
    this.submitted1 = true;

    // stop here if form is invalid
    if (this.formModel1.invalid) {
      return;
    }
    else{
      this.service.createOrganisation(form.value)
        .subscribe(
          (_res: any) => {
            const message = document.getElementById('message');
            const form2 = document.getElementById('form2');
            const title = document.getElementById('title');
            const msg = document.getElementById('msg');
            message.style.display = 'inline'
            form2.style.display = 'none'
            title.style.display = 'none'
            msg.style.display = 'none'
            localStorage.removeItem('token');

          },
          _error => {
            this.error1 = 'this organisation already exists';
            this.loading1 = false;
          });
    }
  }


  public numbersOnlyValidator(event: any) {
    const pattern = /^[0-9\-]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^0-9\-+()]/g, "");
    }
  }

  public caracterOnlyValidator(event: any) {
    const pattern = /^[a-zA-Z ]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^a-zA-Zéèàùêâîïäë]/g, "");
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

  login(){
    this.router.navigate(['/user/login']);
  }
}

