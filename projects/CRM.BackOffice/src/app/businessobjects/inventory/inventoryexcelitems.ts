export class InventoryExcelItems {

      // InvItems
      stoneId!: string
      kapan!: string
      article!: string
      shape!: string
      shapeRemark!: string
      weight!: number
      color!: string
      clarity!: string
      cut!: string
      polish!: string
      symmetry!: string
      fluorescence!: string
      cps!: string
      rap?: number
      discount?: number
      netAmount?: number
      perCarat?: number
      comments!: string
      kapanOrigin!: string
      bgmComments!: string
      status!: string
      //InvItem Measurement
      depth!: number
      table!: number
      length!: number
      width!: number
      height!: number
      crownHeight!: number
      crownAngle!: number
      pavilionDepth!: number
      pavilionAngle!: number
      girdlePer!: number
      minGirdle!: string
      maxGirdle!: string
      ratio!: number
      //StoneOrgDNorm
      empId!: string
      empName!: string
      orgId!: string
      orgName!: string
      orgCode!: string
      deptId!: string
      deptName!: string
      branchName!: string
      country!: string
      city!: string
      // temp
      isDisabled?: boolean
      isPriceAvailable?: boolean
      returnDate?: Date | null
      purchaseDate?: Date | null
      //marketsheet Upload
      lab!: string
      certificateNo!: string
      certiType!: string
      flColor!: string
      ktoS!: string
      inscription!: string
      inWardFlag!: string | null
      boxSerialNo!: string

      srNo!: number

      constructor() {
            this.inWardFlag = null;
      }
}