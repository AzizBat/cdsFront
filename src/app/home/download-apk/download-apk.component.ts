import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/shared/user.service';

@Component({
  selector: 'app-download-apk',
  templateUrl: './download-apk.component.html',
  styles: [
  ]
})
  export class DownloadApkComponent implements OnInit {

  constructor(public service: UserService, private router: Router, private toastr: ToastrService) { }

  ngOnInit() {
    if (localStorage.getItem('token') == null)
      this.router.navigateByUrl('/user/login');
  }
  onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/user/login']);
  }
}
