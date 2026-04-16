import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SummaryRow } from '../request-summary/request-summary.component';

@Component({
  selector: 'app-leave-request-form',
  templateUrl: './leave-request-form.component.html',
  styleUrls: ['./leave-request-form.component.css']
})
export class LeaveRequestFormComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() user: any;
  @Input() requestTitleKey = 'home.leaveRequest';
  @Output() backToPersonalCards = new EventEmitter<void>();
  @ViewChild('signaturePad') signaturePad?: ElementRef<HTMLCanvasElement>;

  leaveForm!: FormGroup;
  showSummary = false;
  showPopup = false;
  invalidRange = false;
  invalidAbsenceTimeRange = false;
  readonly amountKeypadDigits: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  readonly attestationDocumentTypeOptions = [
    { value: 'salary', label: 'Attestation de salaire' },
    { value: 'work', label: 'Attestation de travail' },
    { value: 'loan-benefit', label: 'Attestation de benefice de pret' },
    { value: 'loan-non-benefit', label: 'Attestation de non benefice de pret' },
    { value: 'retenue', label: 'Certificat Retenu' },
    { value: 'payslip-copy', label: 'Copie Fiche de paie' }
  ];
  readonly monthOptions = [
    { value: '01', label: 'Janvier' },
    { value: '02', label: 'Fevrier' },
    { value: '03', label: 'Mars' },
    { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' },
    { value: '08', label: 'Aout' },
    { value: '09', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Decembre' }
  ];
  readonly yearOptions = this.buildYearOptions();
  private signatureCtx?: CanvasRenderingContext2D;
  private isDrawing = false;
  private hasSignatureStroke = false;
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

  get selectedAttestationDocumentType(): string {
    return String(this.leaveForm?.get('attestationDocumentType')?.value || '');
  }

  get isWorkAttestationSelected(): boolean {
    return this.selectedAttestationDocumentType === 'work';
  }

  get isRetenueSelected(): boolean {
    return this.selectedAttestationDocumentType === 'retenue';
  }

  get isPayslipCopySelected(): boolean {
    return this.selectedAttestationDocumentType === 'payslip-copy';
  }

  get isWorkAttestationOtherSelected(): boolean {
    return this.leaveForm?.get('attestationWorkReason')?.value === 'other';
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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.leaveForm = this.fb.group({
      matricule: [{ value: '', disabled: true }, Validators.required],
      fullName: [{ value: '', disabled: true }, Validators.required],
      amount: [null],
      attestationDocumentType: [''],
      attestationWorkReason: [''],
      attestationWorkOtherText: [''],
      attestationYear: [''],
      attestationMonth: [''],
      duration: [1, [Validators.required, Validators.min(1)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      absenceDate: [''],
      absenceStartTime: [''],
      absenceEndTime: [''],
      motif: ['', [Validators.required]],
      signature: ['', [Validators.required]]
    });

    this.patchUserDefaults();
    this.configureFormByRequestType();
  }

  ngAfterViewInit(): void {
    this.initializeSignaturePad();
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
      const rows: SummaryRow[] = [
        { label: 'Matricule', value: raw.matricule || '-' },
        { label: 'Nom et prenom', value: raw.fullName || '-' },
        { label: 'Type de document', value: this.getAttestationDocumentLabel(raw.attestationDocumentType) }
      ];

      if (raw.attestationDocumentType === 'work') {
        const reason = raw.attestationWorkReason === 'other'
          ? `Autre: ${raw.attestationWorkOtherText || '-'}`
          : 'Pour renouvellement CIN';
        rows.push({ label: 'Motif du document', value: reason });
      }

      if (raw.attestationDocumentType === 'retenue') {
        rows.push({ label: 'Annee', value: raw.attestationYear || '-' });
      }

      if (raw.attestationDocumentType === 'payslip-copy') {
        rows.push({ label: 'Mois', value: this.getMonthLabel(raw.attestationMonth) });
        rows.push({ label: 'Annee', value: raw.attestationYear || '-' });
      }

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
        { label: 'Motif', value: raw.motif || '-' },
        { label: 'Signature', value: raw.signature || '', type: 'image', alt: 'Signature' }
      ];
    }

    return [
      { label: 'Matricule', value: raw.matricule || '-' },
      { label: 'Nom et prenom', value: raw.fullName || '-' },
      { label: 'Duree', value: `${raw.duration || 0} jour(s)` },
      { label: 'De', value: this.formatDisplayDate(raw.startDate) },
      { label: 'A', value: this.formatDisplayDate(raw.endDate) },
      { label: 'Motif', value: raw.motif || '-' },
      { label: 'Signature', value: raw.signature || '', type: 'image', alt: 'Signature' }
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

  onAttestationDocumentTypeChange(): void {
    this.configureAttestationFieldsByDocumentType();
  }

  onWorkAttestationReasonSelect(reason: 'cin' | 'other'): void {
    this.leaveForm.patchValue({ attestationWorkReason: reason }, { emitEvent: false });
    if (reason !== 'other') {
      this.leaveForm.patchValue({ attestationWorkOtherText: '' }, { emitEvent: false });
    }

    this.configureAttestationFieldsByDocumentType();
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
    if (!this.isAdvanceSalaryRequest) {
      this.leaveForm.get('signature')?.markAsTouched();
    }

    if (this.isAbsenceRequest) {
      this.normalizeAbsenceTimeControlTo24h('absenceStartTime');
      this.normalizeAbsenceTimeControlTo24h('absenceEndTime');
    }

    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
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
    this.invalidRange = false;
    this.invalidAbsenceTimeRange = false;
    this.togglePageScroll(false);

    this.leaveForm.reset({
      amount: null,
      attestationDocumentType: '',
      attestationWorkReason: '',
      attestationWorkOtherText: '',
      attestationYear: '',
      attestationMonth: '',
      duration: 1,
      startDate: '',
      endDate: '',
      absenceDate: this.isAbsenceRequest ? this.getTodayInputDate() : '',
      absenceStartTime: '',
      absenceEndTime: '',
      motif: '',
      signature: ''
    });

    this.patchUserDefaults();
    this.clearSignature();
  }

  onConfirmSummary(): void {
    const payload = this.leaveForm.getRawValue();
    console.log('Demande personnelle:', this.requestTitleKey, payload);
    this.showPopup = true;
  }

  onEditSummary(): void {
    this.showSummary = false;
    this.showPopup = false;
    this.togglePageScroll(false);

    // The canvas is recreated when leaving summary view, so re-bind context on next tick.
    setTimeout(() => this.initializeSignaturePad(), 0);
  }

  onPopupYes(): void {
    this.showPopup = false;
    this.onCancel();
    this.backToPersonalCards.emit();
  }

  onPopupDisconnect(): void {
    this.showPopup = false;
    this.togglePageScroll(false);
    location.reload();
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

  startSignature(event: PointerEvent): void {
    if (!this.signaturePad || !this.signatureCtx) {
      return;
    }

    event.preventDefault();
    const canvas = this.signaturePad.nativeElement;
    canvas.setPointerCapture(event.pointerId);

    const position = this.getPointerPosition(event);
    this.signatureCtx.beginPath();
    this.signatureCtx.moveTo(position.x, position.y);
    this.isDrawing = true;
  }

  drawSignature(event: PointerEvent): void {
    if (!this.isDrawing || !this.signatureCtx) {
      return;
    }

    event.preventDefault();
    const position = this.getPointerPosition(event);
    this.signatureCtx.lineTo(position.x, position.y);
    this.signatureCtx.stroke();
    this.hasSignatureStroke = true;
  }

  endSignature(): void {
    if (!this.isDrawing) {
      return;
    }

    this.isDrawing = false;
    this.signatureCtx?.closePath();

    if (this.hasSignatureStroke && this.signaturePad) {
      const dataUrl = this.signaturePad.nativeElement.toDataURL('image/png');
      this.leaveForm.patchValue({ signature: dataUrl }, { emitEvent: false });
      this.leaveForm.get('signature')?.markAsDirty();
      this.leaveForm.get('signature')?.updateValueAndValidity({ emitEvent: false });
    }
  }

  clearSignature(): void {
    if (!this.signaturePad || !this.signatureCtx) {
      return;
    }

    const canvas = this.signaturePad.nativeElement;
    this.signatureCtx.clearRect(0, 0, canvas.width, canvas.height);
    this.fillSignatureBackground();
    this.hasSignatureStroke = false;
    this.leaveForm.patchValue({ signature: '' }, { emitEvent: false });
    this.leaveForm.get('signature')?.markAsPristine();
    this.leaveForm.get('signature')?.updateValueAndValidity({ emitEvent: false });
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
    const attestationDocumentTypeControl = this.leaveForm.get('attestationDocumentType');
    const attestationWorkReasonControl = this.leaveForm.get('attestationWorkReason');
    const attestationWorkOtherTextControl = this.leaveForm.get('attestationWorkOtherText');
    const attestationYearControl = this.leaveForm.get('attestationYear');
    const attestationMonthControl = this.leaveForm.get('attestationMonth');
    const motifControl = this.leaveForm.get('motif');
    const durationControl = this.leaveForm.get('duration');
    const startDateControl = this.leaveForm.get('startDate');
    const endDateControl = this.leaveForm.get('endDate');
    const absenceDateControl = this.leaveForm.get('absenceDate');
    const absenceStartTimeControl = this.leaveForm.get('absenceStartTime');
    const absenceEndTimeControl = this.leaveForm.get('absenceEndTime');
    const signatureControl = this.leaveForm.get('signature');

    if (this.isAttestationRequest) {
      amountControl?.clearValidators();
      amountControl?.setValue(null, { emitEvent: false });
      attestationDocumentTypeControl?.setValidators([Validators.required]);
      motifControl?.clearValidators();

      durationControl?.clearValidators();
      startDateControl?.clearValidators();
      endDateControl?.clearValidators();
      absenceDateControl?.clearValidators();
      absenceStartTimeControl?.clearValidators();
      absenceEndTimeControl?.clearValidators();
      signatureControl?.clearValidators();

      durationControl?.setValue(1, { emitEvent: false });
      startDateControl?.setValue('', { emitEvent: false });
      endDateControl?.setValue('', { emitEvent: false });
      absenceDateControl?.setValue('', { emitEvent: false });
      absenceStartTimeControl?.setValue('', { emitEvent: false });
      absenceEndTimeControl?.setValue('', { emitEvent: false });
      signatureControl?.setValue('', { emitEvent: false });
      motifControl?.setValue('', { emitEvent: false });

      this.configureAttestationFieldsByDocumentType();
      this.invalidAbsenceTimeRange = false;
    } else if (this.isAdvanceSalaryRequest) {
      amountControl?.setValidators([Validators.required, Validators.min(1)]);
      attestationDocumentTypeControl?.clearValidators();
      attestationWorkReasonControl?.clearValidators();
      attestationWorkOtherTextControl?.clearValidators();
      attestationYearControl?.clearValidators();
      attestationMonthControl?.clearValidators();
      motifControl?.setValidators([Validators.required]);

      durationControl?.clearValidators();
      startDateControl?.clearValidators();
      endDateControl?.clearValidators();
      absenceDateControl?.clearValidators();
      absenceStartTimeControl?.clearValidators();
      absenceEndTimeControl?.clearValidators();
      signatureControl?.clearValidators();

      attestationDocumentTypeControl?.setValue('', { emitEvent: false });
      attestationWorkReasonControl?.setValue('', { emitEvent: false });
      attestationWorkOtherTextControl?.setValue('', { emitEvent: false });
      attestationYearControl?.setValue('', { emitEvent: false });
      attestationMonthControl?.setValue('', { emitEvent: false });

      durationControl?.setValue(1, { emitEvent: false });
      startDateControl?.setValue('', { emitEvent: false });
      endDateControl?.setValue('', { emitEvent: false });
      absenceDateControl?.setValue('', { emitEvent: false });
      absenceStartTimeControl?.setValue('', { emitEvent: false });
      absenceEndTimeControl?.setValue('', { emitEvent: false });
      signatureControl?.setValue('', { emitEvent: false });

      this.invalidAbsenceTimeRange = false;
    } else if (this.isAbsenceRequest) {
      amountControl?.clearValidators();
      amountControl?.setValue(null, { emitEvent: false });
      attestationDocumentTypeControl?.clearValidators();
      attestationWorkReasonControl?.clearValidators();
      attestationWorkOtherTextControl?.clearValidators();
      attestationYearControl?.clearValidators();
      attestationMonthControl?.clearValidators();
      motifControl?.setValidators([Validators.required]);

      durationControl?.clearValidators();
      startDateControl?.clearValidators();
      endDateControl?.clearValidators();
      absenceDateControl?.setValidators([Validators.required]);
      absenceStartTimeControl?.setValidators([Validators.required]);
      absenceEndTimeControl?.setValidators([Validators.required]);
      signatureControl?.setValidators([Validators.required]);

      attestationDocumentTypeControl?.setValue('', { emitEvent: false });
      attestationWorkReasonControl?.setValue('', { emitEvent: false });
      attestationWorkOtherTextControl?.setValue('', { emitEvent: false });
      attestationYearControl?.setValue('', { emitEvent: false });
      attestationMonthControl?.setValue('', { emitEvent: false });

      startDateControl?.setValue('', { emitEvent: false });
      endDateControl?.setValue('', { emitEvent: false });
      if (!absenceDateControl?.value) {
        absenceDateControl?.setValue(this.getTodayInputDate(), { emitEvent: false });
      }
      absenceStartTimeControl?.setValue('', { emitEvent: false });
      absenceEndTimeControl?.setValue('', { emitEvent: false });
    } else {
      amountControl?.clearValidators();
      amountControl?.setValue(null, { emitEvent: false });
      attestationDocumentTypeControl?.clearValidators();
      attestationWorkReasonControl?.clearValidators();
      attestationWorkOtherTextControl?.clearValidators();
      attestationYearControl?.clearValidators();
      attestationMonthControl?.clearValidators();
      motifControl?.setValidators([Validators.required]);

      durationControl?.setValidators([Validators.required, Validators.min(1)]);
      startDateControl?.setValidators([Validators.required]);
      endDateControl?.setValidators([Validators.required]);
      absenceDateControl?.clearValidators();
      absenceStartTimeControl?.clearValidators();
      absenceEndTimeControl?.clearValidators();
      signatureControl?.setValidators([Validators.required]);

      attestationDocumentTypeControl?.setValue('', { emitEvent: false });
      attestationWorkReasonControl?.setValue('', { emitEvent: false });
      attestationWorkOtherTextControl?.setValue('', { emitEvent: false });
      attestationYearControl?.setValue('', { emitEvent: false });
      attestationMonthControl?.setValue('', { emitEvent: false });

      absenceDateControl?.setValue('', { emitEvent: false });
      absenceStartTimeControl?.setValue('', { emitEvent: false });
      absenceEndTimeControl?.setValue('', { emitEvent: false });
    }

    amountControl?.updateValueAndValidity({ emitEvent: false });
    attestationDocumentTypeControl?.updateValueAndValidity({ emitEvent: false });
    attestationWorkReasonControl?.updateValueAndValidity({ emitEvent: false });
    attestationWorkOtherTextControl?.updateValueAndValidity({ emitEvent: false });
    attestationYearControl?.updateValueAndValidity({ emitEvent: false });
    attestationMonthControl?.updateValueAndValidity({ emitEvent: false });
    motifControl?.updateValueAndValidity({ emitEvent: false });
    durationControl?.updateValueAndValidity({ emitEvent: false });
    startDateControl?.updateValueAndValidity({ emitEvent: false });
    endDateControl?.updateValueAndValidity({ emitEvent: false });
    absenceDateControl?.updateValueAndValidity({ emitEvent: false });
    absenceStartTimeControl?.updateValueAndValidity({ emitEvent: false });
    absenceEndTimeControl?.updateValueAndValidity({ emitEvent: false });
    signatureControl?.updateValueAndValidity({ emitEvent: false });

    if (this.isAbsenceRequest) {
      this.coerceAbsenceTimesToMinBounds();
    }
  }

  private configureAttestationFieldsByDocumentType(): void {
    const docControl = this.leaveForm.get('attestationDocumentType');
    const workReasonControl = this.leaveForm.get('attestationWorkReason');
    const workOtherTextControl = this.leaveForm.get('attestationWorkOtherText');
    const yearControl = this.leaveForm.get('attestationYear');
    const monthControl = this.leaveForm.get('attestationMonth');

    const docType = String(docControl?.value || '');

    workReasonControl?.clearValidators();
    workOtherTextControl?.clearValidators();
    yearControl?.clearValidators();
    monthControl?.clearValidators();

    if (docType !== 'work') {
      workReasonControl?.setValue('', { emitEvent: false });
      workOtherTextControl?.setValue('', { emitEvent: false });
    }

    if (docType !== 'retenue' && docType !== 'payslip-copy') {
      yearControl?.setValue('', { emitEvent: false });
    }

    if (docType !== 'payslip-copy') {
      monthControl?.setValue('', { emitEvent: false });
    }

    if (docType === 'work') {
      workReasonControl?.setValidators([Validators.required]);
      if (workReasonControl?.value === 'other') {
        workOtherTextControl?.setValidators([Validators.required]);
      }
    }

    if (docType === 'retenue') {
      yearControl?.setValidators([Validators.required]);
    }

    if (docType === 'payslip-copy') {
      yearControl?.setValidators([Validators.required]);
      monthControl?.setValidators([Validators.required]);
    }

    workReasonControl?.updateValueAndValidity({ emitEvent: false });
    workOtherTextControl?.updateValueAndValidity({ emitEvent: false });
    yearControl?.updateValueAndValidity({ emitEvent: false });
    monthControl?.updateValueAndValidity({ emitEvent: false });
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

  private getAttestationDocumentLabel(value: string): string {
    const option = this.attestationDocumentTypeOptions.find((item) => item.value === value);
    return option?.label || '-';
  }

  private getMonthLabel(value: string): string {
    const option = this.monthOptions.find((item) => item.value === value);
    return option?.label || '-';
  }

  private buildYearOptions(): string[] {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, index) => String(currentYear - index));
  }

  private initializeSignaturePad(): void {
    if (!this.signaturePad) {
      return;
    }

    const canvas = this.signaturePad.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#1f1f1f';

    this.signatureCtx = ctx;
    this.fillSignatureBackground();

    const existingSignature = this.leaveForm?.getRawValue()?.signature;
    if (existingSignature) {
      this.restoreSignatureToCanvas(existingSignature);
    } else {
      this.hasSignatureStroke = false;
    }
  }

  private restoreSignatureToCanvas(dataUrl: string): void {
    if (!this.signaturePad || !this.signatureCtx || !dataUrl) {
      return;
    }

    const image = new Image();
    image.onload = () => {
      if (!this.signaturePad || !this.signatureCtx) {
        return;
      }

      const canvas = this.signaturePad.nativeElement;
      const canvasWidth = canvas.clientWidth;
      const canvasHeight = canvas.clientHeight;
      const imageRatio = image.width / image.height;
      const canvasRatio = canvasWidth / canvasHeight;

      let drawWidth = canvasWidth;
      let drawHeight = canvasHeight;

      if (imageRatio > canvasRatio) {
        drawHeight = canvasWidth / imageRatio;
      } else {
        drawWidth = canvasHeight * imageRatio;
      }

      const drawX = (canvasWidth - drawWidth) / 2;
      const drawY = (canvasHeight - drawHeight) / 2;

      this.signatureCtx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      this.hasSignatureStroke = true;
    };

    image.src = dataUrl;
  }

  private fillSignatureBackground(): void {
    if (!this.signaturePad || !this.signatureCtx) {
      return;
    }

    const canvas = this.signaturePad.nativeElement;
    this.signatureCtx.save();
    this.signatureCtx.setTransform(1, 0, 0, 1, 0, 0);
    this.signatureCtx.fillStyle = '#ffffff';
    this.signatureCtx.fillRect(0, 0, canvas.width, canvas.height);
    this.signatureCtx.restore();
  }

  private getPointerPosition(event: PointerEvent): { x: number; y: number } {
    const rect = this.signaturePad!.nativeElement.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
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
