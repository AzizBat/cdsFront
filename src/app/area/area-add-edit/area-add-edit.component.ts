import { Component,Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute  } from '@angular/router';
import {FormBuilder, NgForm, Validators} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AreaService } from 'src/app/shared/area.service';

import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-area-add-edit',
  templateUrl: './area-add-edit.component.html',
  styleUrls: ['../area.component.scss']

})
export class AreaAddEditComponent implements OnInit {

  @Input() public id;

  submitted = false;
  edit =false;
  sub;


  formModel= this.formBuilder.group({
    id: [0],
    name: ['', Validators.required],
    description: ['']
  });

  constructor(
    private _Activatedroute:ActivatedRoute,
    private _router:Router,
    public service: AreaService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,

  ) { }

  ngOnInit() {

    if (localStorage.getItem('token') == null)
    {this._router.navigateByUrl('/user/login');}
    if (this.id!=null) {
    this.service.getAreaById(this.id);
    //this.retreiveArea();
  }

  }

  get f() { return this.formModel.controls; }

  resetForm(form?: NgForm) {
    if (form != null)
      form.resetForm();
    this.service.formData = {
      id: 0,
      name: '',
      description:'',
      organisationId:0,
      archived : false
    }
  }

  onSubmit(form: NgForm) {
    this.submitted = true;
    // stop here if form is invalid
    if (this.formModel.invalid) {
      return;
    }
    form.value.id = this.id
    this.service.editArea(form.value, this.id).subscribe(
      _res => {
        this.resetForm(form);
        this.toastr.info('Submitted successfully', 'Area updated successfully');
        this.service.getAreas();
        localStorage.removeItem('areaId');
        this.activeModal.dismiss();
      },
      err => {
        debugger;
        console.log(err);
      }
    )  }



}
