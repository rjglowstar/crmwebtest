import { SalesSheet } from "./salessheet"

export class SalesSheetResponse {
    salesSheet: SalesSheet[]
    counts!: number

    constructor() {
        this.salesSheet = [];
    }
}