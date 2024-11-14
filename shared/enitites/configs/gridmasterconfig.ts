import { GridDetailConfig } from "shared/businessobjects";

export class GridMasterConfig {
      id!: string
      pageName!: string
      gridName!: string
      gridDetail!: GridDetailConfig[]

      constructor() {
            this.id = "";
            this.pageName = "";
            this.gridName = "";
            this.gridDetail = [];
      }
}