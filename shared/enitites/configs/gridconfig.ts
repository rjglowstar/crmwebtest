import { GridDetailConfig } from "shared/businessobjects"

export class GridConfig {
      id!: string
      empID!: string
      pageName!: string
      gridName!: string
      gridDetail!: GridDetailConfig[]

      constructor() {
            this.id = "";
            this.empID = "";
            this.pageName = "";
            this.gridName = "";
            this.gridDetail = [];
      }
}