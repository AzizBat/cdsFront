import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpResponse ,HttpHeaders} from '@angular/common/http';
import {DatePipe} from "@angular/common";
import {FormBuilder} from "@angular/forms";
import {Subscription} from "rxjs";
import {Complaint} from "../../models/complaint.model";
import {ComplaintService} from "../../shared/complaint.service";
import {UserService} from "../../shared/user.service";

@Component({
  selector: 'app-action',
  templateUrl: './complaint-list.component.html',
  styleUrls: ['./complaint-list.component.scss'],

})
export class ComplaintListComponent implements OnInit {

  data: Array<any>
  pageOfItems : Array<Complaint>;
  pageSize: number = 8;
  organisation: any
  totalItems =0
  ngbPaginationPage = 1;
  page!: number;
  allData: any;
  filteredData :any
  result :any
  minDate = ""
  maxDate = ""
  complaints :any
  users :any
  sub : Subscription
  load = false

  statusConstants = [
    {name:"Created", value:"CREATED"},
    {name:"Started", value:"STARTED"},
    {name:"Finished", value:"FINISHED"},
    {name:"Canceled", value:"CANCELED"},
    ]



  formModel= this.formBuilder.group({
    areaName: [''],
    affectedUsers: [''],
    status: [''],
    from: [''],
    to: [''],
  });




  constructor(
    private formBuilder: FormBuilder,
    public service: ComplaintService,
    private router: Router,
    private toastr: ToastrService,
    public userservice: UserService,
    private datepipe:DatePipe,

  ) {
    this.data = new Array<any>()
  }

  ngOnInit() {
    this.userservice.getOrganisation().subscribe(res => (this.organisation = res || []));
    console.log('content ' +localStorage.getItem('content'));
    this.userservice.getUsers().subscribe(res => {(this.users = res || [])
      this.users = this.users.body.content});
    this.getComplaints();
  }

  getComplaints(page?: number, dontNavigate?: boolean){
    const pageToLoad: number = page || this.page || 1;
   this.sub = this.service.getComplaints(
      {
        page: pageToLoad - 1,
        size: 12,
        minDate:this.minDate,
        maxDate:this.maxDate,
      })
      .subscribe(
          (res: HttpResponse<Complaint[]>) => {this.onSuccess(res.body, res.headers, pageToLoad, !dontNavigate)
          },
          () => this.onError()
        );
  }

  loadPage(page?: number, dontNavigate?: boolean): void {
    console.log(page)
    const pageToLoad: number = page || this.page || 1;

    this.service
      .getComplaints({
        page: pageToLoad - 1,
        size: 12,
        minDate:this.minDate,
        maxDate:this.maxDate,
      })
      .subscribe(
        (res: HttpResponse<Complaint[]>) => this.onSuccess(res.body, res.headers, pageToLoad, !dontNavigate),
        () => this.onError()
      );
  }

  protected onSuccess(data: Complaint[] | null, _headers: HttpHeaders, page: number, navigate: boolean): void {
    this.page = page;
    if (navigate) {
      this.router.navigate(['/complaint'], {
        queryParams: {
          page: this.page,
          size: 12,
          minDate:this.minDate,
          maxDate:this.maxDate,
        },
      });
    }
    this.allData = data || [];
    console.log(this.allData)
    this.filteredData = this.allData[0]
    this.result = this.allData.content
    console.log(this.filteredData)
    this.ngbPaginationPage = this.page;
    this.totalItems = this.allData[1];
    this.load = true
  }

  protected onError(): void {
    console.log('error');
    this.ngbPaginationPage = this.page ?? 1;
  }

  viewDetails (id) {
    this.router.navigateByUrl('/complaints/details/' + id);
}


pageClick(pageOfItems : Array<Complaint>){
  this.pageOfItems = pageOfItems;
}

  onLogout() {
    localStorage.removeItem('token');
    localStorage.clear();
    this.router.navigate(['/user/login']);
  }

  changeAudit(){
    let startingDate = document.getElementById('from') as HTMLSelectElement;
    let endDate = document.getElementById('to') as HTMLSelectElement;
    console.log(startingDate.value)


    if(startingDate.value !== ""){
      this.minDate =this.datepipe.transform(startingDate.value, "yyyy-MM-dd HH:mm:ss")
    }

    if(endDate.value !== ""){
      this.maxDate =this.datepipe.transform(endDate.value, "yyyy-MM-dd HH:mm:ss")
    }

    this.getComplaints(0)

    console.log(this.result)
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
