import { BaseEntity } from "shared/enitites";
import { CustomerDNorm } from "../customer/dnorm/customerdnorm";
import { BrokerDNrom } from "../organization/dnorm/brokerdnorm";
import { LeadSummary } from "./base/leadsummary";
import { SystemUserDNorm } from "../organization/dnorm/systemuserdnorm";
import { SupplierDNorm } from "../organization/dnorm/supplierdnorm";
import { InvItem } from "../../businessobjects/businesses/invitem";
import { LeadStatus } from "shared/services/common/staticlookup.service";

export class Lead extends BaseEntity {
    leadNo!: number;
    customer!: CustomerDNorm;
    broker!: BrokerDNrom;
    seller!: SystemUserDNorm;
    leadInventoryItems!: InvItem[];
    leadSummary: LeadSummary;
    leadStatus!: string;
    qcCriteria!: string;
    pickupLocation!: string;
    platform: string;
    supplier!: SupplierDNorm
    orderDate!: Date;
    processDate!: Date;
    orderExpiredDate!: Date;
    leadAdminFlag: boolean;
    leadInvModification: boolean;
    holdDate!: Date;
    leadChangePartyFlag: boolean;
    changePartyId!: string;
    isVolDiscFlag: boolean;
    deliveredDate!: Date;
    isMobileFlag: boolean;


    constructor() {
        super();
        this.customer = new CustomerDNorm();
        this.broker = new BrokerDNrom();
        this.seller = new SystemUserDNorm();
        this.leadSummary = new LeadSummary();
        this.leadInventoryItems = new Array<InvItem>();
        this.supplier = new SupplierDNorm();
        this.leadStatus = LeadStatus.Hold.toString();
        this.platform = "online";
        this.leadAdminFlag = null as any;
        this.leadChangePartyFlag = null as any;
        this.leadInvModification = true;
        this.isVolDiscFlag = true;
        this.isMobileFlag = false;
    }

}
