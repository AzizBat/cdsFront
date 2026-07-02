import {Component, OnInit} from "@angular/core";
import {UserService} from "../shared/user.service";
import {AuditService} from "../shared/audit.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.scss']
})
export class ChecklistComponent implements OnInit {

  organisation: any
  checklists: any
  currentUser : any
  organizer = false
  load = false

  constructor(
    public userservice: UserService,
    public auditService: AuditService,
    private toastr: ToastrService,


  ){}


  ngOnInit() {

    const currentUser = localStorage.getItem('curUser')
    this.currentUser =JSON.parse(currentUser)
    for (let i of this.currentUser.roles.keys()){
      if (this.currentUser.roles[i].name === "ROLE_ORGANIZER"){
        this.organizer = true
      }
    }



    this.userservice.getOrganisation().subscribe(res => (this.organisation = res || []));

    this.auditService.getAuditTypes().subscribe(res => {(this.checklists = res.body || [])
      this.checklists = this.checklists.content
      this.load = true
    });
  }

  onDelete(id: number){
    if (confirm('Are you sure to delete this record ?')) {
      this.auditService.archiveAuditTypes(id)
        .subscribe(_res => {
            this.auditService.getAuditTypes().subscribe(res => {(this.checklists = res.body || [])
              this.checklists = this.checklists.content
            });
            this.toastr.warning('Deleted successfully', 'Checklist deleted');
          },
          err => {
            debugger;
            console.log(err);
          })
    }
  }

  restore(id) {
    if (confirm('Are you sure to restore this record ?')) {
      this.auditService.restoreAuditTypes(id)
        .subscribe(_res => {
            this.auditService.getAuditTypes().subscribe(res => {(this.checklists = res.body || [])
              this.checklists = this.checklists.content
            });
            this.toastr.success('restored successfully', 'Checklist restored');
          },
          err => {
            debugger;
            console.log(err);
          })
    }
  }

  addChecklist(files: FileList){
  console.log(files[0])
    // this.auditService.uploadChecklist(files.file[0])
    this.auditService.uploadChecklist(files[0])
      .subscribe(_res => {
          this.auditService.getAuditTypes().subscribe(res => {(this.checklists = res.body || [])
            this.checklists = this.checklists.content
          });            this.toastr.success('uploaded successfully', 'Checklist uploaded');
        },
        err => {
          console.log(err);
          this.toastr.error('can not upload', 'this is not a correct file');
        })
  }

}
