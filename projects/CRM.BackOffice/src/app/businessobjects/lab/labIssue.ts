import { LabDNorm } from "../lab/labdnorm"
import { LogisticDNorm } from "../logistic/logisticdnorm"
import { BaseEntity } from "shared/enitites"
import { LabIssueItem } from "./labissueitem"
import { IdentityDNorm } from "../../entities/inventory/identityDNorm"

export class LabIssue extends BaseEntity {
    lab: LabDNorm
    logistic: LogisticDNorm
    labIssueItems: LabIssueItem[]
    dollarRate!: number;
    identity: IdentityDNorm

    constructor() {
        super();
        this.lab = new LabDNorm();
        this.logistic = new LogisticDNorm();
        this.labIssueItems = [];
        this.identity = new IdentityDNorm();        
    }
}