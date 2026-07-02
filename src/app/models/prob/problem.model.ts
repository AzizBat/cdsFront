import{ ProblemImage } from "./problemImage.model";
import { Problems } from "./problems.model"

export class Problem {

  id : number;
  date : string;
  modifiedDate : string;
  description : string;
  type : string;
  resolutionMethod : string;
  image : string;
  images : ProblemImage[];
  creatorId : number;
  creatorName: string;
  organisationId : number;
  auditResponseId : number;
  problems : Problems;

}
