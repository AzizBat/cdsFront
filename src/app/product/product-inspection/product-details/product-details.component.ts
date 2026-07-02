import {Component, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuditAction } from 'src/app/models/auditAction.model';
import {Options} from "@angular-slider/ngx-slider";
import swal from 'sweetalert2';
import {User} from "../../../models/user.model";
import {UserService} from "../../../shared/user.service";
import {ProductService} from "../../../shared/product.service";
import {SerialNumberService} from "../../../shared/serialNumber.service";
import {NgSelectComponent} from "@ng-select/ng-select";



@Component({
  selector: 'app-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],

})
export class ProductDetailsComponent implements OnInit {
  imageToShow: any;
  isImageLoading  = false;
  data: any;
  auditAction: AuditAction;
  user :any
  users :any
  serialNumberObject : any
  currentUser : any
  organizer = false
  pageOfItems: Array<User>;
  rotoCreatedUser : any
  valueclosed = []
  closed = false
  auditTasksGroupRoto : any
  auditTasksRoto : any
  idResponse : any
  i : any
  audits =[]
  products : any
  load = false
  pictures : any = []
  @ViewChild(NgSelectComponent) ngSelectComponent!: NgSelectComponent;

  selectedProduct: any;

  parentElement = document.getElementById('ngx-slider');

  title = 'ngx-slider';
  value: number = 50;
  options: Options = {
    floor: 0,
    ceil: 100
  };



  constructor(
    public service: SerialNumberService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    public userservice: UserService,
    public productService: ProductService,
  ) { }

  ngOnInit() {
    this.currentUser = localStorage.getItem('curUser')
    this.currentUser = JSON.parse(this.currentUser)

    const id = this.route.snapshot.paramMap.get('id');
    this.service.getSerialNumberById(id).subscribe(res => {(this.serialNumberObject = res || [])
      console.log(this.serialNumberObject)

      this.auditTasksGroupRoto = this.serialNumberObject.audits[0].auditType.auditTasksGroups
      this.auditTasksGroupRoto.sort(function (a, b) {
        return a.order - b.order;
      });
      this.auditTasksRoto = []
      for (let i=0; i<this.auditTasksGroupRoto.length; i++) {
        this.auditTasksRoto.push(this.auditTasksGroupRoto[i].auditTasks)
        this.auditTasksRoto[i].sort(function (a, b) {
          return a.order - b.order;
        });
      }

      for (let i= 0 ; i< this.serialNumberObject?.audits[0]?.auditResponses.length; i++){
        if(this.serialNumberObject?.audits[0]?.auditResponses[i]?.content === this.serialNumberObject.name){
          this.idResponse = this.serialNumberObject?.audits[0]?.auditResponses[i]?.auditTaskId
        }
      }

      for(let i=0; i<this.auditTasksRoto.length; i++){
        if(this.auditTasksRoto[i][1]?.id === this.idResponse){
          this.i = i
        }
      }

      for (let i=0; i<this.auditTasksGroupRoto.length; i++) {
        this.auditTasksRoto.push(this.auditTasksGroupRoto[i]?.auditTasks)
        this.auditTasksRoto[i].sort(function (a, b) {
          return a.order - b.order;
        });
      }

      for (let i=0; i<this.serialNumberObject.audits.length; i++){
        this.audits.push(this.serialNumberObject?.audits[i])
        this.audits.sort(function (a, b) {
          return a.id - b.id;
        });
      }
      this.pictures.push(this.serialNumberObject?.image)
      this.pictures.push(this.serialNumberObject?.image2)
      console.log(this.pictures)


      this.userservice.getUsers().subscribe(resp => {(this.users = resp || [])
        this.users = this.users.body.content
        for (let i of this.users.keys()){
          if(this.users[i].id === this.serialNumberObject.createdUser)
          {
            this.rotoCreatedUser = this.users[i]
          }
        }
      });
      this.load = true
    });

    this.productService.getAllProduct().subscribe(res => {(this.products = res || [])
      this.products = this.products.body
      console.log(this.products[0])
    })
    }

  generateReport(){
  }

  formClosed(i : number): boolean{
    for( let j of this.valueclosed.keys()){
      if (i === this.valueclosed[j]){
        return true
      }
    }
    return false
  }

  closeList(j : number){
    const list = document.getElementById(j.toString());
    list.style.display = 'none'
    this.closed = true
    this.valueclosed.push(j)
  }

