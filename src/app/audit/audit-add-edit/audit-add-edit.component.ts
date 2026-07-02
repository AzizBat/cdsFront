import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuditService } from 'src/app/shared/audit.service';

@Component({
  selector: 'app-audit-add-edit',
  templateUrl: './audit-add-edit.component.html',
  styles: [
  ]
})
export class AuditAddEditComponent implements OnInit {

  constructor(public service: AuditService, private router: Router) { }

  ngOnInit() {

    this.service.refreshList();

    if (localStorage.getItem('token') == null)
      this.router.navigateByUrl('/user/login');


  }


  onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/user/login']);
  }

}
