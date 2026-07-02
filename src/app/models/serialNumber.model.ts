import {Product} from "./product.model";
import {Audit} from "./audit.model";
import {Defects} from "./defects.model";

export class SerialNumber {

  id : number;
  name : string;
  referenceMatiere : string;
  batchNumber : string;
  archived : boolean;
  deleted : boolean;
  product : Product;
  defects : Defects;
  audits : Audit[];
  SerialNumberClasse : string
  inspectionStep : string
  organisationId : number;
  createdDate: string;
  createdBy  : string;
  lastmodifiedDate : string
  lastModifiedBy : string;
}

