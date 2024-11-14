import { CustomerLoginHistory } from "../../entities";

export class CustomerLoginHistoryResponse {
    customerLoginHistorys: CustomerLoginHistory[]    
    totalCount!: number   

    constructor() {
        this.customerLoginHistorys = [];       
    }
}