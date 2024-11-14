import { BaseEntity } from "shared/enitites"
import { CustomerDNorm } from "./dnorm/customerdnorm"

export class CustomerCriteria extends BaseEntity {
  customer: CustomerDNorm
  shape!: string[]
  lab!: string[]
  minWeight!: number
  maxWeight!: number
  color!: string[]
  clarity!: string[]
  cut!: string[]
  polish!: string[]
  symmetry!: string[]
  fluorescence!: string[]
  minDiscount!: number
  maxDiscount!: number
  minDepth!: number
  maxDepth!: number
  minTable!: number
  maxTable!: number
  minCrownAngle!: number
  maxCrownAngle!: number
  minPavillionAngle!: number
  maxPavillionAngle!: number

  //Extra
  isCheck!: boolean

  constructor() {
    super();
    this.customer = new CustomerDNorm();
    this.shape = [];
    this.lab = [];
    this.color = [];
    this.clarity = [];
    this.cut = [];
    this.polish = [];
    this.symmetry = [];
    this.fluorescence = [];
  }
}