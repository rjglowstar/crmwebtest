import { SystemUserDNorm } from "../../entities"

export class CustomerActiveData {
    fullName!: string
    companyName!: string
    createDate!: Date
    City!: string
    country!: string
    seller: SystemUserDNorm
    constructor() {
        this.seller = new SystemUserDNorm();
    }
}