import { TaxType } from "../taxType"

export class TransactItemDNorm {
    id!: string
    name!: string
    unit!: string
    group!: string
    taxTypes: TaxType[]

    constructor() {
        this.taxTypes = new Array<TaxType>();
     }
}