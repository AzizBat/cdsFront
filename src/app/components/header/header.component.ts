import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService} from 'src/app/shared/notification.service';
import {Notification} from "../../models/notification.model";
import {NotificationsService} from "../../notification.service";
import {ToastrService} from "ngx-toastr";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: [
  ]
})
export class HeaderComponent implements OnInit {

  currentUser : any
  greeting: any;
  notification : Notification[]
  webSocketAPI: NotificationsService;
  i : number =0
  notifier =false
  public languageArray = ['English', 'Français'];

  constructor(
    private router: Router,
    public notifService : NotificationService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.translate.use('English');
  }

  ngOnInit(): void {
    // this.webSocketAPI = new NotificationsService(new HeaderComponent(this.router, this.notifService, this.toastr, this.translate));
    // this.notifService.getnotifications().subscribe(res => {(this.notification = res.body || [])
    // });
    // timer(5000).subscribe(x => { this.sendMessage() })
    this.currentUser = localStorage.getItem('curUser')
    this.currentUser =JSON.parse(this.currentUser)
    // this.connect(this.currentUser.id)
  }

  viewActionDetails (id) {
    this.router.navigateByUrl('/action/details/' + id);
}

  // connect(id){
  //   this.webSocketAPI._connect(id);
  // }
  //
  // sendMessage(){
  //   console.log()
  //   this.webSocketAPI._send("test");
  // }

  notif(){
    this.i = this.i+1
    this.notifier = true
    console.log(this.i)
  }

  handleMessage(message) : any{
    this.greeting = message;
    this.toastr.success(this.greeting.action.instruction, 'New Notification');
  }
  changeLang(lang) {
    this.translate.use(lang);
  }

  onLogout() {
    // this.webSocketAPI._disconnect();
    localStorage.removeItem('token');
    this.router.navigate(['/user/login']);
  }

}
