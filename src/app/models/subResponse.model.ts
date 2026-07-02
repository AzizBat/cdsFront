
import { AuditTasksGroup } from "./auditTasksGroup.model";
import {Enquete} from "./enquete.model";
import {Question} from "./question.model";
import {PossibleQuestionResponse} from "./possibleQuestionResponse.model";

export class SubResponses {

    id : number;
    deleted : boolean;
    response : Response;
    questionContent : string;
    questionCode : string;
    responseContent : string;
    image : string;
}



