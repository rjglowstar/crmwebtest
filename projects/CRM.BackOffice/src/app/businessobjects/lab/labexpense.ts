import { IdentityDNorm } from "../../entities/inventory/identityDNorm"
import { LabDNorm } from "../lab/labdnorm"
import { BaseEntity } from "shared/enitites"

export class LabExpense extends BaseEntity {
    stoneId!: string
    certificateNo!: string
    invoiceNo!: string
    invoiceDate!: Date | null
    jobNo!: string
    controlNo!: string
    service!: string
    labFees!: number
    handlingCharge!: number
    shippingCharge!: number
    taxAmount!: number
    lab: LabDNorm
    identity: IdentityDNorm
    fromCurrency!: string
    fromRate!: number
    toCurrency!: string
    toRate!: number
    totalExpense!: number;

    //Extra 
    invoiceAmount!: number | null;
    labName!: string; 

    constructor() {
        super();
        this.lab = new LabDNorm();
        this.identity = new IdentityDNorm();
    }
}