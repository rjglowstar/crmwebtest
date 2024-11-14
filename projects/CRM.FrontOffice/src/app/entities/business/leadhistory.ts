import { BaseEntity } from "shared/enitites";
import { CustomerDNorm } from "../customer/dnorm/customerdnorm";
import { BrokerDNrom } from "../organization/dnorm/brokerdnorm";
import { SystemUserDNorm } from "../organization/dnorm/systemuserdnorm";

export class LeadHistory extends BaseEntity {
    leadId!: string;
    leadNo!: number;
    action!: string;
    description!: string;
    customer!: CustomerDNorm;
    broker!: BrokerDNrom;
    seller!: SystemUserDNorm;
    createdDate!: Date;
    isSelected!: boolean;
    stoneIds!: string[];

    constructor() {
        super();
        this.stoneIds = [];
        this.customer = new CustomerDNorm();
        this.broker = new BrokerDNrom();
        this.seller = new SystemUserDNorm();
    }

}
