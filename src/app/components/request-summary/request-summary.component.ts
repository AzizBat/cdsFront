import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface SummaryRow {
  label: string;
  value: string;
  type?: 'text' | 'image';
  alt?: string;
}

@Component({
  selector: 'app-request-summary',
  templateUrl: './request-summary.component.html',
  styleUrls: ['./request-summary.component.css']
})
export class RequestSummaryComponent {
  @Input() title = '';
  @Input() rows: SummaryRow[] = [];
  @Input() confirmLabel = 'Confirmer';
  @Input() cancelLabel = 'Annuler';
  @Input() referenceCode = '';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
