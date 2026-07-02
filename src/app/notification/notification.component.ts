import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../shared/notification.service';
import {Notification} from "../models/notification.model";

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styles: [
  ]
})
export class NotificationComponent implements OnInit {

  notification : Notification[]

  constructor(private router: Router, public notifService : NotificationService) { }

  ngOnInit(): void {

    this.notifService.getnotifications().subscribe(res => {(this.notification = res.body || [])
      console.log(this.notification)
    });
  }

  viewActionDetails (id) {
    this.router.navigateByUrl('/action/details/' + id);
}

  onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/user/login']);
  }
}
