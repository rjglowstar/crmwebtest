import { BaseEntity } from "shared/enitites";
import { SystemUserDNorm } from "../organization/dnorm/systemuserdnorm";
import { SupplierDNorm } from "../supplier/dnorm/supplierdnorm";
import { InvItem } from "./base/invitem";
import { MemoRequestCustomer } from "./base/memorequestcustomer";

export class QcRequest extends BaseEntity {

    leadId!: string;
    leadNo!: number;
    customer!: MemoRequestCustomer;
    seller!: SystemUserDNorm;
    qcStoneIds!: Array<InvItem>;
    supplier!: SupplierDNorm
    isRequest!: boolean

    constructor() {
        super();
        this.customer = new MemoRequestCustomer();
        this.seller = new SystemUserDNorm();
        this.supplier = new SupplierDNorm();
        this.qcStoneIds = new Array<InvItem>();
    }
}