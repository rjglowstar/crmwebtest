import { BaseEntity } from "shared/enitites";
import { SystemUserDNorm } from "../organization/dnorm/systemuserdnorm";
import { CustomerDNorm } from "../customer/dnorm/customerdnorm";
export class StoneProposal extends BaseEntity {
    token!: string
    cutomer!: CustomerDNorm
    systemUser!: SystemUserDNorm
    criteriaJson!: string
    stoneIds!: string[]
    selectedStoneIds!: string[]
    proposalUrl!: string
    aDiscount!: number

    constructor() {
        super();
        this.cutomer = new CustomerDNorm();
        this.systemUser = new SystemUserDNorm();
        this.stoneIds = [];
        this.selectedStoneIds = [];
    }
}