import { ItemType } from "./itemType.model";

export class Item {

    id : number;
    name : string;
    description : string;
    illustrationUri : string;
    itemType : ItemType;
    itemTypeId : number;

}
