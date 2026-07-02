
import { AuditTasksGroup } from "./auditTasksGroup.model";
import {Enquete} from "./enquete.model";
import {QuestionAnswerType} from "./questionAnswerType.model";
import {QuestionsGroup} from "./questionGroup.model";

export class Question {

    id : number;
    order : number;
    code : string;
    content : string;
    deleted : boolean;
    isSkippable : boolean;
    filter : boolean;
    isSpecialCase  : boolean;
    answerType : QuestionAnswerType;
    questionsGroup : QuestionsGroup;

}

