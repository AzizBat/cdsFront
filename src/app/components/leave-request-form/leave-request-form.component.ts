import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import {
  AbsenceRequestCreateDto,
  DocumentRequestCreateDto,
  DocumentType,
  LeaveRequestCreateDto,
  PayslipMonthYearSelectionDto,
  SalaryAdvanceCreateDto,
  WorkCertificateReason
} from '../../models/personal-request.dto';
import { PersonalRequestService } from '../../services/personal-request.service';
import { SummaryRow } from '../request-summary/request-summary.component';

@Component({
  selector: 'app-leave-request-form',
  templateUrl: './leave-request-form.component.html',
  styleUrls: ['./leave-request-form.component.css']
})
export class LeaveRequestFormComponent implements OnInit, OnChanges, OnDestroy {
  readonly documentTypeEnum = DocumentType;
  @Input() user: any;
  @Input() requestTitleKey = 'home.leaveRequest';
  @Output() backToPersonalCards = new EventEmitter<void>();

  leaveForm!: FormGroup;
  showSummary = false;
  showPopup = false;
  isSubmitting = false;
  submissionErrorMessage = '';
  invalidRange = false;
  invalidAbsenceTimeRange = false;
  readonly amountKeypadDigits: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  readonly attestationDocumentTypeOptions = [
    {
      value: DocumentType.ATTESTATION_SALAIRE,
      label: 'Attestation de salaire',
      subtitle: 'Document standard'
    },
    {
      value: DocumentType.ATTESTATION_TRAVAIL,
      label: 'Attestation de travail',
      subtitle: 'Motif obligatoire'
    },
    {
      value: DocumentType.ATTESTATION_BENEFICE_PRET,
      label: 'Attestation de benefice de pret',
      subtitle: 'Document standard'
    },
    {
      value: DocumentType.ATTESTATION_NON_BENEFICE_PRET,
      label: 'Attestation de non benefice de pret',
      subtitle: 'Document standard'
    },
    {
      value: DocumentType.CERTIFICAT_RETENUE,
      label: 'Certificat de retenue',
      subtitle: 'Selection multiple d annees'
    },
    {
      value: DocumentType.COPIE_FICHE_PAIE,
      label: 'Copie fiche de paie',
      subtitle: 'Selection multiple mois/annee'
    }
  ];
  readonly monthOptions = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Fevrier' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Aout' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Decembre' }
  ];
  readonly workReasonOptions = [
    { value: WorkCertificateReason.CIN_RENEWAL, label: 'Pour renouvellement de CIN' },
    { value: WorkCertificateReason.OTHER, label: 'Autre motif' }
  ];
  readonly yearOptions = this.buildYearOptions();
  selectedAttestationDocumentTypes: DocumentType[] = [];
  selectedWorkReasons: WorkCertificateReason[] = [];
  selectedRetenueYears: number[] = [];
  selectedPayslipMonths: PayslipMonthYearSelectionDto[] = [];
  activePayslipYear: number = this.yearOptions[0];
  workOtherReasonText = '';
  attestationStep: 'selection' | 'details' = 'selection';
  attestationInfoDocumentStepIndex = 0;
  private pageScrollLocked = false;

  get absenceStartMinTime(): string {
    const selectedDate = this.leaveForm?.get('absenceDate')?.value;
    if (!selectedDate || selectedDate !== this.getTodayInputDate()) {
      return '00:00';
    }

    const now = new Date();
    let hour = now.getHours();
    if (now.getMinutes() > 0 || now.getSeconds() > 0) {
      hour += 1;
    }

    if (hour >= 24) {
      return '24:00';
    }

    if (hour >= 23) {
      return '23:00';
    }

    return `${String(hour).padStart(2, '0')}:00`;
  }

  get absenceEndMinTime(): string {
    const startTime = this.leaveForm?.get('absenceStartTime')?.value;
    if (!startTime) {
      return '24:00';
    }

    return this.addHoursToTime(startTime, 1);
  }

  get absenceStartClockMin(): string {
    if (this.absenceStartMinTime === '24:00') {
      return '23:59';
    }

    return this.absenceStartMinTime;
  }

  get absenceStartClockMin12(): string {
    return this.to12HourLabel(this.absenceStartClockMin);
  }

  get absenceEndClockMin(): string {
    if (this.absenceEndMinTime === '24:00') {
      return '23:59';
    }

    return this.absenceEndMinTime;
  }

  get absenceEndClockMin12(): string {
    return this.to12HourLabel(this.absenceEndClockMin);
  }

  get isAbsenceStartSelectionDisabled(): boolean {
    return this.timeToMinutes(this.absenceStartMinTime) >= (24 * 60);
  }

  get isAbsenceEndSelectionDisabled(): boolean {
    if (!this.leaveForm?.get('absenceStartTime')?.value) {
      return true;
    }

    return this.timeToMinutes(this.absenceEndMinTime) >= (24 * 60);
  }

  get isAbsenceRequest(): boolean {
    return this.requestTitleKey === 'home.absenceRequest';
  }

  get isAdvanceSalaryRequest(): boolean {
    return this.requestTitleKey === 'home.advanceSalary';
  }

  get isAttestationRequest(): boolean {
    return this.requestTitleKey === 'home.attestationsCertificates';
  }

  get isLeaveRequest(): boolean {
    return this.requestTitleKey === 'home.leaveRequest';
  }

  get isAttestationSelectionStep(): boolean {
    return this.isAttestationRequest && this.attestationStep === 'selection';
  }

  get isAttestationDetailsStep(): boolean {
    return this.isAttestationRequest && this.attestationStep === 'details';
  }

  get requiredInfoDocumentTypes(): DocumentType[] {
    return this.selectedAttestationDocumentTypes.filter((documentType) => (
      documentType === DocumentType.ATTESTATION_TRAVAIL
      || documentType === DocumentType.CERTIFICAT_RETENUE
      || documentType === DocumentType.COPIE_FICHE_PAIE
    ));
  }

  get hasAttestationInfoStep(): boolean {
    return this.requiredInfoDocumentTypes.length > 0;
  }

  get currentInfoDocumentType(): DocumentType | null {
    if (!this.requiredInfoDocumentTypes.length) {
      return null;
    }

    const maxIndex = this.requiredInfoDocumentTypes.length - 1;
    const safeIndex = Math.min(this.attestationInfoDocumentStepIndex, maxIndex);
    return this.requiredInfoDocumentTypes[safeIndex] || null;
  }

  get hasNextInfoDocumentStep(): boolean {
    return this.attestationInfoDocumentStepIndex < (this.requiredInfoDocumentTypes.length - 1);
  }

  get attestationPrimaryLabel(): string {
    if (this.isAttestationSelectionStep) {
      return this.hasAttestationInfoStep ? 'Suivant' : 'Continuer';
    }

    return this.hasNextInfoDocumentStep ? 'Suivant' : 'Continuer';
  }

  get attestationSecondaryLabel(): string {
    if (!this.isAttestationDetailsStep) {
      return 'Annuler';
    }

    return this.attestationInfoDocumentStepIndex > 0 ? 'Precedent' : 'Retour';
  }

  get hasSelectedAttestationDocuments(): boolean {
    return this.selectedAttestationDocumentTypes.length > 0;
  }

  get isWorkAttestationSelected(): boolean {
    return this.isDocumentSelected(DocumentType.ATTESTATION_TRAVAIL);
  }

  get isRetenueSelected(): boolean {
    return this.isDocumentSelected(DocumentType.CERTIFICAT_RETENUE);
  }

  get isPayslipCopySelected(): boolean {
    return this.isDocumentSelected(DocumentType.COPIE_FICHE_PAIE);
  }

  get isWorkAttestationOtherSelected(): boolean {
    return this.isWorkReasonSelected(WorkCertificateReason.OTHER);
  }

  get selectedAttestationDocumentsSummary(): string {
    if (!this.selectedAttestationDocumentTypes.length) {
      return '-';
    }

    return this.selectedAttestationDocumentTypes
      .map((docType) => this.getDocumentLabel(docType))
      .join(', ');
  }

  get advanceAmountDisplay(): string {
    const value = this.leaveForm?.get('amount')?.value;
    if (value === null || value === undefined || value === '') {
      return '';
    }

    return `${value} TND`;
  }

  get hasAdvanceAmountValue(): boolean {
    return this.advanceAmountDisplay.length > 0;
  }

  constructor(private fb: FormBuilder, private personalRequestService: PersonalRequestService) {}

  ngOnInit(): void {
    this.leaveForm = this.fb.group({
      matricule: [{ value: '', disabled: true }, Validators.required],
      fullName: [{ value: '', disabled: true }, Validators.required],
      amount: [null],
      duration: [1, [Validators.required, Validators.min(1)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      absenceDate: [''],
      absenceStartTime: [''],
      absenceEndTime: [''],
      motif: ['', [Validators.required]]
    });

    this.resetAttestationSelections();
    this.patchUserDefaults();
    this.configureFormByRequestType();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.leaveForm) {
      this.patchUserDefaults();
    }

    if (changes['requestTitleKey'] && this.leaveForm) {
      this.configureFormByRequestType();
    }
  }

  ngOnDestroy(): void {
    this.togglePageScroll(false);
  }

  get summaryRows(): SummaryRow[] {
    const raw = this.leaveForm.getRawValue();

    if (this.isAttestationRequest) {
      const payload = this.buildDocumentRequestsPayload(this.normalizeOptionalText(raw.motif));
      const rows: SummaryRow[] = [
        { label: 'Matricule', value: raw.matricule || '-' },
        { label: 'Nom et prenom', value: raw.fullName || '-' },
        { label: 'Documents selectionnes', value: this.selectedAttestationDocumentsSummary },
        { label: 'Nombre de demandes', value: String(payload.length) }
      ];

      payload.forEach((documentRequest, index) => {
        rows.push({
          label: `Document ${index + 1}`,
          value: this.formatDocumentRequestSummary(documentRequest)
        });
      });

      return rows;
    }

    if (this.isAdvanceSalaryRequest) {
      return [
        { label: 'Matricule', value: raw.matricule || '-' },
        { label: 'Nom et prenom', value: raw.fullName || '-' },
        { label: 'Montant', value: raw.amount ? `${raw.amount} TND` : '-' },
        { label: 'Motif', value: raw.motif || '-' }
      ];
    }

    if (this.isAbsenceRequest) {
      return [
        { label: 'Matricule', value: raw.matricule || '-' },
        { label: 'Nom et prenom', value: raw.fullName || '-' },
        { label: 'Date', value: this.formatDisplayDate(raw.absenceDate) },
        { label: 'De', value: this.formatDisplayTime(raw.absenceStartTime) },
        { label: 'A', value: this.formatDisplayTime(raw.absenceEndTime) },
        { label: 'Motif', value: raw.motif || '-' }
      ];
    }

    return [
      { label: 'Matricule', value: raw.matricule || '-' },
      { label: 'Nom et prenom', value: raw.fullName || '-' },
      { label: 'Duree', value: `${raw.duration || 0} jour(s)` },
      { label: 'De', value: this.formatDisplayDate(raw.startDate) },
      { label: 'A', value: this.formatDisplayDate(raw.endDate) },
      { label: 'Motif', value: raw.motif || '-' }
    ];
  }

  onStartDateChange(): void {
    const startDate = this.leaveForm.get('startDate')?.value;
    const duration = Number(this.leaveForm.get('duration')?.value);
    const endDate = this.leaveForm.get('endDate')?.value;

    if (startDate && duration > 0) {
      this.syncEndDateFromDuration();
      return;
    }

    if (startDate && endDate) {
      this.syncDurationFromDates();
    }
  }

  onEndDateChange(): void {
    this.syncDurationFromDates();
  }

  onDurationChange(): void {
    this.syncEndDateFromDuration();
  }

  onAbsenceDateChange(): void {
    this.invalidAbsenceTimeRange = false;
    this.coerceAbsenceTimesToMinBounds();
  }

  onAbsenceStartTimeChange(): void {
    this.invalidAbsenceTimeRange = false;
    this.coerceAbsenceTimesToMinBounds();
  }

  onAbsenceStartTimeSet(selectedTime: string): void {
    this.normalizeAbsenceTimeControlTo24h('absenceStartTime', selectedTime);
    this.onAbsenceStartTimeChange();
  }

  onAbsenceEndTimeChange(): void {
    this.invalidAbsenceTimeRange = false;
    this.coerceAbsenceTimesToMinBounds();
  }

  onAbsenceEndTimeSet(selectedTime: string): void {
    this.normalizeAbsenceTimeControlTo24h('absenceEndTime', selectedTime);
    this.onAbsenceEndTimeChange();
  }

  toggleAttestationDocumentType(documentType: DocumentType): void {
    const isSelected = this.selectedAttestationDocumentTypes.includes(documentType);

    if (isSelected) {
      this.selectedAttestationDocumentTypes = this.selectedAttestationDocumentTypes
        .filter((current) => current !== documentType);
    } else {
      this.selectedAttestationDocumentTypes = [...this.selectedAttestationDocumentTypes, documentType];
    }

    this.submissionErrorMessage = '';

    if (!this.isDocumentSelected(DocumentType.ATTESTATION_TRAVAIL)) {
      this.selectedWorkReasons = [];
      this.workOtherReasonText = '';
    }

    if (!this.isDocumentSelected(DocumentType.CERTIFICAT_RETENUE)) {
      this.selectedRetenueYears = [];
    }

    if (!this.isDocumentSelected(DocumentType.COPIE_FICHE_PAIE)) {
      this.selectedPayslipMonths = [];
    }

    const maxIndex = Math.max(this.requiredInfoDocumentTypes.length - 1, 0);
    this.attestationInfoDocumentStepIndex = Math.min(this.attestationInfoDocumentStepIndex, maxIndex);
  }

  onAttestationNextStep(): void {
    this.submissionErrorMessage = '';

    if (!this.selectedAttestationDocumentTypes.length) {
      this.submissionErrorMessage = 'Veuillez selectionner au moins un document.';
      return;
    }

    if (this.isAttestationSelectionStep) {
      if (!this.hasAttestationInfoStep) {
        this.showSummary = true;
        this.togglePageScroll(true);
        return;
      }

      this.attestationStep = 'details';
      this.attestationInfoDocumentStepIndex = 0;
      return;
    }

    if (!this.isAttestationDetailsStep) {
      return;
    }

    const currentStepValidationMessage = this.getCurrentInfoStepValidationMessage();
    if (currentStepValidationMessage) {
      this.submissionErrorMessage = currentStepValidationMessage;
      return;
    }

    if (this.hasNextInfoDocumentStep) {
      this.attestationInfoDocumentStepIndex += 1;
      return;
    }

    const attestationValidationMessage = this.getAttestationValidationMessage();
    if (attestationValidationMessage) {
      this.submissionErrorMessage = attestationValidationMessage;
      return;
    }

    this.showSummary = true;
    this.togglePageScroll(true);
  }

  onAttestationBackToSelection(): void {
    this.submissionErrorMessage = '';

    if (!this.isAttestationDetailsStep) {
      this.onCancel();
      return;
    }

    if (this.attestationInfoDocumentStepIndex > 0) {
      this.attestationInfoDocumentStepIndex -= 1;
      return;
    }

    this.attestationStep = 'selection';
  }

  toggleWorkAttestationReason(reason: WorkCertificateReason): void {
    if (this.isWorkReasonSelected(reason)) {
      this.selectedWorkReasons = this.selectedWorkReasons.filter((current) => current !== reason);
    } else {
      this.selectedWorkReasons = [...this.selectedWorkReasons, reason];
    }

    if (!this.isWorkReasonSelected(WorkCertificateReason.OTHER)) {
      this.workOtherReasonText = '';
    }

    this.submissionErrorMessage = '';
  }

  toggleRetenueYear(year: number): void {
    if (this.selectedRetenueYears.includes(year)) {
      this.selectedRetenueYears = this.selectedRetenueYears.filter((current) => current !== year);
    } else {
      this.selectedRetenueYears = [...this.selectedRetenueYears, year].sort((a, b) => a - b);
    }

    this.submissionErrorMessage = '';
  }

  setActivePayslipYear(year: number): void {
    this.activePayslipYear = year;
  }

  togglePayslipMonth(month: number): void {
    const year = this.activePayslipYear;
    const existingIndex = this.selectedPayslipMonths.findIndex(
      (selection) => selection.year === year && selection.month === month
    );

    if (existingIndex >= 0) {
      this.selectedPayslipMonths = this.selectedPayslipMonths.filter(
        (selection) => !(selection.year === year && selection.month === month)
      );
    } else {
      this.selectedPayslipMonths = [...this.selectedPayslipMonths, { year, month }];
    }

    this.selectedPayslipMonths = this.sortPayslipSelections(this.selectedPayslipMonths);
    this.submissionErrorMessage = '';
  }

  removePayslipMonth(selection: PayslipMonthYearSelectionDto): void {
    this.selectedPayslipMonths = this.selectedPayslipMonths.filter(
      (current) => !(current.year === selection.year && current.month === selection.month)
    );
  }

  isDocumentSelected(documentType: DocumentType): boolean {
    return this.selectedAttestationDocumentTypes.includes(documentType);
  }

  isWorkReasonSelected(reason: WorkCertificateReason): boolean {
    return this.selectedWorkReasons.includes(reason);
  }

  isRetenueYearSelected(year: number): boolean {
    return this.selectedRetenueYears.includes(year);
  }

  isPayslipMonthSelected(year: number, month: number): boolean {
    return this.selectedPayslipMonths.some((selection) => selection.year === year && selection.month === month);
  }

  onAdvanceAmountDigit(digit: number): void {
    if (!this.isAdvanceSalaryRequest) {
      return;
    }

    const amountControl = this.leaveForm.get('amount');
    const current = String(amountControl?.value ?? '').replace(/\D/g, '');
    const next = current ? `${current}${digit}` : String(digit);
    amountControl?.setValue(Number(next), { emitEvent: false });
    amountControl?.markAsDirty();
    amountControl?.updateValueAndValidity({ emitEvent: false });
  }

  onAdvanceAmountDelete(): void {
    if (!this.isAdvanceSalaryRequest) {
      return;
    }

    const amountControl = this.leaveForm.get('amount');
    const current = String(amountControl?.value ?? '').replace(/\D/g, '');
    const next = current.slice(0, -1);

    if (!next) {
      amountControl?.setValue(null, { emitEvent: false });
    } else {
      amountControl?.setValue(Number(next), { emitEvent: false });
    }

    amountControl?.markAsDirty();
    amountControl?.updateValueAndValidity({ emitEvent: false });
  }

  onContinue(): void {
    this.invalidRange = false;
    this.invalidAbsenceTimeRange = false;
    this.submissionErrorMessage = '';

    if (this.isAttestationSelectionStep) {
      this.onAttestationNextStep();
      return;
    }

    if (this.isAbsenceRequest) {
      this.normalizeAbsenceTimeControlTo24h('absenceStartTime');
      this.normalizeAbsenceTimeControlTo24h('absenceEndTime');
    }

    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
    }

    if (this.isAttestationRequest) {
      const attestationValidationMessage = this.getAttestationValidationMessage();
      if (attestationValidationMessage) {
        this.submissionErrorMessage = attestationValidationMessage;
        return;
      }
    }

    if (this.isAbsenceRequest) {
      this.invalidAbsenceTimeRange = !this.isValidAbsenceTimeRange();
      if (this.invalidAbsenceTimeRange) {
        return;
      }
    } else if (this.isLeaveRequest) {
      this.syncDurationFromDates();
      if (this.invalidRange) {
        return;
      }
    }

    this.showSummary = true;
    this.togglePageScroll(true);
  }

  onCancel(): void {
    this.showSummary = false;
    this.showPopup = false;
    this.isSubmitting = false;
    this.submissionErrorMessage = '';
    this.invalidRange = false;
    this.invalidAbsenceTimeRange = false;
    this.togglePageScroll(false);

    this.leaveForm.reset({
      amount: null,
      duration: 1,
      startDate: '',
      endDate: '',
      absenceDate: this.isAbsenceRequest ? this.getTodayInputDate() : '',
      absenceStartTime: '',
      absenceEndTime: '',
      motif: ''
    });

    this.resetAttestationSelections();
    this.patchUserDefaults();
  }

  onConfirmSummary(): void {
    if (this.isSubmitting) {
      return;
    }

    this.submissionErrorMessage = '';

    if (this.isLeaveRequest) {
      this.submitLeaveRequest();
      return;
    }

    if (this.isAbsenceRequest) {
      this.submitAbsenceRequest();
      return;
    }

    if (this.isAdvanceSalaryRequest) {
      this.submitSalaryAdvanceRequest();
      return;
    }

    if (this.isAttestationRequest) {
      this.submitAttestationOrCertificateRequest();
      return;
    }

    this.showPopup = true;
  }

  onEditSummary(): void {
    this.showSummary = false;
    this.showPopup = false;
    this.submissionErrorMessage = '';
    this.togglePageScroll(false);
  }

  onPopupYes(): void {
    this.showPopup = false;
    this.submissionErrorMessage = '';
    this.onCancel();
    this.backToPersonalCards.emit();
  }

  onPopupDisconnect(): void {
    this.showPopup = false;
    this.submissionErrorMessage = '';
    this.togglePageScroll(false);
    location.reload();
  }

  private submitLeaveRequest(): void {
    const raw = this.leaveForm.getRawValue();
    const payload: LeaveRequestCreateDto = {
      reason: String(raw.motif || '').trim(),
      duration: Number(raw.duration),
      startDate: String(raw.startDate || ''),
      endDate: String(raw.endDate || '')
    };

    this.isSubmitting = true;
    this.personalRequestService
      .createLeaveRequest(payload)
      .pipe(finalize(() => {
        this.isSubmitting = false;
      }))
      .subscribe({
        next: () => {
          this.showPopup = true;
        },
        error: (error) => {
          console.error('Leave request submit failed', error);
          this.submissionErrorMessage = 'Echec de l envoi de la demande de conge. Veuillez reessayer.';
        }
      });
  }

  private submitAbsenceRequest(): void {
    const raw = this.leaveForm.getRawValue();
    const payload: AbsenceRequestCreateDto = {
      reason: String(raw.motif || '').trim(),
      date: String(raw.absenceDate || ''),
      startTime: String(raw.absenceStartTime || ''),
      endTime: String(raw.absenceEndTime || '')
    };

    this.isSubmitting = true;
    this.personalRequestService
      .createAbsenceRequest(payload)
      .pipe(finalize(() => {
        this.isSubmitting = false;
      }))
      .subscribe({
        next: () => {
          this.showPopup = true;
        },
        error: (error) => {
          console.error('Absence request submit failed', error);
          this.submissionErrorMessage = 'Echec de l envoi de la demande d absence. Veuillez reessayer.';
        }
      });
  }

  private submitSalaryAdvanceRequest(): void {
    const raw = this.leaveForm.getRawValue();
    const payload: SalaryAdvanceCreateDto = {
      reason: String(raw.motif || '').trim(),
      amount: Number(raw.amount || 0)
    };

    this.isSubmitting = true;
    this.personalRequestService
      .createSalaryAdvanceRequest(payload)
      .pipe(finalize(() => {
        this.isSubmitting = false;
      }))
      .subscribe({
        next: () => {
          this.showPopup = true;
        },
        error: (error) => {
          console.error('Salary advance request submit failed', error);
          this.submissionErrorMessage = 'Echec de l envoi de la demande d avance sur salaire. Veuillez reessayer.';
        }
      });
  }

  private submitAttestationOrCertificateRequest(): void {
    const raw = this.leaveForm.getRawValue();
    const optionalReason = this.normalizeOptionalText(raw.motif);

    const validationMessage = this.getAttestationValidationMessage();
    if (validationMessage) {
      this.submissionErrorMessage = validationMessage;
      return;
    }

    const payload = this.buildDocumentRequestsPayload(optionalReason);
    if (!payload.length) {
      this.submissionErrorMessage = 'Veuillez selectionner au moins un document.';
      return;
    }

    this.isSubmitting = true;
    this.personalRequestService
      .createMultipleDocumentRequests(payload)
      .pipe(finalize(() => {
        this.isSubmitting = false;
      }))
      .subscribe({
        next: () => {
          this.showPopup = true;
        },
        error: (error) => {
          console.error('Document request submit failed', error);
          this.submissionErrorMessage = 'Echec de l envoi de la demande de document. Veuillez reessayer.';
        }
      });
  }

  private normalizeOptionalText(value: unknown): string | null {
    const normalized = String(value || '').trim();
    return normalized ? normalized : null;
  }

  private togglePageScroll(lock: boolean): void {
    if (this.pageScrollLocked === lock) {
      return;
    }

    this.pageScrollLocked = lock;
    const overflow = lock ? 'hidden' : '';
    document.body.style.overflow = overflow;
    document.documentElement.style.overflow = overflow;
  }

  private patchUserDefaults(): void {
    if (!this.leaveForm) {
      return;
    }

    const matricule = this.user?.matricule ? String(this.user.matricule) : '';
    const fullName = this.user?.name ? String(this.user.name) : '';

    this.leaveForm.patchValue({
      matricule,
      fullName
    }, { emitEvent: false });
  }

  private configureFormByRequestType(): void {
    if (!this.leaveForm) {
      return;
    }

    const amountControl = this.leaveForm.get('amount');
    const motifControl = this.leaveForm.get('motif');
    const durationControl = this.leaveForm.get('duration');
    const startDateControl = this.leaveForm.get('startDate');
    const endDateControl = this.leaveForm.get('endDate');
    const absenceDateControl = this.leaveForm.get('absenceDate');
    const absenceStartTimeControl = this.leaveForm.get('absenceStartTime');
    const absenceEndTimeControl = this.leaveForm.get('absenceEndTime');

    if (this.isAttestationRequest) {
      amountControl?.clearValidators();
      amountControl?.setValue(null, { emitEvent: false });
      motifControl?.clearValidators();

      durationControl?.clearValidators();
      startDateControl?.clearValidators();
      endDateControl?.clearValidators();
      absenceDateControl?.clearValidators();
      absenceStartTimeControl?.clearValidators();
      absenceEndTimeControl?.clearValidators();

      durationControl?.setValue(1, { emitEvent: false });
      startDateControl?.setValue('', { emitEvent: false });
      endDateControl?.setValue('', { emitEvent: false });
      absenceDateControl?.setValue('', { emitEvent: false });
      absenceStartTimeControl?.setValue('', { emitEvent: false });
      absenceEndTimeControl?.setValue('', { emitEvent: false });
      motifControl?.setValue('', { emitEvent: false });

      this.resetAttestationSelections();
      this.invalidAbsenceTimeRange = false;
    } else if (this.isAdvanceSalaryRequest) {
      amountControl?.setValidators([Validators.required, Validators.min(1)]);
      motifControl?.setValidators([Validators.required]);

      durationControl?.clearValidators();
      startDateControl?.clearValidators();
      endDateControl?.clearValidators();
      absenceDateControl?.clearValidators();
      absenceStartTimeControl?.clearValidators();
      absenceEndTimeControl?.clearValidators();

      durationControl?.setValue(1, { emitEvent: false });
      startDateControl?.setValue('', { emitEvent: false });
      endDateControl?.setValue('', { emitEvent: false });
      absenceDateControl?.setValue('', { emitEvent: false });
      absenceStartTimeControl?.setValue('', { emitEvent: false });
      absenceEndTimeControl?.setValue('', { emitEvent: false });
      this.resetAttestationSelections();

      this.invalidAbsenceTimeRange = false;
    } else if (this.isAbsenceRequest) {
      amountControl?.clearValidators();
      amountControl?.setValue(null, { emitEvent: false });
      motifControl?.setValidators([Validators.required]);

      durationControl?.clearValidators();
      startDateControl?.clearValidators();
      endDateControl?.clearValidators();
      absenceDateControl?.setValidators([Validators.required]);
      absenceStartTimeControl?.setValidators([Validators.required]);
      absenceEndTimeControl?.setValidators([Validators.required]);

      startDateControl?.setValue('', { emitEvent: false });
      endDateControl?.setValue('', { emitEvent: false });
      if (!absenceDateControl?.value) {
        absenceDateControl?.setValue(this.getTodayInputDate(), { emitEvent: false });
      }
      absenceStartTimeControl?.setValue('', { emitEvent: false });
      absenceEndTimeControl?.setValue('', { emitEvent: false });
      this.resetAttestationSelections();
    } else {
      amountControl?.clearValidators();
      amountControl?.setValue(null, { emitEvent: false });
      motifControl?.setValidators([Validators.required]);

      durationControl?.setValidators([Validators.required, Validators.min(1)]);
      startDateControl?.setValidators([Validators.required]);
      endDateControl?.setValidators([Validators.required]);
      absenceDateControl?.clearValidators();
      absenceStartTimeControl?.clearValidators();
      absenceEndTimeControl?.clearValidators();

      absenceDateControl?.setValue('', { emitEvent: false });
      absenceStartTimeControl?.setValue('', { emitEvent: false });
      absenceEndTimeControl?.setValue('', { emitEvent: false });
      this.resetAttestationSelections();
    }

    amountControl?.updateValueAndValidity({ emitEvent: false });
    motifControl?.updateValueAndValidity({ emitEvent: false });
    durationControl?.updateValueAndValidity({ emitEvent: false });
    startDateControl?.updateValueAndValidity({ emitEvent: false });
    endDateControl?.updateValueAndValidity({ emitEvent: false });
    absenceDateControl?.updateValueAndValidity({ emitEvent: false });
    absenceStartTimeControl?.updateValueAndValidity({ emitEvent: false });
    absenceEndTimeControl?.updateValueAndValidity({ emitEvent: false });

    if (this.isAbsenceRequest) {
      this.coerceAbsenceTimesToMinBounds();
    }
  }

  private getAttestationValidationMessage(): string {
    if (!this.selectedAttestationDocumentTypes.length) {
      return 'Veuillez selectionner au moins un document.';
    }

    if (this.isWorkAttestationSelected && !this.selectedWorkReasons.length) {
      return 'Selectionnez au moins un motif pour l attestation de travail.';
    }

    if (this.isWorkAttestationOtherSelected && !this.normalizeOptionalText(this.workOtherReasonText)) {
      return 'Veuillez preciser le motif "Autre" pour l attestation de travail.';
    }

    if (this.isRetenueSelected && !this.selectedRetenueYears.length) {
      return 'Selectionnez au moins une annee pour le certificat de retenue.';
    }

    if (this.isPayslipCopySelected && !this.selectedPayslipMonths.length) {
      return 'Selectionnez au moins un mois/annee pour la copie fiche de paie.';
    }

    return '';
  }

  private getCurrentInfoStepValidationMessage(): string {
    const currentDocumentType = this.currentInfoDocumentType;
    if (!currentDocumentType) {
      return '';
    }

    if (currentDocumentType === DocumentType.ATTESTATION_TRAVAIL) {
      if (!this.selectedWorkReasons.length) {
        return 'Selectionnez au moins un motif pour l attestation de travail.';
      }

      if (this.isWorkAttestationOtherSelected && !this.normalizeOptionalText(this.workOtherReasonText)) {
        return 'Veuillez preciser le motif "Autre" pour l attestation de travail.';
      }

      return '';
    }

    if (currentDocumentType === DocumentType.CERTIFICAT_RETENUE) {
      return this.selectedRetenueYears.length
        ? ''
        : 'Selectionnez au moins une annee pour le certificat de retenue.';
    }

    if (currentDocumentType === DocumentType.COPIE_FICHE_PAIE) {
      return this.selectedPayslipMonths.length
        ? ''
        : 'Selectionnez au moins un mois/annee pour la copie fiche de paie.';
    }

    return '';
  }

  private buildDocumentRequestsPayload(optionalReason: string | null): DocumentRequestCreateDto[] {
    const payload: DocumentRequestCreateDto[] = [];

    this.selectedAttestationDocumentTypes.forEach((documentType) => {
      if (documentType === DocumentType.ATTESTATION_TRAVAIL) {
        this.selectedWorkReasons.forEach((workReason) => {
          payload.push({
            documentType: DocumentType.ATTESTATION_TRAVAIL,
            workCertificateReason: workReason,
            otherWorkCertificateReason: workReason === WorkCertificateReason.OTHER
              ? this.normalizeOptionalText(this.workOtherReasonText)
              : null,
            years: null,
            months: null,
            reason: optionalReason
          });
        });

        return;
      }

      if (documentType === DocumentType.CERTIFICAT_RETENUE) {
        payload.push({
          documentType,
          workCertificateReason: null,
          otherWorkCertificateReason: null,
          years: [...this.selectedRetenueYears].sort((a, b) => a - b),
          months: null,
          reason: optionalReason
        });

        return;
      }

      if (documentType === DocumentType.COPIE_FICHE_PAIE) {
        payload.push({
          documentType,
          workCertificateReason: null,
          otherWorkCertificateReason: null,
          years: null,
          months: this.sortPayslipSelections(this.selectedPayslipMonths),
          reason: optionalReason
        });

        return;
      }

      payload.push({
        documentType,
        workCertificateReason: null,
        otherWorkCertificateReason: null,
        years: null,
        months: null,
        reason: optionalReason
      });
    });

    return payload;
  }

  private formatDocumentRequestSummary(documentRequest: DocumentRequestCreateDto): string {
    if (documentRequest.documentType === DocumentType.ATTESTATION_TRAVAIL) {
      if (documentRequest.workCertificateReason === WorkCertificateReason.OTHER) {
        return `${this.getDocumentLabel(documentRequest.documentType)} - Autre: ${documentRequest.otherWorkCertificateReason || '-'}`;
      }

      return `${this.getDocumentLabel(documentRequest.documentType)} - Pour renouvellement de CIN`;
    }

    if (documentRequest.documentType === DocumentType.CERTIFICAT_RETENUE) {
      const years = documentRequest.years?.length ? documentRequest.years.join(', ') : '-';
      return `${this.getDocumentLabel(documentRequest.documentType)} - Annees: ${years}`;
    }

    if (documentRequest.documentType === DocumentType.COPIE_FICHE_PAIE) {
      const monthsText = documentRequest.months?.length
        ? this.sortPayslipSelections(documentRequest.months)
          .map((selection) => `${String(selection.month).padStart(2, '0')}/${selection.year}`)
          .join(', ')
        : '-';

      return `${this.getDocumentLabel(documentRequest.documentType)} - Mois/annee: ${monthsText}`;
    }

    return this.getDocumentLabel(documentRequest.documentType);
  }

  private sortPayslipSelections(selections: PayslipMonthYearSelectionDto[]): PayslipMonthYearSelectionDto[] {
    return [...selections].sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }

      return a.month - b.month;
    });
  }

  private resetAttestationSelections(): void {
    this.attestationStep = 'selection';
    this.attestationInfoDocumentStepIndex = 0;
    this.selectedAttestationDocumentTypes = [];
    this.selectedWorkReasons = [];
    this.selectedRetenueYears = [];
    this.selectedPayslipMonths = [];
    this.activePayslipYear = this.yearOptions[0];
    this.workOtherReasonText = '';
  }

  private getTodayInputDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isValidAbsenceTimeRange(): boolean {
    const startTime = this.leaveForm.get('absenceStartTime')?.value;
    const endTime = this.leaveForm.get('absenceEndTime')?.value;

    if (!startTime || !endTime) {
      return false;
    }

    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    if ((startMinutes + 60) > (23 * 60 + 59)) {
      return false;
    }

    return endMinutes >= (startMinutes + 60);
  }

  private coerceAbsenceTimesToMinBounds(): void {
    const startControl = this.leaveForm.get('absenceStartTime');
    const endControl = this.leaveForm.get('absenceEndTime');
    const startMinMinutes = this.timeToMinutes(this.absenceStartMinTime);
    const endMinMinutes = this.timeToMinutes(this.absenceEndMinTime);

    if (startMinMinutes >= (24 * 60)) {
      startControl?.setValue('', { emitEvent: false });
      endControl?.setValue('', { emitEvent: false });
      return;
    }

    const currentStart = startControl?.value;
    if (currentStart && this.timeToMinutes(currentStart) < startMinMinutes) {
      startControl?.setValue(this.minutesToHourString(startMinMinutes), { emitEvent: false });
    }

    const currentEnd = endControl?.value;
    if (endMinMinutes >= (24 * 60)) {
      endControl?.setValue('', { emitEvent: false });
      return;
    }

    if (currentEnd && this.timeToMinutes(currentEnd) < endMinMinutes) {
      endControl?.setValue(this.minutesToHourString(endMinMinutes), { emitEvent: false });
    }
  }

  private timeToMinutes(value: string): number {
    const normalized = this.normalizeTimeTo24h(value);
    if (!normalized) {
      return 0;
    }

    const parts = normalized.split(':');
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return 0;
    }

    return (hours * 60) + minutes;
  }

  private addHoursToTime(value: string, hoursToAdd: number): string {
    const totalMinutes = this.timeToMinutes(value) + (hoursToAdd * 60);
    if (totalMinutes >= (24 * 60)) {
      return '24:00';
    }

    return this.minutesToHourString(totalMinutes);
  }

  private minutesToHourString(totalMinutes: number): string {
    const safeMinutes = Math.max(0, Math.min(totalMinutes, (23 * 60)));
    const hours = Math.floor(safeMinutes / 60);
    return `${String(hours).padStart(2, '0')}:00`;
  }

  private normalizeAbsenceTimeControlTo24h(controlName: 'absenceStartTime' | 'absenceEndTime', selectedTime?: string): void {
    const control = this.leaveForm.get(controlName);
    const sourceValue = selectedTime ?? String(control?.value ?? '');
    const normalized = this.normalizeTimeTo24h(sourceValue);
    control?.setValue(normalized, { emitEvent: false });
  }

  private normalizeTimeTo24h(value: string): string {
    const text = String(value || '').trim();
    if (!text) {
      return '';
    }

    const match12 = text.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
    if (match12) {
      let hour = Number(match12[1]);
      const minutes = Number(match12[2]);
      const period = match12[3].toUpperCase();

      if (Number.isNaN(hour) || Number.isNaN(minutes) || hour < 1 || hour > 12 || minutes < 0 || minutes > 59) {
        return '';
      }

      if (period === 'AM' && hour === 12) {
        hour = 0;
      }

      if (period === 'PM' && hour < 12) {
        hour += 12;
      }

      return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    const match24 = text.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
      const hour = Number(match24[1]);
      const minutes = Number(match24[2]);
      if (Number.isNaN(hour) || Number.isNaN(minutes) || hour < 0 || hour > 23 || minutes < 0 || minutes > 59) {
        return '';
      }

      return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    return '';
  }

  private to12HourLabel(value24: string): string {
    const normalized = this.normalizeTimeTo24h(value24);
    if (!normalized) {
      return '12:00 AM';
    }

    const [hh, mm] = normalized.split(':').map((part) => Number(part));
    if (Number.isNaN(hh) || Number.isNaN(mm)) {
      return '12:00 AM';
    }

    const period = hh >= 12 ? 'PM' : 'AM';
    const hour12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${hour12}:${String(mm).padStart(2, '0')} ${period}`;
  }

  getDocumentLabel(value: DocumentType): string {
    const option = this.attestationDocumentTypeOptions.find((item) => item.value === value);
    return option?.label || '-';
  }

  getMonthLabel(value: number): string {
    const option = this.monthOptions.find((item) => item.value === value);
    return option?.label || '-';
  }

  private buildYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, index) => currentYear - index);
  }

  private syncEndDateFromDuration(): void {
    const startDate = this.leaveForm.get('startDate')?.value;
    const duration = Number(this.leaveForm.get('duration')?.value);

    if (!startDate || !duration || duration < 1) {
      return;
    }

    const start = this.parseInputDate(startDate);
    if (!start) {
      return;
    }

    start.setDate(start.getDate() + duration - 1);
    const computedEndDate = this.toInputDate(start);

    this.invalidRange = false;
    this.leaveForm.patchValue({ endDate: computedEndDate }, { emitEvent: false });
  }

  private syncDurationFromDates(): void {
    const startDate = this.leaveForm.get('startDate')?.value;
    const endDate = this.leaveForm.get('endDate')?.value;

    if (!startDate || !endDate) {
      return;
    }

    const start = this.parseInputDate(startDate);
    const end = this.parseInputDate(endDate);

    if (!start || !end) {
      return;
    }

    const diffMs = end.getTime() - start.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

    if (days < 1) {
      this.invalidRange = true;
      return;
    }

    this.invalidRange = false;
    this.leaveForm.patchValue({ duration: days }, { emitEvent: false });
  }

  private parseInputDate(value: string): Date | null {
    if (!value) {
      return null;
    }

    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private toInputDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDisplayDate(value: string): string {
    if (!value) {
      return '-';
    }

    const date = this.parseInputDate(value);
    if (!date) {
      return '-';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private formatDisplayTime(value: string): string {
    if (!value) {
      return '-';
    }

    const text = String(value);
    const match = text.match(/^\d{2}:\d{2}/);
    return match ? match[0] : '-';
  }
}
