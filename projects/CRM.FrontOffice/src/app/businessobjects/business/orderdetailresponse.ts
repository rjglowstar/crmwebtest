import { CustomerDNorm, InvItem, LeadSummary, PriceDNorm, SupplierDNorm, SystemUserDNorm } from "../../entities";
import { BrokerDNorm } from "../organizations/brokerdnorm";

export class OrderDetailResponse {
    leadId!:string
    leadNo!: number
    stoneId!:string
    customer!: CustomerDNorm
    broker!: BrokerDNorm
    seller!: SystemUserDNorm
    leadInventoryItems!: InvItem
    leadSummary!: LeadSummary
    leadStatus!: string
    orderDate?: Date
    orderExpiredDate?: Date
    holdDate?: Date
    qcCriteria!: string
    supplier!: SupplierDNorm
    processDate?: Date
    dollarRate?: number

    //Extra Fields
    days!: number
    availableDays!: number
    iGrade!: string
    mGrade!: string
    basePrice!: PriceDNorm
    price!:PriceDNorm
    createdDate!:Date
    location!:string

    finalDisc!:number
    vowDiff!:number

    constructor() {
        this.customer = new CustomerDNorm();
        this.broker = new BrokerDNorm();
        this.seller = new SystemUserDNorm();
        this.leadInventoryItems = new InvItem();
        this.leadSummary = new LeadSummary();
        this.supplier = new SupplierDNorm();
        this.basePrice = new PriceDNorm();
        this.price = new PriceDNorm();
    }
}