import { BaseEntity } from "shared/enitites";
import { InvDistribution } from "..";

export class BusinessConfig extends BaseEntity {
    qcReasons: string[];
    removeStoneReasons: string[];
    invDistributions: InvDistribution[];

    constructor() {
        super();
        this.qcReasons = new Array<string>();
        this.removeStoneReasons = new Array<string>();
        this.invDistributions = new Array<InvDistribution>();
    }
}