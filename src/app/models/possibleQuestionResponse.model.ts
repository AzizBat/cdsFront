
import { AuditTasksGroup } from "./auditTasksGroup.model";
import {Enquete} from "./enquete.model";
import {Question} from "./question.model";

export class PossibleQuestionResponse {
  id : number;
  content : string;
  order : number;
  deleted : boolean;
  question : Question
  goToQuestion : Question
}
