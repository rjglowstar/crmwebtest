import { TransactItemDNorm } from "./transactitemdnorm"

export class TransactionItem {
    id!: string
    item: TransactItemDNorm
    quantity!: number
    rate!: number
    weight!: number
    amount!: number
    discPerc!: number
    discount!: number
    taxAmount!: number
    total!: number

    //extra
    index!: string

    constructor() {
        this.item = new TransactItemDNorm();
    }
}