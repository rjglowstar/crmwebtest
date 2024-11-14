import { LabLabour } from "./lablabour";

export class LabConfig {
      labAPI!: string
      labLabours!: LabLabour[]

      constructor() {
            this.labAPI = "";
            this.labLabours = new Array<LabLabour>();
      }
}