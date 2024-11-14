import { IdentityDNorm } from "../../entities/inventory/identityDNorm";
export class LabRecheckRequest {
    stoneId: string[] = [];
    isRecheck: boolean = false;
    recheckReason: string[] = [];
    identity: IdentityDNorm;

    constructor() {
        this.identity = new IdentityDNorm();
    }
}