import { Address } from "shared/businessobjects"
import { BaseEntity } from "shared/enitites/common/baseentity"

export class Supplier extends BaseEntity {
      name!: string
      registrationNo!: string
      incomeTaxNo!: string
      taxNo!: string
      code!: string
      membership!: string
      address: Address
      website!: string
      person!: string
      email!: string
      mobileNo!: string
      phoneNo!: string
      faxNo!: string
      apiPath!: string

      constructor() {
            super();           
            this.address = new Address();            
      }
}