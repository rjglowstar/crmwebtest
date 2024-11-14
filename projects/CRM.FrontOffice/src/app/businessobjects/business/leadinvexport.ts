
export class LeadInvExport {
    leadId!: string;
    leadNo!: number;
    invIds: Array<string>

    constructor() {
        this.invIds = new Array<string>();
    }
}