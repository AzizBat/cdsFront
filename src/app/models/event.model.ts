import { User } from "./user.model";

export class Event {

    id : number;
    status : string;
    name : string;
    description : string;
    picture : string;
    deadline : string;
    areaId : number;
    assignedUser : User;
    assignedUserId : number;
    areaName : string;
    maxPossibleScore : number;
    date : string;
    modifiedDate : string;
    score : number;

}
