import { Address } from "shared/businessobjects"
import { OrganizationDNorm } from "../../businessobjects"

export class EmployeeDNorm {
    id!: string
    name!: string
    department!: string
    departmentId!: string
    organization!: OrganizationDNorm
    branch!: string
    mobile!: string
    email!: string
    address!: Address

    constructor() {
        this.organization = new OrganizationDNorm();
        this.address = new Address();
    }
}