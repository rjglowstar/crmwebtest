import { BaseEntity } from "shared/enitites";
import { SupplierDNorm } from "../supplier/dnorm/supplierdnorm";
import { PriceDNorm } from "../inventory/priceDNorm";

export class InvHistory extends BaseEntity {
    stoneId!: string;
    leadId!: string;
    invId!: string;
    leadNo!: number;
    status!: string;
    action!: string;
    userName!: string;
    description!: string;
    price!: PriceDNorm;
    supplier!: SupplierDNorm;

    constructor() {
        super();
        this.price = new PriceDNorm();
        this.supplier = new SupplierDNorm();
    }

}
