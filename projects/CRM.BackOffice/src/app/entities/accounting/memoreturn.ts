import { BaseEntity } from "shared/enitites"
import { OrganizationDNorm } from "../../businessobjects"
import { IdentityDNorm } from "../inventory/identityDNorm"
import { LedgerDNorm } from "./dnorm/ledgerdnorm"
import { MemoInvReturnItem } from "./dnorm/memoinvreturnitem"
import { BankDNorm } from "./bankdnorm"

export class Memoreturn extends BaseEntity {
    memoReturnNo!: string
    party!: LedgerDNorm    
    employee!: IdentityDNorm
    returnInvItems!: MemoInvReturnItem[]
    totalPcs!: number
    totalWeight!: number
    totalAmount!: number   
    organization: OrganizationDNorm; 
    cifCityName!: string;
    bank: BankDNorm;

    constructor() {
        super();
        this.party = new LedgerDNorm();         
        this.employee = new IdentityDNorm();
        this.returnInvItems = new Array<MemoInvReturnItem>();
        this.organization = new OrganizationDNorm();
        this.bank = new BankDNorm();
    }
}