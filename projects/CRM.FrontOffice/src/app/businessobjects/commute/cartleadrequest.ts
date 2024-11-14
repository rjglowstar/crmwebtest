export class CartLeadRequest {
    status!: string
    items!: Array<CartLeadItems>
    customerName!: string
    email!: string
    webFrom!: string
    weeklyDisc!: number
    orderId!: number
    orderDate!: Date
    pickupLocation!: string

    constructor() { }
}

export class CartLeadItems {
    stoneId!: string
    discount!: number

    constructor() { }
}