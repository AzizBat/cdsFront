import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import {
  AbsenceRequestCreateDto,
  DocumentRequestCreateDto,
  DocumentType,
  LeaveRequestCreateDto,
  SalaryAdvanceCreateDto,
  WorkCertificateReason
} from '../models/personal-request.dto';

@Injectable({
  providedIn: 'root'
})
export class PersonalRequestService {
  readonly baseUri = environment.apiUrl;
  readonly personalRequestsApi = `${this.baseUri}/api/personal-requests`;

  constructor(private http: HttpClient) {}

  createLeaveRequest(payload: LeaveRequestCreateDto): Observable<unknown> {
    return this.postPersonalRequest('/leave', payload);
  }

  createAbsenceRequest(payload: AbsenceRequestCreateDto): Observable<unknown> {
    return this.postPersonalRequest('/absence', payload);
  }

  createSalaryAdvanceRequest(payload: SalaryAdvanceCreateDto): Observable<unknown> {
    return this.postPersonalRequest('/salary-advance', payload);
  }

  createDocumentRequest(payload: DocumentRequestCreateDto): Observable<unknown> {
    return this.createMultipleDocumentRequests([payload]);
  }

  createMultipleDocumentRequests(payload: DocumentRequestCreateDto[]): Observable<unknown> {
    return this.postPersonalRequest('/multiple-documents', payload);
  }

  createSimpleAttestationRequest(
    documentType:
      | DocumentType.ATTESTATION_SALAIRE
      | DocumentType.ATTESTATION_BENEFICE_PRET
      | DocumentType.ATTESTATION_NON_BENEFICE_PRET,
    reason?: string | null
  ): Observable<unknown> {
    return this.createDocumentRequest({
      documentType,
      workCertificateReason: null,
      otherWorkCertificateReason: null,
      years: null,
      months: null,
      reason: reason ?? null
    });
  }

  createWorkCertificateRequest(
    workCertificateReason: WorkCertificateReason,
    otherWorkCertificateReason?: string | null,
    reason?: string | null
  ): Observable<unknown> {
    const normalizedOtherReason = workCertificateReason === WorkCertificateReason.OTHER
      ? (otherWorkCertificateReason?.trim() || null)
      : null;

    return this.createDocumentRequest({
      documentType: DocumentType.ATTESTATION_TRAVAIL,
      workCertificateReason,
      otherWorkCertificateReason: normalizedOtherReason,
      years: null,
      months: null,
      reason: reason ?? null
    });
  }

  createRetenueCertificateRequest(year: number, reason?: string | null): Observable<unknown> {
    return this.createDocumentRequest({
      documentType: DocumentType.CERTIFICAT_RETENUE,
      workCertificateReason: null,
      otherWorkCertificateReason: null,
      years: [year],
      months: null,
      reason: reason ?? null
    });
  }

  createPayslipCopyRequest(year: number, month: number, reason?: string | null): Observable<unknown> {
    return this.createDocumentRequest({
      documentType: DocumentType.COPIE_FICHE_PAIE,
      workCertificateReason: null,
      otherWorkCertificateReason: null,
      years: null,
      months: [{ year, month }],
      reason: reason ?? null
    });
  }

  private postPersonalRequest(path: string, payload: unknown): Observable<unknown> {
    return this.http.post(`${this.personalRequestsApi}${path}`, payload, {
      headers: this.getAuthorizationHeaders()
    });
  }

  private getAuthorizationHeaders(): HttpHeaders {
    const rawToken = localStorage.getItem('token') || '';
    const token = rawToken.startsWith('Bearer ') ? rawToken : `Bearer ${rawToken}`;

    return new HttpHeaders({
      Authorization: token
    });
  }
}
