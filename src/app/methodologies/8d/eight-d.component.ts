import { Component, OnInit } from '@angular/core';
import {Problem} from "../../models/prob/problem.model";
import {User} from "../../models/user.model";
import {Options} from "@angular-slider/ngx-slider";
import {ProblemService} from "../../shared/problem.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {UserService} from "../../shared/user.service";
import swal from "sweetalert2";
// import {FormBuilder} from '@angular/forms';
// import {AuditAction} from "../../../../models/auditAction.model";
import{ComplaintService} from "../../shared/complaint.service";
import{ResolutionMethod} from "../../models/ResolutionMethodEnum";

// import {Validators} from "@angular/forms";

@Component({
  selector: 'app-d8-prob',
  templateUrl: './eight-d.component.html',
  styleUrls: ['./eight-d.component.css']
})
export class EightDComponent implements OnInit {
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



  // formModel= this.formBuilder.group({
  //   id: [0],
  //   firstname: ['', Validators.required],
  //   lastname: ['', Validators.required],
  //   description: ['']
  // });

  // data: Array<any>
  // pageOfItems : Array<Problem>;
  // pageSize: number = 8;
  // organisation: any
  // totalItems =0
  // ngbPaginationPage = 1;

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
  // imageSelected = false
  // rowClicked : any
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
    // public resolutionMethodEnum: ResolutionMethod,


