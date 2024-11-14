export class AppointmentSearchCriteria {
    customerid!: string;
    stoneIds: string[];
    createdfromDate?: Date | null;
    createdtoDate?: Date | null;
    approvedfromDate?: Date | null;
    approvedtoDate?: Date | null;

    constructor() {
        this.stoneIds = [];
        this.createdfromDate = null;
        this.createdtoDate = null;
        this.approvedfromDate = null;
        this.approvedtoDate = null;
    }
}