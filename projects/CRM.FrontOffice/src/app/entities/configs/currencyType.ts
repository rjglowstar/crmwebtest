export class CurrencyType {
    id!: string
    fromCurrency!: string
    fromRate!: number
    toCurrency!: string
    toRate!: number

    constructor() {
        this.fromRate = 1;
    }

}