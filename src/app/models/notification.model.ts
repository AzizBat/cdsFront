import { Audit } from "./audit.model";
import { AuditAction } from "./auditAction.model";
import { Event } from "./event.model";
import { RedTag } from "./redTag/redTag.model";
import { User } from "./user.model";

export class Notification {

    id : number;
    name : string;

    status : string;
    action : string;
    date : string;
    auditAction : AuditAction;
    auditActionId : number;
    audit : Audit;
    auditId : number;
    event : Event;
    eventId : number;
    redTag : RedTag;
    redTagId : number;
    organisationId : number;
    receiverUser : User;
    receiverUserId : number;
    creatorName : string;

}
