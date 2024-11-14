import { BaseEntity } from "shared/enitites";
import { BrokerDNrom } from "../organization/dnorm/brokerdnorm";
import { SystemUserDNorm } from "../organization/dnorm/systemuserdnorm";
import { SupplierDNorm } from "../supplier/dnorm/supplierdnorm";
import { InvItem } from "./base/invitem";
import { MemoRequestCustomer } from "./base/memorequestcustomer";

export class MemoRequest extends BaseEntity {

    leadId!: string;
    leadNo!: number;
    customer!: MemoRequestCustomer;
    broker!: BrokerDNrom;
    seller!: SystemUserDNorm;
    memoStoneIds!: Array<InvItem>;
    supplier!: SupplierDNorm
    isRequest!: boolean
    rate!: number

    constructor() {
        super();
        this.customer = new MemoRequestCustomer();
        this.seller = new SystemUserDNorm();
        this.supplier = new SupplierDNorm();
        this.memoStoneIds = new Array<InvItem>();
    }
}