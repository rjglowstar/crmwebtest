import { Address, CreditLimit } from "shared/businessobjects"
import { BaseEntity } from "shared/enitites"
import { Branch, Department } from ".."

export class Organization extends BaseEntity {
      name!: string
      origin!: string
      organizationType!: string
      businessType!: string
      registrationNo!: string
      incomeTaxNo!: string
      taxNo!: string
      iecNo!: string
      code!: string
      membership!: string
      address: Address
      website!: string
      creditLimit: CreditLimit
      branches!: Branch[]
      departments!: Department[]
      person!: string
      email!: string
      mobileNo!: string
      phoneNo!: string
      faxNo!: string
      gstNo!: string

      salesApi!: string
      priceApi!: string
      mediaApi!: string

      constructor() {
            super();
            this.branches = [];
            this.departments = [];
            this.address = new Address();
            this.creditLimit = new CreditLimit();
      }

}