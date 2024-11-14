import { BaseEntity } from "shared/enitites";

export class StoneProposalHistory extends BaseEntity {
    stoneProposalId!: string
    customerId!: string
    action!: string
    description!: string

    constructor() {
        super();
    }
}