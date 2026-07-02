

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuditActionService } from 'src/app/shared/auditAction.service';
import { HttpClient, HttpResponse ,HttpHeaders} from '@angular/common/http';
import {NgxPaginationModule} from 'ngx-pagination';
import { AuditAction } from 'src/app/models/auditAction.model';
import {UserService} from "src/app/shared/user.service";
import {DatePipe} from "@angular/common";
//import {Audit} from "src/app/models/audit.model";
import {FormBuilder} from "@angular/forms";
import {AreaService} from "src/app/shared/area.service";
import {Subscription} from "rxjs";
import {Problem} from "../../models/prob/problem.model";
import {ProblemService} from "../../shared/problem.service";
import {document} from "ngx-bootstrap/utils";
//import { OrganisationService } from 'src/app/service/organoisationSrvice';

@Component({
  selector: 'app-list-prob',
  templateUrl: './list-prob.component.html',
  styleUrls: ['./list-prob.component.css']
})
//OnIni initialisation des donnees
export class ListProbComponent implements OnInit {

  data: Array<any>
  pageOfItems : Array<Problem>;
  pageSize: number = 8;
  difference = []
  totaldays =[]
  leftdays = []
  totalItems =0
  ngbPaginationPage = 1;
  page!: number;
  allData: any;
  filteredData :any
  result :any
  name = ""
  type = ""
  resolutionMethod = ""
  creatorId = -1
  minDate = ""
  maxDate = ""
  organisationId = -1
  organisation: any
  problems :any
  areas :any
  users :any
  sortingBy = ""
  checked = false
  sub : Subscription
  abs = []


  typeConstants = [
    {name:"Audit", value:"AUDIT"},
    {name:"Event", value:"EVENT"},
    {name:"RECLAMATION", value:"RECLAMATION"}
  ]

  methodologyConstants = [
    {name:"JUST_DO_IT", value:"JUST_DO_IT"},
    {name:"IS_IS_NOT", value:"IS_IS_NOT"},
    {name:"FAULT_TREE", value:"FAULT_TREE"},
    {name:"PROCESS_MAP", value:"PROCESS_MAP"},
    {name:"WHYS", value:"WHYS"},
    {name:"MULTI_VARI", value:"MULTI_VARI"},
    {name:"FAILURE_MODES_AND_EFFECTS_ANALYSIS", value:"FAILURE_MODES_AND_EFFECTS_ANALYSIS"},
    {name:"PARETO", value:"PARETO"},
    {name:"FISH_BONE", value:"FISH_BONE"},
    {name:"RELATIONSHIP_DIAGRAM", value:"RELATIONSHIP_DIAGRAM"},
    {name:"CURRENT_REALITY_TREE", value:"CURRENT_REALITY_TREE"},
    {name:"SCATTER_PLOT", value:"SCATTER_PLOT"},
    {name:"CONCENTRATION_CHART", value:"CONCENTRATION_CHART"},
    {name:"DESIGN_OF_EXPERIMENTS", value:"DESIGN_OF_EXPERIMENTS"},
    {name:"TREE_DIAGRAM", value:"TREE_DIAGRAM"},
    {name:"BRAINSTORMING", value:"BRAINSTORMING"},
    {name:"REGRESSION_ANALYSIS", value:"REGRESSION_ANALYSIS"}
  ]



  formModel= this.formBuilder.group({
    name: [''],
    creatorId: [''],
    type: [''],
    from: [''],
    to: [''],
  });




  constructor(
    private formBuilder: FormBuilder,
    public service: ProblemService,
    private router: Router,
    private toastr: ToastrService,
    public userservice: UserService,
    private datepipe:DatePipe,
    public areaService: AreaService,

  ) {
    this.data = new Array<any>()
  }

  ngOnInit() {
    this.userservice.getOrganisation().subscribe
    (res => (this.organisation = res || []));
    console.log('content ' +localStorage.getItem('content'));
    this.userservice.getUsers().subscribe
    (res => {(this.users = res || [])
      this.users = this.users.body.content
      console.log(this.users)
    });

    this.getProblems();

   }

    getProblems(page?: number, dontNavigate?: boolean){
    const pageToLoad: number = page || this.page || 1;
    this.sub = this.service.getProblems(
      {
        page: pageToLoad - 1,
        size: 12,
        name:this.name,
        type:this.type,
        resolutionMethod:this.resolutionMethod,
        createdBy:this.creatorId,
        minDate:this.minDate,
        maxDate:this.maxDate,
        sortingBy:this.sortingBy,
      })
      .subscribe(
        (res: HttpResponse<Problem[]>) => {this.onSuccess(res.body, res.headers, pageToLoad, !dontNavigate)
        },
        () => this.onError()
      );
  }

