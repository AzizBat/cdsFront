import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/shared/user.service';
import { ToastrService } from 'ngx-toastr';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './validation.component.html',
  styleUrls: ['./validation.component.scss']
})
export class ValidationComponent implements OnInit {
  id:any

  constructor(public service: UserService, private router: Router,    private route: ActivatedRoute,
  private toastr: ToastrService) { }

  ngOnInit() {
    console.log(this.router.url)
    let c = '';
    let token = '';

    let verificator = false;
    for (let i = 0; i < this.router.url.length; i++) {
      c = this.router.url.charAt(i);
      if (c === '=') {
        for (let j = i+1; j < this.router.url.length; j++) {
          token = token.concat(this.router.url.charAt(j));
        }
      }
    }
    console.log(token)
  this.service.confirmAccount(token).subscribe(
    (_res: any) => {
      this.toastr.success('Information updated Successfully!', 'EMP successful.');
      console.log("done");
    })
  }

  goToSignIn(){
    this.router.navigate(['/user/login'])
  }


}
