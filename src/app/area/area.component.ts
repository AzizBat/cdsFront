import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AreaService } from '../shared/area.service';
import {FormBuilder, NgForm, Validators} from "@angular/forms";
import {Area} from "../models/area.model";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AreaAddEditComponent} from "./area-add-edit/area-add-edit.component";
import {UserService} from "../shared/user.service";
// BsModalService
@Component({
  selector: 'app-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.scss']
})
export class AreaComponent implements OnInit {

  edit =false;
  sub;
  id;
  pageOfItems : Array<Area>;
  pageSize: number = 12;
  submitted = false;
  exist = false
  organisation: any
  load =  false
  currentRole : any



  formModel= this.formBuilder.group({
    id: [0],
    name: ['', Validators.required],
    description: ['']
  });

  selectedArea : Area = {
    id: 0,
    name: '',
    description:'',
    organisationId :0,
    archived : false

  };
  constructor(
    public service: AreaService,
    private router: Router,
    private toastr: ToastrService,
    private Activatedroute:ActivatedRoute,
    private formBuilder: FormBuilder,
    protected modalService: NgbModal,
    public userservice: UserService,

  ) { }

  ngOnInit() {


    if (localStorage.getItem('token') == null)
    {this.router.navigateByUrl('/user/login');}

    const currentUser = localStorage.getItem('curUser')
    const id = JSON.parse(currentUser).organisationId
    if(JSON.parse(currentUser).roles.length>1){
      this.currentRole = "ROLE_ORGANIZER"
    }
    else {
      this.currentRole = JSON.parse(currentUser).roles[0].name
    }

    this.service.getAreas();

    this.userservice.getOrganisation().subscribe(res => {(this.organisation = res || [])
    this.load= true
    });
  }

  get f() { return this.formModel.controls; }

  resetForm(form?: NgForm) {
    this.submitted = false;
    if (form != null)
      form.resetForm();
    this.service.formData = {
      id: 0,
      name: '',
      description: '',
      organisationId: 0,
      archived : false


    }
  }

  onSubmit(form: NgForm) {
    this.exist = false
    this.submitted = true;
    // stop here if form is invalid
    if (this.formModel.invalid) {
      return;
    }
    const currentUser = localStorage.getItem( 'curUser')
    console.log(JSON.parse(currentUser).organisationId)
    for (let i of this.pageOfItems.keys()){
      if(form.value.name === this.pageOfItems[i].name){
        console.log("exists")
        this.exist = true
      }
    }
    this.sub=this.Activatedroute.paramMap.subscribe(params => {
      this.id = params.get('id');
    });

    if (this.id === null )
      this.insertRecord(form);
  }

  insertRecord(form: NgForm) {
    this.service.postArea(form.value).subscribe(
      _res => {

        this.toastr.success('Area Inserted successfully', 'EMP. Register');
        this.resetForm(form);
        this.service.getAreas();
      },
      err => {

        console.log(err);
      });
  }

  pageClick(pageOfItems : Array<Area>){
    this.pageOfItems = pageOfItems;
  }

  viewDetails (id) {
    this.edit = true;
    localStorage.removeItem('areaId');
    localStorage.setItem('areaId', id);

    const modalRef = this.modalService.open(AreaAddEditComponent, {  });
    modalRef.componentInstance.id = id;
  }

  onDelete(id) {
    if (confirm('Are you sure to delete this record ?')) {
      this.service.archiveArea(id)
        .subscribe(_res => {
            this.service.getAreas();
            this.toastr.warning('Deleted successfully', 'Area Register');
          },
          err => {
            debugger;
            console.log(err);
          })
    }
  }

  restore(id) {
    if (confirm('Are you sure to restore this record ?')) {
      this.service.restoreArea(id)
        .subscribe(_res => {
            this.service.getAreas();
            this.toastr.success('restored successfully', 'Area Register');
          },
          err => {
            debugger;
            console.log(err);
          })
    }
  }
}
