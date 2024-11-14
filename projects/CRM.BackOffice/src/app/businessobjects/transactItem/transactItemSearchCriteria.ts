import { TaxType, TransactItemGroup } from "../../entities"

export class TransactItemSearchCriteria {
    name!: string
    group!: TransactItemGroup
    tax !: TaxType


    constructor() { }
}