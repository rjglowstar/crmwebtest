import { BaseEntity } from "shared/enitites";
import { CustomerDNorm } from "./dnorm/customerdnorm";

export class WatchList extends BaseEntity {
    invItemId!: string;
    invItemNumber!: string;
    oldDiscount!: number;
    customer: CustomerDNorm;
    addedAt!: Date;

    constructor() {
        super();
        this.customer = new CustomerDNorm();
    }
}