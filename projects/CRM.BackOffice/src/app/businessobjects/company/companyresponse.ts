import { Company } from "../../entities";
export class CompanyResponse {
      companys: Company[];
      totalCount: number;

      constructor() {
            this.companys = [];
            this.totalCount = 0;
      }
}