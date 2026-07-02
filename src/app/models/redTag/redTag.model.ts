import { User } from "../user.model";
import { ItemActionToTake } from "./itemActionToTake.model";
import { ItemReasonTagged } from "./itemReasonTagged.model";
import { ItemType } from "./itemType.model";
import { OtherItem } from "./otherItem.model";

export class RedTag {
   id : number;
   location : string;
   reason : ItemReasonTagged;
   reasonId : number;
   action : ItemActionToTake;
   actionId : number;
   auditResponseId : number;
   item : number;
   itemType : ItemType;
   itemTypeId : number;
   otherItemType : OtherItem ;
   otherItemReason : OtherItem;
   otherItemAction : OtherItem;
   placeToMoveTo : string;
   assignedUserId : number;
   assignedUser : User;
   
}
