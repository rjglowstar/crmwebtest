import { BaseEntity } from "shared/enitites";
import { LeadStatus } from "shared/services";
import { SystemUserDNorm } from "../organization/dnorm/systemuserdnorm";
import { CustomerDNorm } from "../customer/dnorm/customerdnorm";
import { BrokerDNrom } from "../organization/dnorm/brokerdnorm";
import { LeadSummary } from "./base/leadsummary";
import { InvItem } from "./base/invitem";
import { SupplierDNorm } from "../supplier/dnorm/supplierdnorm";

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
    isMobileFlag: boolean;
    deliveredDate!: Date;
    isAILeadGenerated : boolean;
    constructor() {
        super();
        this.customer = new CustomerDNorm();
        this.broker = new BrokerDNrom();
        this.seller = new SystemUserDNorm();
        this.leadSummary = new LeadSummary();
        this.leadInventoryItems = new Array<InvItem>();
        this.supplier = new SupplierDNorm();
        this.leadStatus = LeadStatus.Proposal.toString();
        this.platform = "offline";
        this.leadAdminFlag = null as any;
        this.leadChangePartyFlag = null as any;
        this.leadInvModification = true;
        this.isVolDiscFlag = false;
        this.isMobileFlag = false;
        this.isAILeadGenerated = false;
    }

}
