
import { AuditTasksGroup } from "./auditTasksGroup.model";
import {Enquete} from "./enquete.model";
import {Question} from "./question.model";
import {PossibleQuestionResponse} from "./possibleQuestionResponse.model";

export class Responses {

    id : number;
    deleted : boolean;
    responseGroup : number;
    enquete : Enquete;
    question : Question;
    possibleQuestionResponse : PossibleQuestionResponse ;
    content : string;
    image : string;
}

