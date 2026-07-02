import {AppComponent} from './app.component';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {HeaderComponent} from "./components/header/header.component";

export class NotificationsService {
  // webSocketEndPoint = 'https://backend.cipa-web.com/notification';
  // topic = '/queue/';
  // stompClient: any;
  // appComponent: AppComponent;
  // headerComponent: HeaderComponent;
  // id :any
  // constructor(headerComponent: HeaderComponent,){
  //   this.headerComponent = headerComponent;
  // }
  // _connect(id) {
  //   // console.log('Initialize WebSocket Connection');
  //   const ws = new SockJS(this.webSocketEndPoint);
  //   this.stompClient = Stomp.over(ws);
  //
  //   //Activate it for debug in console
  //   this.stompClient.debug = null
  //
  //
  //   const _this = this;
  //   this.id = id
  //   _this.stompClient.connect({}, function(_frame) {
  //     _this.stompClient.subscribe(_this.topic +id, function(sdkEvent) {
  //       _this.onMessageReceived(sdkEvent);
  //     });
  //   }, this.errorCallBack);
  // }
  //
  // _disconnect() {
  //   // console.log(this.stompClient)
  //   if (this.stompClient !== null) {
  //     this.stompClient.disconnect();
  //   }
  //   // console.log('Disconnected');
  // }
  //
  // // on error, schedule a reconnection attempt
  // errorCallBack(error) {
  //   // console.log('errorCallBack -> ' + error);
  //   setTimeout(() => {
  //     this._connect(this.id);
  //   }, 5000);
  // }
  //
  //
  // // _send(message) {
  // //   console.log('calling logout api via web socket');
  // //   this.stompClient.send('/app/hello', {}, JSON.stringify({
  // //     "instruction": "instruction 1",
  // //     "deadline": "2022-02-18 12:00:00",
  // //     "auditResponseId": 988,
  // //     "affectedUser": 3
  // //   }));
  // // }
  //
  // _send(message) {
  //   // console.log('calling logout api via web socket');
  //   this.stompClient.send('/app/hello', {}, JSON.stringify(message));
  // }
  //
  // onMessageReceived(message) {
  //   // console.log(JSON.parse(message.body))
  //   this.headerComponent.handleMessage(JSON.parse(message.body));
  // }
}
