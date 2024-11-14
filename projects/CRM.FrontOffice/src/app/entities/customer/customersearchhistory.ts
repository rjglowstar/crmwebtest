import { BaseEntity } from "shared/enitites";
import { CustomerDNorm } from "./dnorm/customerdnorm";

export class CustomerSearchHistory extends BaseEntity {
    customer: CustomerDNorm
    searchQuery!: string
    searchStoneIds: string[]

    constructor() {
        super();
        this.customer = new CustomerDNorm();
        this.searchStoneIds = [];
    }
}