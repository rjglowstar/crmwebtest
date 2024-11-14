import { CustomerSearchHistory } from "../../entities";

export class CustomerSearchHistoryResponse {
    customerSearchHistories: CustomerSearchHistory[];
    totalCount: number;

    constructor() {
        this.customerSearchHistories = [];
        this.totalCount = 0;
    }
}