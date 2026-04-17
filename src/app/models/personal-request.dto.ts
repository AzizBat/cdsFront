export enum DocumentType {
  ATTESTATION_SALAIRE = 'ATTESTATION_SALAIRE',
  ATTESTATION_TRAVAIL = 'ATTESTATION_TRAVAIL',
  ATTESTATION_BENEFICE_PRET = 'ATTESTATION_BENEFICE_PRET',
  ATTESTATION_NON_BENEFICE_PRET = 'ATTESTATION_NON_BENEFICE_PRET',
  CERTIFICAT_RETENUE = 'CERTIFICAT_RETENUE',
  COPIE_FICHE_PAIE = 'COPIE_FICHE_PAIE'
}

export enum WorkCertificateReason {
  CIN_RENEWAL = 'CIN_RENEWAL',
  OTHER = 'OTHER'
}

export interface LeaveRequestCreateDto {
  reason: string;
  duration: number;
  startDate: Date | string;
  endDate: Date | string;
}

export interface AbsenceRequestCreateDto {
  reason: string;
  date: Date | string;
  startTime: string;
  endTime: string;
}

export interface SalaryAdvanceCreateDto {
  reason: string;
  amount: number;
}

export interface PayslipMonthYearSelectionDto {
  year: number;
  month: number;
}

export interface DocumentRequestCreateDto {
  documentType: DocumentType;
  workCertificateReason: WorkCertificateReason | null;
  otherWorkCertificateReason: string | null;
  years: number[] | null;
  months: PayslipMonthYearSelectionDto[] | null;
  reason: string | null;
}
