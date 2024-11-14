import { IdentityDNorm } from "../../entities/inventory/identityDNorm"
export class LabReceiveItem {
    labIssueID!: string
    stoneId!: string
    boxSerialNo!: string
    isReceived?: boolean
    identity: IdentityDNorm
    organizationLocation!: string
    isLabResultFound!: boolean

    constructor() {
        this.identity = new IdentityDNorm();
    }
}