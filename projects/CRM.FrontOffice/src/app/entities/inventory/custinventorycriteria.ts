import { BaseEntity } from "shared/enitites";
import { InventorySearchCriteria } from "../../businessobjects";
import { CustomerDNorm } from "../customer/dnorm/customerdnorm";

export class CustInventoryCriteria extends BaseEntity {
    CretedById!: string;
    customer: CustomerDNorm;
    inventoryCriteria: InventorySearchCriteria;

    constructor() {
        super();
        this.customer = new CustomerDNorm();
        this.inventoryCriteria = new InventorySearchCriteria()
    }
}