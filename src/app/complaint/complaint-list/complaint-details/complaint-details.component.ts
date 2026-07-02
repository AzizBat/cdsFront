import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuditAction } from 'src/app/models/auditAction.model';
import {UserService} from "../../../shared/user.service";
import {User} from "../../../models/user.model";
import {ComplaintService} from "../../../shared/complaint.service";

@Component({
  selector: 'app-details',
  templateUrl: './complaint-details.component.html',
  styleUrls: ['./complaint-details.component.scss'],
})
export class ComplaintDetailsComponent implements OnInit {

  selectedAction: any = {
    id : '',
    date : '',
 //   illustrationUri : string;
    status : '',
    instruction : '',
    deadline : '',
    picture : '',
    auditResponseId : '',
    areaName : '',
    affectedUsers : '',
    organisationId : '',

  };

  imageToShow: any;
  isImageLoading  = false;
  data: any;
  auditAction: AuditAction;
  user :any
  users :any
  complaintObject : any
  currentUser : any
  organizer = false
  pageOfItems: Array<User>;
  body : any
  images : any
  load = false

  parentElement = document.getElementById('ngx-slider');
  title = 'ngx-slider';

  constructor(
    public service: ComplaintService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    public userservice: UserService,
  ) { }

  ngOnInit() {
     this.currentUser = localStorage.getItem('curUser')
    this.currentUser = JSON.parse(this.currentUser)

    const id = this.route.snapshot.paramMap.get('id');

     this.service.getComplaintById2(id).subscribe(res => {(this.complaintObject = res || [])
       this.body = this.complaintObject[0]
       this.images = this.complaintObject[1]
        this.load = true
       console.log(this.images)
     });

    this.userservice.getUsers().subscribe(res => {(this.users = res || [])
      this.users = this.users.body.content
    });
  }
    getImageFromService() {
      this.isImageLoading = true;
      this.selectedAction.id.subscribe(data => {
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

  onLogout() {
    localStorage.removeItem('token');
    localStorage.clear();
    this.router.navigate(['/user/login']);
  }
}