    // private formBuilder: FormBuilder,
    // public service: ComplaintService,

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
    });


    this.userservice.getUsers().subscribe
    (res => {(this.users = res || [])
      this.users = this.users.body.content
    });
    this.retreiveProblem;

    this.retreiveProblem2;

    this.retreiveComplaint2;

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

  retreiveComplaint2() {
    const id = this.route.snapshot.paramMap.get('id');
    this.complaintObject =  this.complaintservice.getComplaintById2(1);
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

    // if (this.organizer === false || (this.organizer ===true && verifyOrganizerAffectedUser === true)) {
    //     if (this.sliderValue > this.problemObject?.progress) {
    //       const id = this.route.snapshot.paramMap.get('id');
    //       this.service.postComment(id).subscribe(
    //         (res: any) => {
    //           comment.value = "";
    //           this.service.updateProgress(id, parseInt(String(this.sliderValue))).subscribe(
    //             (res: any) => {
    //               this.toastr.success('Action updated successfully!', 'EMP successful.');
    //               console.log(res);
    //               this.service.getProblemById(this.problemObject.id).subscribe(res => {
    //                 (this.problemObject = res || [])
    //                 console.log(this.problemObject)
    //                 this.problemObject.comments.sort(function (a, b) {
    //                   return parseFloat(a.id) - parseFloat(b.id);
    //                 })
    //               });
    //
    //             }
    //           )
    //         },
    //         err => {
    //           this.toastr.error('Error ', 'Updating action failed.');
    //           console.log(err);
    //         },
    //       );
    //     } else {
    //       swal.fire({
    //         icon: 'warning',
    //         title: 'Something went wrong!',
    //         text: 'your progress should be higher than the last update',
    //       })
    //     }
    //   }
    //   else {
    //     const id = this.route.snapshot.paramMap.get('id');
    //     this.service.postComment(id).subscribe(
    //       (res: any) => {
    //         this.toastr.success('Action updated successfully!', 'EMP successful.');
    //         console.log(res);
    //         this.service.getProblemById(this.problemObject.id).subscribe(res => {
    //           (this.problemObject = res || [])
    //           console.log(this.problemObject)
    //           this.problemObject.comments.sort(function (a, b) {
    //             return parseFloat(a.id) - parseFloat(b.id);
    //           })
    //         });
    //       },
    //       err => {
    //         this.toastr.error('Error ', 'Updating action failed.');
    //         console.log(err);
    //       },
    //     );
    //   }
  }

  // modifyMethod(){
  //   console.log("test");
  //   let resolutionMethod = document.getElementById('resolutionMethod') as HTMLSelectElement;
  //   let oldMethod = document.getElementById('fromDataBase') as HTMLSelectElement;
  //   resolutionMethod.style.display ='block'
  //   oldMethod.style.display ='none'
  // }

  // methodChanged(){
  //   let resolutionMethod = document.getElementById('resolutionMethod') as HTMLSelectElement;
  //   let oldMethod = document.getElementById('fromDataBase') as HTMLSelectElement;
  //   resolutionMethod.style.display ='none'
  //   oldMethod.style.display ='block'
  //
  //
  //   swal.fire({
  //     title: 'Are you sure?',
  //     text: "you're changing the resolution method!",
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Yes',
  //     cancelButtonText: 'No',
  //     reverseButtons: true
  //   })
  //     .then((willDelete) => {
  //       if (willDelete.isConfirmed) {
  //         console.log(resolutionMethod.value)
  //         this.service.updateResolutionMethod(this.problemObject.id,parseInt(resolutionMethod.value) ).subscribe(
  //           (res: any) => {
  //             this.problemObject = res || []
  //             console.log(this.problemObject)
  //             this.problemObject.comments.sort(function(a, b) {
  //               return parseFloat(a.id) - parseFloat(b.id);
  //             })
  //             swal.fire("Poof! Your method has been updated!","",
  //               'success'
  //             );
  //           },
  //           err => {
  //             this.toastr.error('Error ', 'Starting action failed.');
  //             console.log(err);
  //           },
  //         )
  //       }
  //     });
  // }

  // modifyProblem(){
  //   let newMethod = document.getElementById('newMethod') as HTMLSelectElement;
  //   let oldMethod = document.getElementById('oldMethod') as HTMLSelectElement;
  //     newMethod.style.display ='block'
  //     oldMethod.style.display ='none'
  // }
  //
  //   methodModified(){
  //   let newMethod = document.getElementById('newMethod') as HTMLSelectElement;
  //   let oldMethod = document.getElementById('oldMethod') as HTMLSelectElement;
  //   newdeadline.style.display ='none'
  //   oldDeadline.style.display ='block'
  //
  //   const date = newdeadline.value.toString().concat(" 12:00:00")
  //   let newDate  = new Date(date)
  //
  //   swal.fire({
  //     title: 'Are you sure?',
  //     text: "you're changing the deadline of this action!",
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Yes',
  //     cancelButtonText: 'No',
  //     reverseButtons: true,
  //   })
  //     .then((willDelete) => {
  //       if (willDelete) {
  //
  //         this.service.updateDeadline(this.problemObject.id,newDate).subscribe(
  //           (res: any) => {
  //             this.problemObject = res || []
  //             console.log(this.problemObject)
  //             this.problemObject.comments.sort(function(a, b) {
  //               return parseFloat(a.id) - parseFloat(b.id);
  //             })
  //             swal.fire("Poof! Your deadline has been updated!","",
  //               "success",
  //             );
  //           },
  //           err => {
  //             this.toastr.error('Error ', 'Starting action failed.');
  //             console.log(err);
  //           },
  //         )
  //       }
  //     });
  // }


  // // startAction(){
  // //   this.service.startAction(this.problemObject.id).subscribe(
  // //     (res: any) => {
  // //       this.toastr.success('Action started successfully!', 'EMP successful.');
  // //       this.problemObject = res || []
  // //       console.log(res);
  // //       console.log(this.problemObject)
  // //       this.problemObject.comments.sort(function(a, b) {
  // //         return parseFloat(a.id) - parseFloat(b.id);
  // //       })
  // //     },
  // //     err => {
  // //       this.toastr.error('Error ', 'Starting action failed.');
  // //       console.log(err);
  // //     },
  // //
  // //   );
  // // }
  // // finishAction(){
  // //   this.service.finishAction(this.problemObject.id).subscribe(
  // //     (res: any) => {
  // //       this.toastr.success('Action started successfully!', 'EMP successful.');
  // //       this.problemObject = res || []
  // //       console.log(res);
  // //       console.log(this.problemObject)
  // //       this.problemObject.comments.sort(function(a, b) {
  // //         return parseFloat(a.id) - parseFloat(b.id);
  // //       })
  // //       // this.router.navigateByUrl('/action');
  // //     },
  // //     err => {
  // //       this.toastr.error('Error ', 'Starting action failed.');
  // //       console.log(err);
  // //     },
  // //
  // //   );
  // // }
  //
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
  //
  //
  // // validateAction(){
  // //   swal.fire({
  // //     title: 'Are you sure?',
  // //     text: "you're validating this action!",
  // //     icon: 'info',
  // //     showCancelButton: true,
  // //     confirmButtonText: 'Yes',
  // //     cancelButtonText: 'No',
  // //     reverseButtons: true,
  // //   })
  // //
  // //     .then((willDelete) => {
  // //       if (willDelete) {
  // //         this.service.validateAction(this.problemObject.id).subscribe(
  // //           (res: any) => {
  // //             this.problemObject = res
  // //             // this.toastr.success('Action started successfully!', 'EMP successful.');
  // //             console.log(res);
  // //             console.log(this.problemObject)
  // //             this.problemObject.comments.sort(function(a, b) {
  // //               return parseFloat(a.id) - parseFloat(b.id);
  // //             })
  // //             swal.fire({
  // //               title: 'Sweet!',
  // //               imageUrl: '../../assets/success.png',
  // //               imageWidth: 300,
  // //               imageHeight: 200,
  // //               imageAlt: 'Custom image',
  // //             })
  // //             // this.router.navigateByUrl('/action');
  // //           },
  // //           err => {
  // //             this.toastr.error('Error ', 'Starting action failed.');
  // //             console.log(err);
  // //           },
  // //         );
  // //
  // //       }
  // //     });
  // }

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

  // changePreliminary(){

  // }

  modify(){
    //   let newBox = document.getElementById('newBox') as HTMLSelectElement;
    //   let oldBox = document.getElementById('oldBox') as HTMLSelectElement;
    //   newBox.style.display ='block'
    //   oldBox.style.display ='none'
  }

  // boxModified(){
  //   let newBox = document.getElementById('newBox') as HTMLSelectElement;
  //   let oldBox = document.getElementById('oldBox') as HTMLSelectElement;
  //   newBox.style.display ='none'
  //   oldBox.style.display ='block'
  //
  //   // const date = newdeadline.value.toString().concat(" 12:00:00")
  //   let newObject  = new String()
  //
  //   swal.fire({
  //     title: 'Are you sure?',
  //     text: "you're changing the deadline of this action!",
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Yes',
  //     cancelButtonText: 'No',
  //     reverseButtons: true,
  //   })
  //     .then((willDelete) => {
  //       if (willDelete) {
  //
  //         this.service.updateBox(this.problemObject.id,newObject).subscribe(
  //           (res: any) => {
  //             this.problemObject = res || []
  //             console.log(this.problemObject)
  //             this.problemObject.comments.sort(function(a, b) {
  //               return parseFloat(a.id) - parseFloat(b.id);
  //             })
  //             swal.fire("Poof! Your deadline has been updated!","",
  //               "success",
  //             );
  //           },
  //           err => {
  //             this.toastr.error('Error ', 'Starting action failed.');
  //             console.log(err);
  //           },
  //         )
  //       }
  //     });
  // }

  // }


  // get f() { return this.formModel.controls; }
  // onSubmitForm(form: NgForm) {
  //   this.submitted = true;
  //   // stop here if form is invalid
  //   if (this.formModel.invalid) {
  //     return;
  //   }
  //   form.value.id = this.id
  //   // this.service.editArea(form.value, this.id).subscribe(
  //   //   res => {
  //   //     this.resetForm(form);
  //   //     this.toastr.info('Submitted successfully', 'Area updated successfully');
  //   //     this.service.getAreas();
  //   //     localStorage.removeItem('areaId');
  //   //     this.activeModal.dismiss();
  //   //   },
  //   //   err => {
  //   //     debugger;
  //   //     console.log(err);
  //   //   }
  //   // )
  // }



  changeTab(tabNumber : number){
    this.tab = tabNumber
    // //   // this.getSerialNumbers()
  }
  save(){

  }
}


