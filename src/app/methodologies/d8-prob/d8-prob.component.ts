import { Component, OnInit } from '@angular/core';
import {Problem} from "../../models/prob/problem.model";
import {User} from "../../models/user.model";
import {Options} from "@angular-slider/ngx-slider";
import {ProblemService} from "../../shared/problem.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {UserService} from "../../shared/user.service";
import swal from "sweetalert2";
import{ComplaintService} from "../../shared/complaint.service";
import{ResolutionMethod} from "../../models/ResolutionMethodEnum";


@Component({
  selector: 'app-d8-prob',
  templateUrl: './d8-prob.component.html',
  styleUrls: ['./d8-prob.component.css']
})
export class D8ProbComponent implements OnInit {
  selectedProblem: any = {
    id : '',
    date : '',
    createdBy : '',
    name : '',
    description : '',
    type : '',
    resolutionMethod : [],
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
  filteredData:any
  complaintObject : any
  submitted = false;
  edit =false;
  sub;
  tab = 0



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
    public complaintservice: ComplaintService,

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

    this.id = this.route.snapshot.paramMap.get('id');
    this.complaintservice.getComplaintById2(this.id).subscribe(res => {(this.complaintObject = res || [])
      console.log(this.complaintObject);
    });


    this.userservice.getUsers().subscribe
    (res => {(this.users = res || [])
      this.users = this.users.body.content
    });
    this.retreiveProblem;

    this.retreiveProblem2;

    this.retreiveComplaint;


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

  retreiveComplaint() {
    const id = this.route.snapshot.paramMap.get('id');
    this.complaintObject =  this.complaintservice.getComplaintById2(id);
    console.log();
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

  onLogout() {
    localStorage.removeItem('token');
    localStorage.clear;
    this.router.navigate(['/user/login']);
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


  modify(){
    // this.edit = true;
    // localStorage.removeItem('userId');

    let newText = document.getElementById('newText') as HTMLSelectElement;
    let oldText = document.getElementById('oldText') as HTMLSelectElement;
    newText.style.display ='block'
    oldText.style.display ='none'
  }

  changeTab(tabNumber : number){
    this.tab = tabNumber
  // //   // this.getSerialNumbers()
  }
  save(){

  }
}


