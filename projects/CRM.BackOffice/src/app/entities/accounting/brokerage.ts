import { BaseEntity } from "shared/enitites"

export class Brokerage extends BaseEntity {

    transactionId!: string
    transactionNumber!: string
    transactionAmt!: number
    transactionNetAmt!: number
    transactionCCType!: string
    transactionCCRate!: number
    transactionDate!: Date
    receiptId!: string
    receiptNumber!: string
    receiptDate!: Date
    partyId!: string
    partyName!: string
    brokerId!: string
    brokerName!: string
    brokerAmt!: number
    brokerCCAmt!: number
    paidAmount!: number
    paidDate!: Date;

    constructor() {
        super()
    }
}