import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {FormBuilder, NgForm, Validators} from "@angular/forms";
import {ComplaintService} from "../shared/complaint.service";

@Component({
  selector: 'app-complain',
  templateUrl: './complaint.component.html',
  styleUrls: ['./complaint.component.scss']
})
export class ComplaintComponent implements OnInit {

  formModel= this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      companyName: ['', [ Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      Phone: ['', Validators.required, Validators.pattern(
        '/^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/'
      ),],
      product: ['', [Validators.required, Validators.maxLength(50)]],
      issue: ['', [Validators.required, Validators.maxLength(50)]],
      picture: [''],
      description: ['', [Validators.required]],
    },
  );


  submitted = false;
  loading = false;
  name :any;
  companyName :any;
  email : any
  pictures :any
  phone :any
  product :any
  issue :any
  description :any
  orgName : any
  imageToShow: any




  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    public service: ComplaintService,

  ) { }

  ngOnInit() {

    console.log('tokennn ' +localStorage.getItem('token'));

    this.orgName = window.location.pathname
    this.orgName= this.orgName.substring(13)
    console.log(this.orgName)

  }

  get f() { return this.formModel.controls; }


  onSubmit(form: NgForm) {
    console.log(this.pictures)

    this.submitted = true;
    this.loading = true;
    if (this.formModel.invalid || this.validateEmail(this.formModel.value.email) === false) {
      return;
    }

    else {
      this.name = form.value.name
      this.companyName = form.value.companyName
      this.email = form.value.email
      this.phone = form.value.Phone
      this.product = form.value.product
      this.issue = form.value.issue
      this.description = form.value.description
    }
    this.service.postComplaint({
      name:this.name,
      companyName:this.companyName,
      email:this.email,
      phone:this.phone,
      product:this.product,
      issue:this.issue,
      description:this.description,
      organisationName : this.orgName

    }, this.pictures)
      .subscribe();



    this.submitted = false
    this.loading = false;

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

  createImageFromBlob(_image: Blob) {

    const upload = async (event) => {
      const files = [...event.target.files].map(file => {
        const reader = new FileReader();
        return new Promise(resolve => {
          reader.onload = () => resolve(reader.result);
          this.imageToShow = () => resolve(reader.result);
          reader.readAsText(file);
        });
      });
      const res = await Promise.all(files);
      console.log(res)
    }

    const input = document.querySelector('input')
    input.onchange = upload
  }


  public caracterOnlyValidator(event: any) {
    const pattern = /^[a-zA-Z ]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^a-zA-Z\-éèàùêâîïäë ]/g, "");
    }
  }

  public numbersOnlyValidator(event: any) {
    const pattern = /^[0-9\-]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^0-9\-+()]/g, "");
    }
  }
  addChecklist(files: FileList) {
    this.pictures = files
    this.createImageFromBlob(this.pictures)

  }

    onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/user/login']);
  }

}
