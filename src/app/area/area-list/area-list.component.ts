import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Area } from 'src/app/models/area.model';
import { AreaService } from 'src/app/shared/area.service';

@Component({
  selector: 'app-area-list',
  templateUrl: './area-list.component.html',
  styles: [
  ]
})
export class AreaListComponent implements OnInit {
  edit : boolean;
  pageOfItems : Array<Area>;
  pageSize: number = 8;

  constructor(public service: AreaService, private router: Router, private toastr: ToastrService) { }

  ngOnInit() {
    if (localStorage.getItem('token') == null)
    {this.router.navigateByUrl('/user/login');}
    this.service.getAreas();
    console.log('content ' +localStorage.getItem('content'));


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

  viewDetails (id) {
    this.edit = true;
    localStorage.removeItem('areaId');
    this.router.navigateByUrl('/area/add-edit/' + id);
    localStorage.setItem('areaId', id);
}



pageClick(pageOfItems : Array<Area>){
  this.pageOfItems = pageOfItems;
}

  onLogout() {
    localStorage.removeItem('token');
    localStorage.clear();
    this.router.navigate(['/user/login']);
  }

}
