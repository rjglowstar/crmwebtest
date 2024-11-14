import { BaseEntity } from "shared/enitites";

export class LabServiceType extends BaseEntity {
  labName!: string 
  service!: string
  serviceCode!: string 
  action!: string

  constructor() {
    super();   
  }
}