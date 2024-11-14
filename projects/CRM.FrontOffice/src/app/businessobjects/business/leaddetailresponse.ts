import { SingularLead } from "../../entities";

export class LeadDetailResponse {
    singularLeads: Array<SingularLead>;
    totalCount: number;

    constructor() {
        this.singularLeads = new Array<SingularLead>();
        this.totalCount = 0;
    }
}