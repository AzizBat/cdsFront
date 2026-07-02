import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuditAction } from 'src/app/models/auditAction.model';
import { AuditActionService } from 'src/app/shared/auditAction.service';
//import {UserService} from "../../shared/user.service";
import {UserService} from "../../../shared/user.service";
import {MDCSlider} from '@material/slider';
import {Options} from "@angular-slider/ngx-slider";
import swal from 'sweetalert2';
import {User} from "../../../models/user.model";
// import Swal1 from "sweetalert";
import {Problem} from "../../../models/prob/problem.model";
import {ProblemService} from "../../../shared/problem.service";
import Swal from "sweetalert2";


@Component({
  selector: 'app-details-prob',
  templateUrl: './details-prob.component.html',
  styleUrls: ['./details-prob.component.css']
})
export class DetailsProbComponent implements OnInit {

  selectedProblem: any = {
    id : '',
    date : '',
    createdBy : '',
    name : '',
    description : '',
    type : '',
    resolutionMethod : '',
    picture : '',
    auditResponseId : '',
    comments :  '',
    organisationId : '',



  };

  imageToShow: any;
  isImageLoading  = false;
  data: any;
  problem: Problem;
  creatorId :any
  createdBy :any
  user :any
  users :any
  problemObject : any
  currentUser : any
  organizer = false
  pageOfItems: Array<User>;
  load = false
  id: any
  submitted = false
  notSelected = false



  parentElement = document.getElementById('ngx-slider');

  title = 'ngx-slider';
  value: number = 50;
  options: Options = {
    floor: 0,
    ceil: 100
  };
  sliderValue = 0;



  constructor(
    public service: ProblemService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    public userservice: UserService,

  ) { }

  ngOnInit() {
    this.currentUser = localStorage.getItem('curUser')
    this.currentUser = JSON.parse(this.currentUser)
    for (let i = 0; i< this.currentUser.roles.length; i++){
      if (this.currentUser.roles[i].name !=="ROLE_ORGANIZER"){
        this.organizer = true
      }
    }
    this.id = this.route.snapshot.paramMap.get('id');
    this.service.getProblemById2(this.id).subscribe(res => {(this.problemObject = res || [])
      this.problemObject.comments.sort(function(a, b) {
        return parseFloat(a.id) - parseFloat(b.id);
      })
      this.options = {
        floor: 0,
        ceil: 100
      };
      for(let i =0 ; i<this.problemObject.comments; i++){}
      this.userservice.getUserWithPicture(this.problemObject.createdBy.toString()).subscribe
      (res => {(this.user = res || [])
        this.user = this.user.body
      });
    });

    this.userservice.getUsers().subscribe
    (res => {(this.users = res || [])
      this.users = this.users.body.content
    });
    this.retreiveProblem;

    this.retreiveProblem2;


  }


  retreiveProblem() {
    const id = this.route.snapshot.paramMap.get('id');
    this.selectedProblem =  this.service.getProblemById2(id);

    this.getImageFromService();
  }

  getImageFromService() {
    this.isImageLoading = true;
    this.selectedProblem.id.subscribe(data => {
      this.createImageFromBlob(data);
      this.isImageLoading  = false;
    }, error => {
      this.isImageLoading  = false;
      console.log(error);
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


  retreiveProblem2() {
    const id = this.route.snapshot.paramMap.get('id');
    this.selectedProblem =  this.service.getProblemById2(id).subscribe(
      (resp) => {
        this.selectedProblem = resp;
        console.log(this.selectedProblem);
      });
  }



  onSubmit() {

    const comment = document.getElementById('comment') as HTMLInputElement;
    const message = comment.value
    comment.value = ""


    let verifyOrganizerAffectedUser = false
    for (let i =0; i< this.problemObject.affectedUsers.length; i++){
      if(this.currentUser.id === this.problemObject.affectedUsers[i].id){
        verifyOrganizerAffectedUser = true
      }
    }
  }

    methodChanged(){
    let resolutionMethod = document.getElementById('resolutionMethod') as HTMLSelectElement;
    let oldMethod = document.getElementById('fromDataBase') as HTMLSelectElement;
      // resolutionMethod.style.display ='none'
      // oldMethod.style.display ='block'
      console.log(resolutionMethod);
      console.log(oldMethod);


    swal.fire({
      title: 'Are you sure?',
      text: "you're saving the resolution method!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: true
    })
      .then((willDelete) => {
        if (willDelete.isConfirmed) {
          console.log(resolutionMethod.value)
          this.service.updateResolutionMethod(this.problemObject.id, (resolutionMethod.value) ).subscribe(
            (res: any) => {
              this.problemObject = res || []
              console.log(this.problemObject)
              this.problemObject.comments.sort(function(a, b) {
                return parseFloat(a.id) - parseFloat(b.id);
              })
              swal.fire("Poof! Your method has been updated!","",
                'success'
              );
            },
            err => {
              this.toastr.error('Error ', 'Failed.');
              console.log(err);
            },
          )
        }
      });

  }

  // deleteProblem(){
  //   Swal1({
  //     className: "", closeOnClickOutside: false, closeOnEsc: false, timer: 0,
  //     title: "Are you sure?",
  //     text: "provide us the reason of the cancellation!",
  //     content: "input",
  //     icon: "warning",
  //     buttons: true,
  //     dangerMode: true
  //
  //   })
  //     .then((willDelete) => {
  //       if (willDelete) {
  //         console.log(willDelete)
  //         this.service.deleteProblem(this.problemObject.id, willDelete).subscribe(
  //           (res: any) => {
  //             this.problemObject = res
  //             console.log(res);
  //             this.problemObject.comments.sort(function(a, b) {
  //               return parseFloat(a.id) - parseFloat(b.id);
  //             })
  //             Swal1("Poof! Your action has been canceled!", {
  //               icon: "success",
  //             });
  //           },
  //           err => {
  //             this.toastr.error('Error ', 'Starting action failed.');
  //             console.log(err);
  //           },
  //         );
  //       }
  //     });
  // }


  onLogout() {
    localStorage.removeItem('token');
    localStorage.clear;
    this.router.navigate(['/user/login']);
  }

  goTo8d (id) {
    console.log(id);
    this.router.navigateByUrl('/app-list-prob/app-details-prob/app-d8-prob/' +id );
  }

  showImage(){
    swal.fire({
              title: 'Show Image',
              imageUrl: '/assets/problem.png',
              // imageWidth: 100px,
              // imageHeight: 100px,
    })
  }
  closePopup(){
    let popup = document.getElementById('popup') as HTMLElement;
    popup.style.display = 'none'
  }

}
