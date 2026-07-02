import { AuditActionComment } from "./auditActionComment.model";
import { User } from "./user.model";

export class AuditAction {

    id : number;
    date : string;
    modifiedDate : string;
 //   illustrationUri : string;
    status : string;
    instruction : string;
    deadline : string;
    auditResponseId : number;
    auditName : string;
    areaName : string;
    affectedUsers : User[];
    comments :  AuditActionComment[];
    organisationId : number;
    creatorId : number;
    picture : string;
    validated : boolean;
    creatorName: string;
}
