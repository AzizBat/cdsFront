import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {HttpResponse ,HttpHeaders} from '@angular/common/http';
import { AuditAction } from '../../models/auditAction.model';
import {UserService} from "../../shared/user.service";
import {DatePipe} from "@angular/common";
import {FormBuilder} from "@angular/forms";
import {AreaService} from "../../shared/area.service";
import {Subscription} from "rxjs";
import {ProductService} from "../../shared/product.service";
import {SerialNumberService} from "../../shared/serialNumber.service";
import {SerialNumber} from "../../models/serialNumber.model";

@Component({
  selector: 'app-action',
  templateUrl: './product-inspection.component.html',
  styleUrls: ['./product-inspection.component.scss'],

})
export class ProductInspectionComponent implements OnInit {

  data: Array<any>
  pageOfItems : Array<AuditAction>;
  pageSize: number = 8;
  organisation: any
  difference = []
  totaldays =[]
  leftdays = []
  totalItems =0
  ngbPaginationPage = 1;
  page!: number;
  allData: any;
  filteredData :any
  result :any
  area = ""
  productId = -1
  inspectionStep = ""
  className = ""
  affectedUsers = -1
  minDate = ""
  maxDate = ""
  actions :any
  areas :any
  users :any
  sortingBy = ""
  checked = false
  sub : Subscription
  abs = []
  tab = 0
  serialNumber =""
  load = false


  products : any;

  statusConstants = [
    {name:"Roto", value:"ROTO"},
    {name:"Finition", value:"FINITION"},
    {name:"Final control", value:"CONTROLE_FINAL"},
    // {name:"Finished", value:"FINISHED"},
    ]

  areaConstants = [
    {name:"Bras 1 6003", value:"Bras 1 6003"},
  ]


  formModel= this.formBuilder.group({
    users: [''],
    serialNumber: [],
    areaId: [''],
    product: [''],
    inspectionStep: [''],
    className: [''],
    from: [''],
    to: [''],
  });

  constructor(
    private formBuilder: FormBuilder,
    public service: SerialNumberService,
    private router: Router,
    private toastr: ToastrService,
    public userservice: UserService,
    private datepipe:DatePipe,
    public areaService: AreaService,
    public productService: ProductService,
  ) {
    this.data = new Array<any>()
  }

  ngOnInit() {
    this.userservice.getOrganisation().subscribe(res => (this.organisation = res || []));
    console.log('content ' +localStorage.getItem('content'));

    this.getSerialNumbers()
    this.productService.getProduct().subscribe(res => {(this.products = res.body || [])
      } );

    this.areaService.getAreas1().subscribe(res => {(this.areas = res || [])
      this.areas = this.areas.body.content} );

    this.userservice.getAllOrganisationUsers().subscribe(res => {(this.users = res || [])
      console.log(this.users.content)
      this.users = this.users.content} );

  }


  //
  // getActions(page?: number, dontNavigate?: boolean){
  //   const pageToLoad: number = page || this.page || 1;
  //  this.sub = this.service.getActions(
  //     {
  //       page: pageToLoad - 1,
  //       size: 12,
  //       areaId:this.area,
  //       status:this.status,
  //       affectedUsers:this.affectedUsers,
  //       minDate:this.minDate,
  //       maxDate:this.maxDate,
  //       sortingBy:this.sortingBy,
  //     })
  //     .subscribe(
  //         (res: HttpResponse<AuditAction[]>) => {this.onSuccess(res.body, res.headers, pageToLoad, !dontNavigate)
  //         },
  //         () => this.onError()
  //       );
  // }


  getSerialNumbers(page?: number, dontNavigate?: boolean){
    const pageToLoad: number = page || this.page || 1;
    console.log("get serial")

    this.sub = this.service.getSerialNumber(
      {
        page: pageToLoad - 1,
        size: 12,
        // areaId: this.area,
        areaId: this.area,
        serialNumber: this.serialNumber,
        productId:this.productId,
        inspectionStep:this.inspectionStep,
        className : this.className,
        minDate:this.minDate,
        maxDate:this.maxDate,
        sortingBy:this.sortingBy,
        tab :this.tab
      })
      .subscribe(
        (res: HttpResponse<SerialNumber[]>) => {this.onSuccess(res.body, res.headers, pageToLoad, !dontNavigate)
        },
        () => this.onError()
      );
  }

