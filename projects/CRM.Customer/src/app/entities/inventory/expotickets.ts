import { BaseEntity } from "shared/enitites";

export class ExpoTickets extends BaseEntity {
    expoTicketNo!: number;
    stoneIds!: string[];
    isVisitedFlag!: boolean;

    constructor() {
        super();
        this.stoneIds = [];
        this.isVisitedFlag = false;
    }
}
