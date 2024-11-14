import { Address } from "shared/businessobjects"
import { BaseEntity } from "shared/enitites"

export class Broker extends BaseEntity {
  name!: string
  code!: string
  brokrage!: number
  mobileNo!: string
  email!: string
  address!: Address
  incomeTaxNo!: string
  refCompanyName!: string
  refPersonName!: string
  refemail!: string
  refmobileNo!: string
  refAddress!: string
  isActive!: boolean

  constructor() {
    super();
    this.address = new Address();
  }
}