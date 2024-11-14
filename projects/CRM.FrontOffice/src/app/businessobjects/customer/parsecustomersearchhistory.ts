import { CustomerDNorm } from "../../entities";

export class ParseCustomerSearchHistory {
    customer: CustomerDNorm
    searchQuery!: any
    searchStoneIds: string[]
    createdDate!: Date

    constructor() {
        this.customer = new CustomerDNorm();
        this.searchStoneIds = [];
    }
}