  openList(j: number){
    const list = document.getElementById(j.toString());
    list.style.display = 'block'
    this.closed = false
    this.valueclosed.forEach((element,index)=>{
      if(element==j) this.valueclosed.splice(index,1);
    });
  }

  createImageFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.imageToShow = reader.result;
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  modifyProduct(){
    let newProduct = document.getElementById('newProduct') as HTMLSelectElement;
    let oldProductName = document.getElementById('productName') as HTMLSelectElement;
    newProduct.style.display ='block'
    oldProductName.style.display ='none'
  }


  modifySerialNumber(){
    swal.fire({
      input: 'text',
      text: "you're updating the Serial Number!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      // reverseButtons: true,
    }

    )
      .then((result) => {
        if (result.value !== undefined) {
          const SerialNumber = result.value
          this.service.updateSerialNumber(Number(this.route.snapshot.paramMap.get('id')) ,SerialNumber ).subscribe(
            // this.service.updateDeadline(this.auditActionObject.id,newDate).subscribe(
            (res: any) => {
              this.service.getSerialNumberById(this.route.snapshot.paramMap.get('id')).subscribe(res => {
                (this.serialNumberObject = res || [])

                swal.fire("Poof! Your Serial Number has been updated!", "",
                  "success",
                );
              })
            },
            err => {
              this.toastr.error('Error ', 'Updating failed.');
              console.log(err);
            },
          )
        }
        else{
          this.toastr.error('Error ', 'Updating failed.');
        }
      });
  }

  modifyReference(){
    swal.fire({
        input: 'text',
        text: "you're updating the reference!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        // reverseButtons: true,
      }

    )
      .then((result) => {
        if (result.value !== undefined) {
          const Reference = result.value
          this.service.updateReference(Number(this.route.snapshot.paramMap.get('id')) ,Reference ).subscribe(
            // this.service.updateDeadline(this.auditActionObject.id,newDate).subscribe(
            (res: any) => {
              this.service.getSerialNumberById(this.route.snapshot.paramMap.get('id')).subscribe(res => {
                (this.serialNumberObject = res || [])

                swal.fire("Poof! Your reference has been updated!", "",
                  "success",
                );
              })
            },
            err => {
              this.toastr.error('Error ', 'Updating failed.');
              console.log(err);
            },
          )
        }
        else{
          this.toastr.error('Error ', 'Updating failed.');
        }
      });
  }

  modifyBatchNumber(){
    swal.fire({
        input: 'text',
        text: "you're updating the batch number!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        // reverseButtons: true,
      }

    )
      .then((result) => {
        if (result.value !== undefined) {
          const batchNumber = result.value
          this.service.updateBatchNumber(Number(this.route.snapshot.paramMap.get('id')) ,batchNumber ).subscribe(
            // this.service.updateDeadline(this.auditActionObject.id,newDate).subscribe(
            (res: any) => {
              this.service.getSerialNumberById(this.route.snapshot.paramMap.get('id')).subscribe(res => {
                (this.serialNumberObject = res || [])

                swal.fire("Poof! Your batch number has been updated!", "",
                  "success",
                );
              })
            },
            err => {
              this.toastr.error('Error ', 'Updating failed.');
              console.log(err);
            },
          )
        }
        else{
          this.toastr.error('Error ', 'Updating failed.');
        }
      });
  }

  productModified(){
    let newProduct = document.getElementById('newProduct') as HTMLSelectElement;
    let oldProductName = document.getElementById('productName') as HTMLSelectElement;
    newProduct.style.display ='none'
    oldProductName.style.display ='block'
    const id = Number(this.route.snapshot.paramMap.get('id')) ;

    console.log(this.selectedProduct)


    swal.fire({
      title: 'Are you sure?',
      text: "you're changing the product!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: true,
    })
      .then((willDelete) => {
        if (willDelete) {
            this.service.updateProducts(id,this.selectedProduct.id).subscribe(
          // this.service.updateDeadline(this.auditActionObject.id,newDate).subscribe(
            (_res: any) => {
              this.service.getSerialNumberById(id).subscribe(res => {
                (this.serialNumberObject = res || [])
                console.log(this.serialNumberObject)

                swal.fire("Poof! Your product has been updated!", "",
                  "success",
                );
              })
            },
            err => {
              this.toastr.error('Error ', 'Prodct update failed.');
              console.log(err);
            },
          )
        }
      });
  }




  onLogout() {
    localStorage.removeItem('token');
    localStorage.clear();
    this.router.navigate(['/user/login']);
  }
}
