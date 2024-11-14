import { Logistic } from "../../entities";

export class LogisticResponse {
      logistics: Logistic[];
      totalCount: number;

      constructor() {
            this.logistics = [];
            this.totalCount = 0;
      }
}