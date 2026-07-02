import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuditService } from '../../shared/audit.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-audit-details',
  templateUrl: './audit-details.component.html',
  styleUrls: ['./audit-details.component.scss'],
})
export class AuditDetailsComponent implements OnInit {
  currentUser: any;
  requete: any;
  answers: any;
  withComment = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public auditService: AuditService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUser = localStorage.getItem('curUser');
    this.currentUser = JSON.parse(this.currentUser);
    const id = this.route.snapshot.paramMap.get('id');
    this.auditService.getEnquetebyId(Number(id)).subscribe((res) => {
      (this.requete = res.body || []),
        this.checkComment(this.requete),
        (this.answers = this.requete.requestAnswersList),
        this.answers.sort((a, b) => a.id - b.id);
    });
  }

  checkComment(requete): void {
    console.log(requete.comment);
    if (requete.comment !== null && requete.comment !== '') {
      this.withComment = true;
    }
    console.log(this.withComment);
  }

  goToAudit(): void {
    this.router.navigateByUrl('/audit');
  }

  action(status: string): void {
    let title = '';
    let text = '';
    let confirmButtonText = '';

    if (status === 'STARTED') {
      title = 'Prendre en charge cette requête ?';
      text = 'Vous allez commencer à traiter cette demande.';
      confirmButtonText = 'Oui, prendre en charge';
    } else if (status === 'FINISHED') {
      title = 'Terminer cette requête ?';
      text = 'Cette requête sera marquée comme terminée.';
      confirmButtonText = 'Oui, terminer';
    } else if (status === 'CANCELED') {
      title = 'Annuler cette requête ?';
      text = 'Cette requête sera marquée comme non satisfaite.';
      confirmButtonText = 'Oui, annuler';
    }

    Swal.fire({
      title: title,
      text: text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0d9488',
      cancelButtonColor: '#dc2626',
      confirmButtonText: confirmButtonText,
      cancelButtonText: 'Non, annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.auditService.changeStatus(this.requete.id, status).subscribe(
          (resp: any) => {
            this.toastr.success('Statut changé avec succès!', 'Succès'),
              (this.requete = resp || []);
          },
          (err) => {
            this.toastr.error('Erreur', 'Changement de statut échoué.');
          }
        );
      }
    });
  }

  saveComment(): void {
    const comment = document.getElementById('comment') as HTMLInputElement;
    console.log(comment.value);

    this.auditService.comment(this.requete.id, comment.value).subscribe(
      (resp: any) => {
        this.toastr.success('Comment saved successfully!', 'Successful.'),
          (this.requete = resp || []);
        this.withComment = true;
      },
      (err) => {
        this.toastr.error('Error ', 'Save comment failed.');
      }
    );
  }

  updateComment(): void {
    this.withComment = false;
  }
}
