import { BaseEntity } from "shared/enitites";
import { LeadStoneReleaseItem } from "..";
import { IdentityDNorm } from "../inventory/identityDNorm";

export class LeadStoneReleaseRequest extends BaseEntity {

    identity: IdentityDNorm
    leadStoneReleaseItems: Array<LeadStoneReleaseItem>
    constructor() {
        super();
        this.identity = new IdentityDNorm();
        this.leadStoneReleaseItems = new Array<LeadStoneReleaseItem>();
    }
}