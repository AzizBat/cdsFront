import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RedTagService } from '../shared/redTag.service';

@Component({
  selector: 'app-red-tag',
  templateUrl: './red-tag.component.html',
  styles: [
  ]
})
export class RedTagComponent implements OnInit {

  constructor(public service: RedTagService, private router: Router) { }

   ngOnInit() {
    
    this.service.refreshList();
    console.log('tokennn ' +localStorage.getItem('token'));
  }


  onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/user/login']);
  }

}