  loadPage(page?: number, dontNavigate?: boolean): void {
    console.log(page)
    const pageToLoad: number = page || this.page || 1;

    this.service
      .getProblems({
        page: pageToLoad - 1,
        size: 12,
        name:this.name,
        type:this.type,
        resolutionMethod:this.resolutionMethod,
        createdBy:this.creatorId,
        minDate:this.minDate,
        maxDate:this.maxDate,
        sortingBy:this.sortingBy
      })
      .subscribe(
        (res: HttpResponse<Problem[]>) => this.onSuccess(res.body, res.headers, pageToLoad, !dontNavigate),
        () => this.onError()
      );
  }

  protected onSuccess(data: Problem[] | null, headers: HttpHeaders, page: number, navigate: boolean): void {
    this.totaldays = []
    this.leftdays = []
    this.difference = []
    this.abs = []
    this.page = page;
    if (navigate) {
      this.router.navigate(['/app-list-prob'], {
        queryParams: {
          page: this.page,
          size: 12,
          name:this.name,
          type:this.type,
          resolutionMethod:this.resolutionMethod,
          creatorId:this.creatorId,
          minDate:this.minDate,
          maxDate:this.maxDate,
          sortingBy:this.sortingBy
        },
      });
    }
    this.allData = data || [];
    console.log(this.allData)
    this.filteredData = this.allData.content
    this.result = this.allData.content
    console.log(this.filteredData)
    this.ngbPaginationPage = this.page;
    this.totalItems = this.allData.totalElements;
    for (let i =0 ; i<this.filteredData.length;i++){
      const date1 =new Date(this.filteredData[i].createDate)
      const date2 =new Date(this.filteredData[i].date)
      const date3 =new Date()
      const date4 =new Date(this.filteredData[i].modifiedDate)
      if(this.filteredData[i].status !=="FINISHED"){
        const totalDays = Math.ceil((date1.getTime() - date2.getTime())/ (1000 * 3600 * 24))
        const leftDays = Math.ceil((date1.getTime() - date3.getTime())/ (1000 * 3600 * 24))
        const pushingTotal = this.totaldays.push(totalDays)
        const pushingleft = this.leftdays.push(leftDays)
        const estim = this.difference.push((leftDays / totalDays)*100);
        const absolute = this.abs.push(Math.abs((leftDays / totalDays)*100));
      }
      else {
        this.difference.push(date1.getTime() - date4.getTime())
        const absolute = this.abs.push(this.difference);

      }
    };

  }

  protected onError(): void {
    console.log('error');
    this.ngbPaginationPage = this.page ?? 1;
  }

  viewDetailsProb (id) {
    this.router.navigateByUrl('/app-list-prob/app-details-prob/' + id);
  }


  pageClick(pageOfItems : Array<Problem>){
    this.pageOfItems = pageOfItems;
  }


  onLogout() {
    localStorage.removeItem('token');
    localStorage.clear;
    this.router.navigate(['/user/login']);
  }
// methode pour actualise la liste lors d'un flterBy
  changeProblem(){
    // this.result = this.audits.body.content
   // let filteredName = document.getElementById('name') as HTMLSelectElement;
    let filteredType = document.getElementById('type') as HTMLSelectElement;
    let filteredCreatorId = document.getElementById('creatorId') as HTMLSelectElement;
    let startingDate = document.getElementById('from') as HTMLSelectElement;
    let endDate = document.getElementById('to') as HTMLSelectElement;
    console.log(startingDate.value)
    console.log(this.problems)


    if(filteredType.options[filteredType.selectedIndex].value !== "null"){
      this.type =filteredType.options[filteredType.selectedIndex].value
    }

    console.log(filteredCreatorId.options[filteredCreatorId.selectedIndex].value)
    if(filteredCreatorId.options[filteredCreatorId.selectedIndex].value !== "null"){
      this.creatorId = parseInt(filteredCreatorId.options[filteredCreatorId.selectedIndex].value)
      console.log(this.creatorId)

    }

    if(startingDate.value !== ""){
      this.minDate =this.datepipe.transform(startingDate.value, "dd/MM/yyyy")

    }

    if(endDate.value !== ""){
      this.maxDate =this.datepipe.transform(endDate.value, "dd/MM/yyyy")
      // this.result = this.result.filter(obj => {
      //   return obj.date <= endDate.value
      // })
    }



    this.getProblems(0)

    console.log(this.result)
  }

  sorting(){
    const checkbox = document.getElementById('sort') as HTMLInputElement;
    if (checkbox.checked === true) {
      this.checked = true
      this.sortingBy = "lastModifiedDate"
    }
    else{
      this.checked = false
      this.sortingBy = "lastValue"
    }
    this.getProblems(0);
  }

  ngOnDestroy() {
    //prevent memory leak when component destroyed
    this.sub.unsubscribe();
  }
}
