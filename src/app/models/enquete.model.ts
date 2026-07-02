
import { AuditTasksGroup } from "./auditTasksGroup.model";
import {User} from "./user.model";
import {Checklist} from "./checklist.model";

export class Enquete {

  id : number;
  name : string;
  status : string;
  deleted : boolean;
  enqueteur : User
  checklist : Checklist

}

