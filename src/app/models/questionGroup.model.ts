
import { AuditTasksGroup } from "./auditTasksGroup.model";
import {Enquete} from "./enquete.model";
import {QuestionAnswerType} from "./questionAnswerType.model";
import {Checklist} from "./checklist.model";

export class QuestionsGroup {
  id : number;
  name : string;
  questionGroupOrder : number;
  questionGroupCode : string;
  deleted : boolean;
  repetitive : boolean;
  checklist : Checklist
}

