import { BaseEntity } from "shared/enitites"
import { CustomerDNorm } from "./dnorm/customerdnorm"

export class CustomerCriteria extends BaseEntity {
  customer: CustomerDNorm
  location!: string[]
  shape!: string[]
  lab!: string[]
  minWeight!: number
  maxWeight!: number
  color!: string[]
  clarity!: string[]
  cut!: string[]
  polish!: string[]
  symmetry!: string[]
  cps!: string[]
  fluorescence!: string[]
  minDiscount!: number
  maxDiscount!: number
  minDepth!: number
  maxDepth!: number
  minTable!: number
  maxTable!: number
  fromLength!: number
  toLength!: number
  fromWidth!: number
  toWidth!: number
  fromHeight!: number
  toHeight!: number
  minCrownAngle!: number
  maxCrownAngle!: number
  minPavillionAngle!: number
  maxPavillionAngle!: number
  minPrice!: number
  maxPrice!: number
  country: string[]
  supplier: string[]
  brown: string[]
  green: string[]
  milky: string[]
  shade: string[]
  sideBlack: string[]
  centerBlack: string[]
  sideWhite: string[]
  centerWhite: string[]
  openCrown: string[]
  openTable: string[]
  openPavilion: string[]
  openGirdle: string[]
  girdleCondition: string[]
  efoc: string[]
  efot: string[]
  efog: string[]
  efop: string[]
  culet: string[]
  hna: string[]
  eyeClean: string[]
  ktoS: string[]
  naturalOnTable: string[]
  naturalOnGirdle: string[]
  naturalOnCrown: string[]
  naturalOnPavillion: string[]
  fLColor: string[]
  graining: string[]
  redSpot: string[]
  luster: string[]
  bowtie: string[]
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
    this.cps = [];
    this.fluorescence = [];
    this.supplier = [];
    this.country = [];
    this.brown = [];
    this.green = [];
    this.milky = [];
    this.shade = [];
    this.sideBlack = [];
    this.centerBlack = [];
    this.sideWhite = [];
    this.centerWhite = [];
    this.openCrown = [];
    this.openTable = [];
    this.openPavilion = [];
    this.openGirdle = [];
    this.girdleCondition = [];
    this.efoc = [];
    this.efot = [];
    this.efog = [];
    this.efop = [];
    this.culet = [];
    this.hna = [];
    this.eyeClean = [];
    this.ktoS = [];
    this.naturalOnTable = [];
    this.naturalOnGirdle = [];
    this.naturalOnCrown = [];
    this.naturalOnPavillion = [];
    this.fLColor = [];
    this.graining = [];
    this.redSpot = [];
    this.luster = [];
    this.bowtie = [];
  }
}