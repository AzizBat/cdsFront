import {AuditType} from "./auditType.model";

export class Product {

  id : number;
  reference : string;
  picture : string;
  designation : string;
  archived : boolean;
  deleted : boolean;
  auditType : AuditType;
  organisationId : number;
  createdDate: string;
  createdBy  : string;
  lastModifiedBy : string;
}

