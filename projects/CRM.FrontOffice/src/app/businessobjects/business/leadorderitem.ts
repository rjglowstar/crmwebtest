import { BrokerDNrom, CustomerDNorm, LeadSummary, SystemUserDNorm } from "../../entities";

export class LeadOrderItem {
    id!:string
    leadNo!: number;
    customer!: CustomerDNorm;
    broker!: BrokerDNrom;
    seller!: SystemUserDNorm;
    leadSummary: LeadSummary;
    leadStatus!: string;
    pickupLocation!: string;
    platform!: string;
    orderDate!:Date;
    processDate!:Date;
    ccRate!: number;
    ccType!: string;

    constructor() {
        this.customer = new CustomerDNorm();
        this.broker = new BrokerDNrom();
        this.seller = new SystemUserDNorm();
        this.leadSummary = new LeadSummary();
    }
}