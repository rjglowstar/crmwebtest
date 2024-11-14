import { BaseEntity } from "shared/enitites";
import { CustomerDNorm } from "../customer/dnorm/customerdnorm";
import { BrokerDNrom } from "../organization/dnorm/brokerdnorm";
import { SystemUserDNorm } from "../organization/dnorm/systemuserdnorm";
import { SupplierDNorm } from "../supplier/dnorm/supplierdnorm";
import { InvItem } from "./base/invitem";
import { LeadSummary } from "./base/leadsummary";

export class SingularLead extends BaseEntity {
    leadNo!: number;
    customer!: CustomerDNorm;
    broker!: BrokerDNrom;
    seller!: SystemUserDNorm;
    leadInventoryItems!: InvItem;
    leadSummary: LeadSummary;
    leadStatus!: string;
    qcCriteria!: string;
    pickupLocation!: string;
    dollarRate!: number;
    platform!: string;
    supplier!: SupplierDNorm
    orderDate!: Date;
    processDate!: Date;
    orderExpiredDate!: Date;
    leadAdminFlag!: boolean;
    leadInvModification!: boolean;
    holdDate!: Date;
    leadChangePartyFlag!: boolean;
    changePartyId!: string;
    isVolDiscFlag!: boolean;
    isMobileFlag!: boolean;
    deliveredDate!: Date;

    constructor() {
        super();
        this.customer = new CustomerDNorm();
        this.broker = new BrokerDNrom();
        this.seller = new SystemUserDNorm();
        this.leadSummary = new LeadSummary();
        this.leadInventoryItems = new InvItem();
        this.supplier = new SupplierDNorm();

    }
}