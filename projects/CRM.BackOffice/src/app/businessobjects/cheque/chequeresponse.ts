import { ChequeReconciliation } from "../../entities";
export class ChequeResponse {
      chequeReconciliations: ChequeReconciliation[];
      totalCount: number;

      constructor() {
            this.chequeReconciliations = [];
            this.totalCount = 0;
      }
}