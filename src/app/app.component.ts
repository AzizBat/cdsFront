import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {NotificationsService} from './notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'FrontTest';
  webSocketAPI: NotificationsService;
  greeting: any;
  name: string;
  confirmAccount :boolean

  constructor( public router: Router) { }

  ngOnInit() {
    this.confirmAccount = false
    if(window.location.toString().indexOf('/auth/confirm-account') !== -1){
      // console.log("yes")
      this.confirmAccount = true
    }
  }

  connect(_id){
  }

  disconnect(){
    // console.log("feaefioh")
  }

  // sendMessage(){
  //   this.webSocketAPI._send("test");
  // }
}