  loadPage(page?: number, dontNavigate?: boolean): void {
    console.log(page)
    const pageToLoad: number = page || this.page || 1;

    this.service
      .getSerialNumber({
        page: pageToLoad - 1,
        size: 12,
        areaId: this.area,
        serialNumber: this.serialNumber,
        productId:this.productId,
        inspectionStep:this.inspectionStep,
        className : this.className,
        minDate:this.minDate,
        maxDate:this.maxDate,
        sortingBy:this.sortingBy,
        tab :this.tab
      })
      .subscribe(
        (res: HttpResponse<SerialNumber[]>) => this.onSuccess(res.body, res.headers, pageToLoad, !dontNavigate),
        () => this.onError()
      );
  }

  protected onSuccess(data: SerialNumber[] | null, _headers: HttpHeaders, page: number, navigate: boolean): void {
    this.totaldays = []
    this.leftdays = []
    this.difference = []
    this.abs = []
    this.page = page;
    if (navigate) {
      this.router.navigate(['/product-inspection'], {
        queryParams: {
          page: this.page,
          size: 12,
          areaId: this.area,
          serialNumber: this.serialNumber,
          productId:this.productId,
          inspectionStep:this.inspectionStep,
          className : this.className,
          minDate:this.minDate,
          maxDate:this.maxDate,
          sortingBy:this.sortingBy
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
      for (let i of this.filteredData.keys()){
        const date1 =new Date(this.filteredData[i].deadline)
        const date4 =new Date(this.filteredData[i].modifiedDate)
        if(this.filteredData[i].status !=="FINISHED"){
        }
      else {
        this.difference.push(date1.getTime() - date4.getTime())
          this.abs.push(this.difference);

        }
      }
      this.load = true;
  }

  protected onError(): void {
    console.log('error');
    this.ngbPaginationPage = this.page ?? 1;
  }

  viewDetails (id) {
    this.router.navigateByUrl('/product-inspection/details/' + id);
}


pageClick(pageOfItems : Array<AuditAction>){
  this.pageOfItems = pageOfItems;
}


  onLogout() {
    localStorage.removeItem('token');
    localStorage.clear();
    this.router.navigate(['/user/login']);
  }

  changeAudit(){
    // this.result = this.audits.body.content
    let filteredProducts = document.getElementById('products') as HTMLSelectElement;
    let inspectionStep = document.getElementById('inspectionStep') as HTMLSelectElement;
    let className = document.getElementById('className') as HTMLSelectElement;
    let startingDate = document.getElementById('from') as HTMLSelectElement;
    let endDate = document.getElementById('to') as HTMLSelectElement;
    let serialNumber = this.formModel.get(['serialNumber'])!.value


    if(filteredProducts.options[filteredProducts.selectedIndex].value !== "null"){
      this.productId = parseInt(filteredProducts.options[filteredProducts.selectedIndex].value)
    }
    else{
      this.productId = -1
    }

    if(inspectionStep.options[inspectionStep.selectedIndex].value !== "null"){
      this.inspectionStep =inspectionStep.options[inspectionStep.selectedIndex].value
    }
    else{
      this.inspectionStep = ""
    }

    if(className.options[className.selectedIndex].value !== "null"){
      this.className = className.options[className.selectedIndex].value
    }
    else{
      this.className = ""
    }

    console.log(serialNumber)
    if(serialNumber !== null){
      this.serialNumber = serialNumber
    }
    else{
      this.serialNumber = ""
    }



    if(startingDate.value !== ""){
      this.minDate =this.datepipe.transform(startingDate.value, "yyyy-MM-dd HH:mm:ss")
    }

    if(endDate.value !== ""){
      let date :string
      date = endDate.value.concat(" 23:59:59")
      this.maxDate =this.datepipe.transform(date, "yyyy-MM-dd HH:mm:ss")
    }

    this.getSerialNumbers(0)

  }

  changeTab(tabNumber : number){
    this.tab = tabNumber
        this.getSerialNumbers()
  }
}
