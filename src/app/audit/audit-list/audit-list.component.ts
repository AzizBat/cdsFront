import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Audit } from 'src/app/models/audit.model';
import { AuditService } from 'src/app/shared/audit.service';

@Component({
  selector: 'app-audit-list',
  templateUrl: './audit-list.component.html',
  styles: [
  ]
})
export class AuditListComponent implements OnInit {

  pageOfItems : Array<Audit>;
  pageSize: number = 8;

  constructor(public service: AuditService, private router: Router) { }

  ngOnInit() {

    this.service.refreshList();
    this.service.getAuditTypes();

    if (localStorage.getItem('token') == null)
      this.router.navigateByUrl('/user/login');


  }

  viewDetails (id) {
    this.router.navigateByUrl('/audit/details/' + id);
}



pageClick(pageOfItems : Array<Audit>){
  this.pageOfItems = pageOfItems;
}

  onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/user/login']);
  }


}
