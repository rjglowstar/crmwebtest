export class LabexpenseSearchCriteria {   
    stoneIds: string[];
    certificateNos: string[];
    invoiceNo!: string;
    jobNo!: string;
    controlNo!: string;
    service!: string;
    labName!: string;
    from?: Date | null;
    to?: Date | null;

    constructor() {     
        this.stoneIds = new Array<string>();
        this.certificateNos = new Array<string>();  
    }
}