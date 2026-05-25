import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';

import {
  AbsenceRequestCreateDto,
  DocumentRequestCreateDto,
  DocumentRequestPeriodDto,
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
      labelKey: 'leaveRequestForm.documents.salaryCertificate',
      subtitleKey: 'leaveRequestForm.documents.standardDocument'
    },
    {
      value: DocumentType.ATTESTATION_TRAVAIL,
      labelKey: 'leaveRequestForm.documents.workCertificate',
      subtitleKey: 'leaveRequestForm.documents.mandatoryReason'
    },
    {
      value: DocumentType.ATTESTATION_BENEFICE_PRET,
      labelKey: 'leaveRequestForm.documents.loanBenefitCertificate',
      subtitleKey: 'leaveRequestForm.documents.standardDocument'
    },
    {
      value: DocumentType.ATTESTATION_NON_BENEFICE_PRET,
      labelKey: 'leaveRequestForm.documents.noLoanBenefitCertificate',
      subtitleKey: 'leaveRequestForm.documents.standardDocument'
    },
    {
      value: DocumentType.CERTIFICAT_RETENUE,
      labelKey: 'leaveRequestForm.documents.withholdingCertificate',
      subtitleKey: 'leaveRequestForm.documents.multipleYears'
    },
    {
      value: DocumentType.COPIE_FICHE_PAIE,
      labelKey: 'leaveRequestForm.documents.payslipCopy',
      subtitleKey: 'leaveRequestForm.documents.multipleMonthsYears'
    }
  ];
  readonly monthOptions = [
    { value: 1, labelKey: 'leaveRequestForm.months.january' },
    { value: 2, labelKey: 'leaveRequestForm.months.february' },
    { value: 3, labelKey: 'leaveRequestForm.months.march' },
    { value: 4, labelKey: 'leaveRequestForm.months.april' },
    { value: 5, labelKey: 'leaveRequestForm.months.may' },
    { value: 6, labelKey: 'leaveRequestForm.months.june' },
    { value: 7, labelKey: 'leaveRequestForm.months.july' },
    { value: 8, labelKey: 'leaveRequestForm.months.august' },
    { value: 9, labelKey: 'leaveRequestForm.months.september' },
    { value: 10, labelKey: 'leaveRequestForm.months.october' },
    { value: 11, labelKey: 'leaveRequestForm.months.november' },
    { value: 12, labelKey: 'leaveRequestForm.months.december' }
  ];
  readonly workReasonOptions = [
    { value: WorkCertificateReason.CIN_RENEWAL, labelKey: 'leaveRequestForm.workReasons.cinRenewal' },
    { value: WorkCertificateReason.OTHER, labelKey: 'leaveRequestForm.workReasons.otherReason' }
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
  readonly motifMinLength = 5;
  private pageScrollLocked = false;

  get motifControl(): AbstractControl | null {
    return this.leaveForm?.get('motif') || null;
  }

  get showMotifValidationError(): boolean {
    const motifControl = this.motifControl;
    return !!motifControl && motifControl.invalid && (motifControl.dirty || motifControl.touched);
  }

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

  get absenceEndClockMin(): string {
    if (this.absenceEndMinTime === '24:00') {
      return '23:59';
    }

    return this.absenceEndMinTime;
  }

  get todayInputDate(): string {
    return this.getTodayInputDate();
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
      return this.hasAttestationInfoStep
        ? this.t('leaveRequestForm.actions.next')
        : this.t('leaveRequestForm.actions.continue');
    }

    return this.hasNextInfoDocumentStep
      ? this.t('leaveRequestForm.actions.next')
      : this.t('leaveRequestForm.actions.continue');
  }

  get attestationSecondaryLabel(): string {
    if (!this.isAttestationDetailsStep) {
      return this.t('leaveRequestForm.actions.cancel');
    }

    return this.attestationInfoDocumentStepIndex > 0
      ? this.t('leaveRequestForm.actions.previous')
      : this.t('leaveRequestForm.actions.back');
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

  get isContinueDisabled(): boolean {
    if (!this.leaveForm) {
      return true;
    }

    return this.isSubmitting || this.leaveForm.invalid;
  }

  constructor(
    private fb: FormBuilder,
    private personalRequestService: PersonalRequestService,
    private translate: TranslateService
  ) {}

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
      motif: ['', [this.trimmedRequiredMinLengthValidator(this.motifMinLength)]]
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
        { label: 'leaveRequestForm.fields.matricule', value: raw.matricule || '-' },
        { label: 'leaveRequestForm.fields.fullName', value: raw.fullName || '-' },
        { label: 'leaveRequestForm.summary.selectedDocuments', value: this.selectedAttestationDocumentsSummary },
        { label: 'leaveRequestForm.summary.requestCount', value: String(payload.length) }
      ];

      payload.forEach((documentRequest, index) => {
        rows.push({
          label: this.t('leaveRequestForm.summary.documentIndex', { index: index + 1 }),
          value: this.formatDocumentRequestSummary(documentRequest)
        });
      });

      return rows;
    }

    if (this.isAdvanceSalaryRequest) {
      return [
        { label: 'leaveRequestForm.fields.matricule', value: raw.matricule || '-' },
        { label: 'leaveRequestForm.fields.fullName', value: raw.fullName || '-' },
        {
          label: 'leaveRequestForm.fields.amount',
          value: raw.amount ? `${raw.amount} ${this.t('leaveRequestForm.common.currency')}` : '-'
        },
        { label: 'leaveRequestForm.fields.reason', value: raw.motif || '-', isMotif: true }
      ];
    }

    if (this.isAbsenceRequest) {
      return [
        { label: 'leaveRequestForm.fields.matricule', value: raw.matricule || '-' },
        { label: 'leaveRequestForm.fields.fullName', value: raw.fullName || '-' },
        { label: 'leaveRequestForm.fields.date', value: this.formatDisplayDate(raw.absenceDate) },
        { label: 'leaveRequestForm.fields.from', value: this.formatDisplayTime(raw.absenceStartTime) },
        { label: 'leaveRequestForm.fields.to', value: this.formatDisplayTime(raw.absenceEndTime) },
        { label: 'leaveRequestForm.fields.reason', value: raw.motif || '-', isMotif: true }
      ];
    }

    return [
      { label: 'leaveRequestForm.fields.matricule', value: raw.matricule || '-' },
      { label: 'leaveRequestForm.fields.fullName', value: raw.fullName || '-' },
      {
        label: 'leaveRequestForm.fields.duration',
        value: this.t('leaveRequestForm.summary.dayCount', { count: raw.duration || 0 })
      },
      { label: 'leaveRequestForm.fields.from', value: this.formatDisplayDate(raw.startDate) },
      { label: 'leaveRequestForm.fields.to', value: this.formatDisplayDate(raw.endDate) },
      { label: 'leaveRequestForm.fields.reason', value: raw.motif || '-', isMotif: true }
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
      this.submissionErrorMessage = this.t('leaveRequestForm.errors.selectAtLeastOneDocument');
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
      this.selectedWorkReasons = [];
    } else {
      this.selectedWorkReasons = [reason];
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
          this.submissionErrorMessage = this.t('leaveRequestForm.errors.submitLeaveFailed');
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
          this.submissionErrorMessage = this.t('leaveRequestForm.errors.submitAbsenceFailed');
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
          this.submissionErrorMessage = this.t('leaveRequestForm.errors.submitAdvanceFailed');
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
      this.submissionErrorMessage = this.t('leaveRequestForm.errors.selectAtLeastOneDocument');
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
          this.submissionErrorMessage = this.t('leaveRequestForm.errors.submitDocumentFailed');
        }
      });
  }

  private normalizeOptionalText(value: unknown): string | null {
    const normalized = String(value || '').trim();
    return normalized ? normalized : null;
  }

  private trimmedRequiredMinLengthValidator(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const normalizedValue = String(control.value || '').trim();

      if (!normalizedValue) {
        return { motifRequired: true };
      }

      if (normalizedValue.length < minLength) {
        return {
          motifMinLength: {
            requiredLength: minLength,
            actualLength: normalizedValue.length
          }
        };
      }

      return null;
    };
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
      motifControl?.setValidators([this.trimmedRequiredMinLengthValidator(this.motifMinLength)]);

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
      motifControl?.setValidators([this.trimmedRequiredMinLengthValidator(this.motifMinLength)]);

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
      motifControl?.setValidators([this.trimmedRequiredMinLengthValidator(this.motifMinLength)]);

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
      return this.t('leaveRequestForm.errors.selectAtLeastOneDocument');
    }

    if (this.isWorkAttestationSelected && !this.selectedWorkReasons.length) {
      return this.t('leaveRequestForm.errors.selectWorkReason');
    }

    if (this.isWorkAttestationOtherSelected && !this.normalizeOptionalText(this.workOtherReasonText)) {
      return this.t('leaveRequestForm.errors.specifyOtherReason');
    }

    if (this.isRetenueSelected && !this.selectedRetenueYears.length) {
      return this.t('leaveRequestForm.errors.selectRetenueYear');
    }

    if (this.isPayslipCopySelected && !this.selectedPayslipMonths.length) {
      return this.t('leaveRequestForm.errors.selectPayslipMonthYear');
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
        return this.t('leaveRequestForm.errors.selectWorkReason');
      }

      if (this.isWorkAttestationOtherSelected && !this.normalizeOptionalText(this.workOtherReasonText)) {
        return this.t('leaveRequestForm.errors.specifyOtherReason');
      }

      return '';
    }

    if (currentDocumentType === DocumentType.CERTIFICAT_RETENUE) {
      return this.selectedRetenueYears.length
        ? ''
        : this.t('leaveRequestForm.errors.selectRetenueYear');
    }

    if (currentDocumentType === DocumentType.COPIE_FICHE_PAIE) {
      return this.selectedPayslipMonths.length
        ? ''
        : this.t('leaveRequestForm.errors.selectPayslipMonthYear');
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
            requestPeriod: null,
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
          requestPeriod: [...this.selectedRetenueYears]
            .sort((a, b) => a - b)
            .map((year) => ({ year })),
          reason: optionalReason
        });

        return;
      }

      if (documentType === DocumentType.COPIE_FICHE_PAIE) {
        payload.push({
          documentType,
          workCertificateReason: null,
          otherWorkCertificateReason: null,
          requestPeriod: this.sortPayslipSelections(this.selectedPayslipMonths)
            .map((selection): DocumentRequestPeriodDto => ({
              year: selection.year,
              month: selection.month
            })),
          reason: optionalReason
        });

        return;
      }

      payload.push({
        documentType,
        workCertificateReason: null,
        otherWorkCertificateReason: null,
        requestPeriod: null,
        reason: optionalReason
      });
    });

    return payload;
  }

  private formatDocumentRequestSummary(documentRequest: DocumentRequestCreateDto): string {
    if (documentRequest.documentType === DocumentType.ATTESTATION_TRAVAIL) {
      if (documentRequest.workCertificateReason === WorkCertificateReason.OTHER) {
        return this.t('leaveRequestForm.summary.documentOtherReason', {
          document: this.getDocumentLabel(documentRequest.documentType),
          reason: documentRequest.otherWorkCertificateReason || '-'
        });
      }

      return this.t('leaveRequestForm.summary.documentCinRenewal', {
        document: this.getDocumentLabel(documentRequest.documentType)
      });
    }

    if (documentRequest.documentType === DocumentType.CERTIFICAT_RETENUE) {
      const requestPeriod = documentRequest.requestPeriod || [];
      const years = requestPeriod
        .map((selection) => selection.year)
        .sort((a, b) => a - b);
      const yearsText = years.length ? years.join(', ') : '-';

      return this.t('leaveRequestForm.summary.documentYears', {
        document: this.getDocumentLabel(documentRequest.documentType),
        years: yearsText
      });
    }

    if (documentRequest.documentType === DocumentType.COPIE_FICHE_PAIE) {
      const requestPeriod = documentRequest.requestPeriod || [];
      const payslipSelections = requestPeriod
        .filter((selection) => Number.isInteger(selection.month))
        .map((selection) => ({
          year: selection.year,
          month: Number(selection.month)
        }));

      const monthsText = payslipSelections.length
        ? this.sortPayslipSelections(payslipSelections)
          .map((selection) => `${String(selection.month).padStart(2, '0')}/${selection.year}`)
          .join(', ')
        : '-';

      return this.t('leaveRequestForm.summary.documentMonthYear', {
        document: this.getDocumentLabel(documentRequest.documentType),
        months: monthsText
      });
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

  getDocumentLabel(value: DocumentType): string {
    const option = this.attestationDocumentTypeOptions.find((item) => item.value === value);
    return option?.labelKey ? this.t(option.labelKey) : '-';
  }

  getMonthLabel(value: number): string {
    const option = this.monthOptions.find((item) => item.value === value);
    return option?.labelKey ? this.t(option.labelKey) : '-';
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
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
