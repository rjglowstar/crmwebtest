import { CustomerDNorm } from "../../entities/customer/dnorm/customerdnorm"

export class ParseCustomerSearchHistory {
    id!: string
    customer: CustomerDNorm
    searchQuery!: any
    searchStoneIds: string[]
    createdDate!: Date

    constructor() {
        this.customer = new CustomerDNorm();
        this.searchStoneIds = [];
    }
}