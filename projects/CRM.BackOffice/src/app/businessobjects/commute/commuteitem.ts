import { RfidCommuteItem } from "./rfidcommuteitem";

export class CommuteItem {
    organizationCode!: string;
    status!: string;
    isHold!: boolean;
    isMemo!: boolean;
    isLabReturn!: boolean;
    stoneIds: string[];
    rfidCommuteItem: RfidCommuteItem[];
    customerId!: string;
    brokerId!: string;
    location!:string;

    constructor() {
        this.stoneIds = [];
        this.rfidCommuteItem = new Array<RfidCommuteItem>();
    }
}