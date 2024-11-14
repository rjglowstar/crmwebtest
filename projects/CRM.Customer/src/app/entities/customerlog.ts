import { BaseEntity } from "shared/enitites"
import { CustomerDNorm } from "./customer/dnorm/customerdnorm"

export class CustomerLog extends BaseEntity {
    type!: string
    customer: CustomerDNorm
    page!: string
    method!: string
    data!: string
    ipAddress!: string

    constructor() {
        super();
        this.customer = new CustomerDNorm();
    }
}