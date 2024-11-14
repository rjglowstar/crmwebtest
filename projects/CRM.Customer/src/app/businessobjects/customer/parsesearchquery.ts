import { CustomerInvSearchCriteria } from "../inventory/customerinvsearchcriteria";

export class ParseSearchQuery {
    name!: string;
    query!: CustomerInvSearchCriteria;
    expiryDate!: Date | null;
    createdAt!: Date | null;
    updatedAt!: Date | null;

    constructor() {
        this.query = new CustomerInvSearchCriteria()
    }
}