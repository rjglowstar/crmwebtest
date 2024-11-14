import { CustomerDNorm, SystemUserDNorm } from "../../entities";

export class StoneProposalMailData {
    token!: string
    cutomer!: CustomerDNorm
    systemUser!: SystemUserDNorm
    criteriaJson!: string
    stoneIds!: string[]
    subject!: string
    body!: string
    templatePath!: string
    proposalUrl!: string
    aDiscount!: number
    companyname!:string
    customerDNorms!: CustomerDNorm[]

    constructor() {
        this.cutomer = new CustomerDNorm();
        this.systemUser = new SystemUserDNorm();
        this.stoneIds = [];
        this.customerDNorms = [];
    }

}