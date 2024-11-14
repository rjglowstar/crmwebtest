import { LabExpense } from '..';

export class LabexpenseSearchResponse {
    labExpense: LabExpense[]    
    totalCount!: number   

    constructor() {
        this.labExpense = [];       
    }
}