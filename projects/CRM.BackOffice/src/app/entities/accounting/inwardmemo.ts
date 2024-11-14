import { BaseEntity } from "shared/enitites"
import { LogisticDNorm } from "../../businessobjects"
import { IdentityDNorm } from "../inventory/identityDNorm"
import { LedgerDNorm } from "./dnorm/ledgerdnorm"
import { MemoInvItem } from "./dnorm/memoinvitem"

export class InWardMemo extends BaseEntity {
    memoNo!: string
    party!: LedgerDNorm
    broker!: LedgerDNorm
    courierName!: LogisticDNorm
    employee!: IdentityDNorm
    inventoryItems!: MemoInvItem[]
    totalPcs!: number
    totalWeight!: number
    totalAmount!: number
    expiryDate!: Date
    isReturned!: boolean
    invStatus!: string
    returnDate!: Date    

    constructor() {
        super();
        this.party = new LedgerDNorm();
        this.broker = new LedgerDNorm();
        this.courierName = new LogisticDNorm();
        this.employee = new IdentityDNorm();
        this.inventoryItems = new Array<MemoInvItem>();
    }
}