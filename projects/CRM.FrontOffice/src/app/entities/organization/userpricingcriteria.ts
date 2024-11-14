import { BaseEntity } from 'shared/enitites/common/baseentity'
import { SystemUserDNorm } from './dnorm/systemuserdnorm'

export class UserPricingCriteria extends BaseEntity {
  systemUser: SystemUserDNorm
  name!: string
  shape!: string[]
  lab!: string[]
  minWeight!: number
  maxWeight!: number
  color!: string[]
  clarity!: string[]
  cps!: string[]
  cut!: string[]
  polish!: string[]
  symmetry!: string[]
  fluorescence!: string[]
  minDay!: number
  maxDay!: number
  organizations!: string[]
  upLimit!: number
  downLimit!: number

  constructor() {
    super();
    this.systemUser = new SystemUserDNorm();
    this.shape = [];
    this.lab = [];
    this.color = [];
    this.clarity = [];
    this.cps = [];
    this.cut = [];
    this.polish = [];
    this.symmetry = [];
    this.fluorescence = [];
    this.organizations = [];
  }
}