import { Component, OnInit } from '@angular/core';
import { FormBuilder, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/shared/user.service';
import { HttpResponse } from '@angular/common/http';
import { User } from 'src/app/models/user.model';

type SelectableEntity = User;

@Component({
  selector: 'app-user-add-edit',
  templateUrl: './user-add-edit.component.html',
  styleUrls: ['./user-add-edit.component.scss'],
})
export class UserAddEditComponent implements OnInit {
  id: string;
  user: any;
  submitted = false;
  notSelected = false;
  creating = false;
  updating = false;
  checked = false;
  checked1 = false;
  hasEmail = true;
  audit = true;
  organisation: any;
  haveEmail = false;

  role = [
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
  organisationService: any;
  organisationFunction: any;

  formModel = this.formBuilder.group({
    id: [''],
    username: ['', [Validators.required, Validators.maxLength(25)]],
    roleName: [null, [Validators.required]],
    matricule: ['', [Validators.required]],
    email: [''],
    organisationsFunction: [null, [Validators.required]],
    organisationsService: [null, [Validators.required]],
    serviceCode: ['', [Validators.required]],
    hasEmail: [true],
  });

  constructor(
    private Activatedroute: ActivatedRoute,
    private router: Router,
    public service: UserService,
    private toast: ToastrService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('token') == null) {
      this.router.navigateByUrl('/user/login');
    }

    this.service.getAllOrganisationServices().subscribe((res) => {
      this.organisationService = res || [];
      this.organisationService = this.organisationService.body;
      const filteredList = this.organisationService.filter(
        (item) => item !== '-'
      );
      this.organisationService = filteredList;
    });

    this.service.getAllOrganisationFunctions().subscribe((res) => {
      this.organisationFunction = res || [];
      this.organisationFunction = this.organisationFunction.body;
      const filteredList = this.organisationFunction.filter(
        (item) => item !== '-'
      );
      this.organisationFunction = filteredList;
    });

    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id !== null) {
      this.updating = true;

      this.service
        .getUserWithPicture(this.id)
        .subscribe((res: HttpResponse<User>) => {
          (this.user = res.body || []), console.log(this.user);
          this.updateForm(this.user);
        });
    } else {
      this.creating = true;
    }
  }

  checkEmail(): void {
    const email = document.getElementById('mail') as HTMLElement;
    const role = document.getElementById('roleName') as HTMLSelectElement;
    const emailControl = this.formModel.get('email');

    if (role?.value !== 'ROLE_OPERATOR') {
      email.style.removeProperty('display');
      this.haveEmail = true;
      emailControl?.setValidators([Validators.required, Validators.email]);
    } else {
      email.style.display = 'none';
      this.haveEmail = false;
      emailControl?.clearValidators();
    }
    emailControl?.updateValueAndValidity();
  }

  updateForm(user: any): void {
    let role = { name: 'Opérateur', value: 'ROLE_OPERATOR' };
    if (user.userRole !== null) {
      for (let i = 0; i < this.role.length; i++) {
        if (this.role[i].value === user.userRole.name) {
          role = this.role[i];
        }
      }
    }
    this.formModel.patchValue({
      id: user.id,
      username: user.name,
      roleName: role,
      matricule: user.matricule,
      email: user.email,
      organisationsFunction: user.companyFunction,
      organisationsService: user.service,
      serviceCode: user.serviceCode,
      hasEmail: user.hasEmail,
    });
    this.checkEmail();
  }

  resetForm(form?: NgForm): void {
    if (form != null) {
      form.resetForm();
    }
    this.service.formDataReq = {
      id: 0,
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      roleName: 'ROLE_SUPERVISOR',
      rpiRoleName: '',
      archived: false,
      username: '',
      hasEmail: true,
      isEnabled: false,
    };
  }

  onSubmit(form: NgForm): void {
    this.submitted = true;

    // stop here if form is invalid
    // tslint:disable-next-line:max-line-length
    if (
      form.form.value.username === '' ||
      form.form.value.roleName === null ||
      form.form.value.matricule === '' ||
      form.form.value.organisationFunction === null ||
      form.form.value.organisationService === null ||
      form.form.value.serviceCode === '' ||
      (this.validateEmail(this.formModel.value.email) === false &&
        this.haveEmail === true)
    ) {
      return;
    }

    if (this.creating === true) {
      this.service.inviteUser(form.value).subscribe(
        (res: any) => {
          this.toast.success(
            'Invitation Sent Successfully!',
            'EMP successful.'
          );
          console.log(res);
          this.router.navigateByUrl('/user/list');
        },
        (err) => {
          this.toast.error('Error ', 'Invitation Sending failed.');
          console.log(err);
        }
      );
    } else {
      this.service.updateUser(form.value, this.id).subscribe(
        (res: any) => {
          this.toast.success(
            'Information updated Successfully!',
            'EMP successful.'
          );
          console.log(res);
          this.router.navigateByUrl('/user/list');
        },
        (err) => {
          this.toast.error('Error ', 'Information updating failed.');
          console.log(err);
        }
      );
    }
  }

  insertRecord(form: NgForm): void {
    this.service.inviteUser(form.form.value).subscribe(
      (_res) => {
        this.toast.success('Invitation Sent Successfully', 'EMP. Register');
        this.resetForm(form);
        this.service.refreshList();
        this.router.navigateByUrl('/user/list');
      },
      (err) => {
        this.toast.error('This email is already saved', 'EMP. Register');
        console.log(err);
      }
    );
  }

  public caracterOnlyValidator(event: any): void {
    const pattern = /^[a-zA-Z ]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(
        /[^a-zA-Z\-éèàùêâîïäë]/g,
        ''
      );
    }
  }

  public numbersOnlyValidator(event: any): any {
    const pattern = /^[0-9\-]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^0-9\-+()]/g, '');
    }
  }

  public validateEmail(value): boolean {
    if (this.checked === false) {
      const re = /\S+@\S+\.\S+/;
      if (!re.test(value)) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  previousState(): void {
    this.router.navigateByUrl('/user/list');
  }

  sorting(): void {
    const checkbox = document.getElementById('sort') as HTMLInputElement;
    if (checkbox.checked === true) {
      this.checked = true;
      this.hasEmail = false;
    } else {
      this.checked = false;
      this.hasEmail = true;
    }
  }

  sorting1(): void {
    const checkbox = document.getElementById('sort1') as HTMLInputElement;
    if (checkbox.checked === true) {
      this.checked1 = true;
      this.audit = false;
    } else {
      this.checked1 = false;
      this.audit = true;
    }
  }
}
