export class MfgPricingResponse {
    id!: string;
    lab!: string
    rap!: number
    dcaret!: number
    discount!: number
    oAmount!: number
    amount!: number
    masterDiscount!: number
    additionalDiscount!: number
    mfgDiscount!: number
    labLabour!: number
    productionLabour!: number
    divisionFactor!: number
    inclusionGrade?: any
    inclusionDiscount!: number
    measurementGrade?: any
    measurementDiscount!: number
    orderDetail: []
    error?: any

    constructor() {
        this.orderDetail = []
     }
}