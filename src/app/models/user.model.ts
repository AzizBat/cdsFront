import { Role } from "./role.model";
import {RpiRole} from "./rpiRole.model";

export class User {

    id : number;
    firstName : string;
    lastName : string;
    phoneNumber : string;
    email : string;
    organisationId : number;
    organizedOrganisationId : number;
    enabled : boolean;
    token?: string;
    roles : Role [];
    rpiRoles : RpiRole [];
    roleName  : string;
    archived : boolean;
    username : string;
    hasEmail : boolean;
    isEnabled : boolean
}

export class CreateUser {

    id : number;
    firstName : string;
    lastName : string;
    phoneNumber : string;
    email : string;
    roleName  : string;
    rpiRoleName  : string;
    archived : boolean;
    username : string;
    hasEmail : boolean;
    isEnabled : boolean

}
