import { BaseEntity } from "shared/enitites";
import { LabIssueItem } from "./labissueitem";
import { IdentityDNorm } from "../../entities/inventory/identityDNorm";

export class LabReCheck extends BaseEntity {

    labRecheckItem: LabIssueItem;
    isRecheck: boolean = false;
    recheckReason!: string[];
    identity: IdentityDNorm;

    constructor() {
        super();
        this.identity = new IdentityDNorm();
        this.labRecheckItem = new LabIssueItem();
    }
}