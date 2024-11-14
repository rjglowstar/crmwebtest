import { Address } from "shared/businessobjects"

export class SystemUserDNorm {
    id!: string
    name!: string
    mobile!: string
    email!: string
    address!: Address

    constructor() { }
}
