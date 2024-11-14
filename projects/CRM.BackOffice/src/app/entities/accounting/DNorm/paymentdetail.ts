export class PaymentDetail {
    paymentType!: string
    chequeNo!: string
    chequeDate!: Date
    etRefNo!: string
    paymentMethod!: string
    interestPer!: number
    interestAmount!: number

    cashHandlingCharge!: number
    logisticCharge!: number
    expence!: number

    selectedTransactionId: string[]

    constructor() {
        this.selectedTransactionId = [];
    }
}