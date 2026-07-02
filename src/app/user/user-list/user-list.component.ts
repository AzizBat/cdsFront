import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/shared/user.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  rolee: string;

  Math = Math;

  organisation: any;

  roleOptions: Array<{ name: string; value: string }> = [
    { name: 'Admin', value: 'ROLE_ADMIN' },
    { name: 'Opérateur', value: 'ROLE_OPERATOR' },
    { name: 'Directeur qualité et RetD', value: 'ROLE_QUALITY_DIRECTOR' },
    {
      name: 'Responsable amélioration et projets qualité',
      value: 'ROLE_QUALITY_SUPERVISOR',
    },
    { name: 'Directeur Général ', value: 'ROLE_DG' },
    { name: 'Directeur Ressources humaines', value: 'ROLE_DRH' },
  ];
  pageOfItems: Array<User>;
  pageSize = 9;
  users: any;
  usersList: any;
  sub: Subscription;
  page!: number;
  ngbPaginationPage = 1;
  pageNumber = 0;
  load = false;
  currentRole: any;
  totalItems = 0;
  searchUser = '';
  userId: any;
  isAdmin;

  constructor(
    public service: UserService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): any {
    if (localStorage.getItem('token') == null) {
      this.router.navigateByUrl('/user/login');
    }
    const currentUser = localStorage.getItem('curUser');
    const id = JSON.parse(currentUser).organisationId;
    this.userId = JSON.parse(currentUser).id;
    this.isAdmin = JSON.parse(currentUser).roles.some(
      (role: any) => role.name === 'ROLE_ADMIN'
    );
    this.currentRole = JSON.parse(currentUser).roles[0].name;

    this.load = true;

    this.getUsers();
  }

  getUsers(page?: number, dontNavigate?: boolean): any {
    const pageToLoad: number = page || this.page || 1;
    this.sub = this.service
      .getUsers({
        page: pageToLoad - 1,
        size: 9,
        search: this.searchUser,
      })
      .subscribe(
        (res: HttpResponse<User[]>) => {
          this.onSuccess(res.body, res.headers, pageToLoad, !dontNavigate);
        },
        () => this.onError()
      );
  }

  protected onSuccess(
    data: User[] | null,
    headers: HttpHeaders,
    page: number,
    navigate: boolean
  ): void {
    this.page = page;
    if (navigate) {
      this.router.navigate(['/user/list'], {
        queryParams: {
          page: this.page,
          size: 9,
        },
      });
    }
    this.users = data || [];
    this.totalItems = this.users.totalElements;
    this.usersList = this.users.content;
    this.load = true;
  }

  protected onError(): void {
    console.log('error');
    this.ngbPaginationPage = this.page ?? 1;
  }

  loadPage(page?: number, dontNavigate?: boolean): void {
    const pageToLoad: number = page || this.page || 1;

    this.pageNumber = pageToLoad;

    this.service
      .getUsers({
        page: pageToLoad - 1,
        size: 9,
      })
      .subscribe(
        (res: HttpResponse<User[]>) =>
          this.onSuccess(res.body, res.headers, pageToLoad, !dontNavigate),
        () => this.onError()
      );
  }

  onLogout(): any {
    localStorage.removeItem('token');
    this.router.navigate(['/user/login']);
  }

  pageClick(pageOfItems: Array<User>): any {
    this.pageOfItems = pageOfItems;
  }

  getRole(role: string): any {
    const found = this.roleOptions.find((r) => r.value === role);
    if (found) {
      this.rolee = found.name;
    } else if (role === 'ROLE_ORGANIZER') {
      this.rolee = 'ORGANIZER';
    } else if (role === 'ROLE_AUDITOR') {
      this.rolee = 'AUDITOR';
    } else {
      this.rolee = role;
    }

    return this.rolee;
  }

  addUser(): any {
    this.router.navigate(['/user/add-edit']);
  }

  editUser(id: number): any {
    console.log(id);
    this.router.navigate(['/user/add-edit/' + id]);
  }

  changePassword(id: number): any {
    swal
      .fire({
        title: 'Vous êtes en train de changer le mot de passe',
        text: 'Etes-vous certain ?',
        icon: 'warning',
        confirmButtonColor: '#1BB192',
        showCancelButton: true,
        inputValidator: (value: string) => {
          return new Promise<string | null>((resolve) => {
            if (value !== undefined && value !== '') {
              resolve(null);
            } else {
              resolve('Veuillez entrer le nouveau mot de passe');
            }
          });
        },
      })
      .then((result) => {
        if (result.isConfirmed) {
          swal
            .fire({
              title: 'Changement mot de passe',
              text: 'Entrez le nouveau mot de passe',
              confirmButtonColor: '#1BB192',
              showCancelButton: true,
              input: 'password',
              inputValidator: (value: string) => {
                return new Promise<string | null>((resolve) => {
                  if (value !== undefined && value !== '') {
                    resolve(null);
                  } else {
                    resolve('Veuillez entrer le nouveau mot de passe');
                  }
                });
              },
            })
            .then((resultPassword) => {
              if (resultPassword.isConfirmed) {
                this.service.updatePassword(id, resultPassword.value).subscribe(
                  (res: any) => {
                    this.toastr.success('Mot de passe modifié!', 'Succès');
                  },
                  (err) => {
                    this.toastr.error('Erreur', 'Erreur.');
                  }
                );
              }
            });
        }
      });
  }

  deleteUser(id: number): any {
    console.log(id);
    this.service.archiveUser(id).subscribe((res) => {
      this.toastr.success('Empoyee archived successfully', 'EMP. Register');
      this.loadPage(this.pageNumber);
    });
  }

  activateUser(id: number): any {
    console.log(id);
    this.service.activateUser(id).subscribe((res) => {
      this.toastr.success('Empoyee restored successfully', 'EMP. Register');
      this.loadPage(this.pageNumber);
    });
  }

  search(): any {
    const search = document.getElementById('search') as HTMLInputElement;
    this.searchUser = search.value;
    this.getUsers(0);
  }
}
