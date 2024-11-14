import { BaseEntity } from "shared/enitites"

export class BrokerDNorm extends BaseEntity {
  brokrage!: number
  refCompanyName!: string  
  refPersonName!: string  
  refemail!: string
  refmobileNo!: string  
  refAddress!: string      

  constructor() { 
    super();   
  }
}