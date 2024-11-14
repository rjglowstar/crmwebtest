import { CountdownConfig } from "ngx-countdown";
import { LeadStatus } from "shared/services";
import { BrokerDNrom, CustomerDNorm, LeadSummary, SystemUserDNorm } from "../../entities";

export class LeadResponse {
    id!: string;
    leadNo!: number;
    customer!: CustomerDNorm;
    broker!: BrokerDNrom;
    seller!: SystemUserDNorm;
    leadSummary: LeadSummary;
    leadStatus!: string;
    expiredDays: number = 0;
    createdDate!: Date;
    daysLeft: number = 0;
    platform!: string;
    pickUpLocation!: string;
    qcCriteria!: string;
    orderExpiredDate!: Date;
    orderDate!: Date;
    holdDate!: Date;
    leadAdminFlag: boolean;
    leadInvModification: boolean;
    isVolDiscFlag!: boolean;
    processDate!: Date;
    config?: CountdownConfig;
    changePartyId!: string;
    leadChangePartyFlag!: boolean;
    isMobileFlag: boolean;
    isAILeadGenerated!:Boolean;

    constructor() {
        this.customer = new CustomerDNorm();
        this.broker = new BrokerDNrom();
        this.seller = new SystemUserDNorm();
        this.leadSummary = new LeadSummary();
        this.leadStatus = LeadStatus.Proposal.toString();
        this.leadNo = 1000000;
        this.leadAdminFlag = null as any;
        this.leadInvModification = true;
        this.isVolDiscFlag = true;
        this.isMobileFlag = false;
    }
}