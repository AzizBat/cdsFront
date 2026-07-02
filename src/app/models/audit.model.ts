import { Area } from "./area.model";
import { AuditType } from "./auditType.model";

export class Audit {

    id : number;
    name : string;
    score : number;
    maxPossibleScore : number;
    areaId : number ;
    areaName : string;
    auditorId : number;
    auditorName : string;
    auditTypeId : number;
    organisationId : number;
    date : string;
    modifiedDate : string;
    auditType : AuditType;
    area : Area;
    status : string


}
