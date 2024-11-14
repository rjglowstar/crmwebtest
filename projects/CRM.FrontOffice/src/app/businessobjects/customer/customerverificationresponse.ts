import { RegisterCustomer } from "../../entities";
export class CustomerVerificationResponse {
      customers: RegisterCustomer[];
      totalCount: number;

      constructor() {
            this.customers = new Array<RegisterCustomer>();
            this.totalCount = 0;
      }
}