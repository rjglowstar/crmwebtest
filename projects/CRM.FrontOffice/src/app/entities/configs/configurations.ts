import { BaseEntity } from "shared/enitites"
import { SystemUser } from "../organization/systemuser"
import { APIConfiguration } from "./apiConfiguration"
import { CurrencyType } from "./currencyType"
import { EmailConfiguration } from "./emailconfiguration"
import { EmailCredential } from "./emailcredential"
import { RejectedOfferCriteria } from "./rejectedOfferCriteria"

export class Configurations extends BaseEntity {
    allowBidHistory!: boolean | null
    newDiamondsDays!: number
    inActiveAccountMonth!: number
    removeDiamondsCartMinutes!: number
    showVOWDiscount!: boolean | null
    emailCredential: EmailCredential
    emailConfiguration: EmailConfiguration
    apiConfiguration: APIConfiguration
    currencyTypes!: CurrencyType[]
    adminUser: SystemUser
    custVerificationUser: SystemUser
    addDiscountUser: SystemUser
    leadPartyChangeUser: SystemUser
    leadRejectedUser: SystemUser
    salesOrderCancelUser: SystemUser
    custNameChangeUser: SystemUser
    rejectedOfferCriteriaes!: RejectedOfferCriteria[]

    constructor() {
        super();
        this.allowBidHistory = false;
        this.showVOWDiscount = false;
        this.emailCredential = new EmailCredential();
        this.emailConfiguration = new EmailConfiguration();
        this.apiConfiguration = new APIConfiguration();
        this.currencyTypes = [];
        this.adminUser = new SystemUser();
        this.custVerificationUser = new SystemUser();
        this.addDiscountUser = new SystemUser();
        this.leadPartyChangeUser = new SystemUser();
        this.leadRejectedUser = new SystemUser();
        this.salesOrderCancelUser = new SystemUser();
        this.custNameChangeUser = new SystemUser();
    }
}