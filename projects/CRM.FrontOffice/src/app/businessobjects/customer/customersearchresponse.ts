import { Customer } from "../../entities";

export class CustomerSearchResponse {
      customers: Customer[];
      totalCount: number;

      constructor() {
            this.customers = [];
            this.totalCount = 0;
      }
}