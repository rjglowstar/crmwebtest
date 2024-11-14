import { BaseEntity } from "shared/enitites";
import { RInvItem } from "./rinvitem";

export class Repairing extends BaseEntity {
    defectedStone: RInvItem;
    repairedStone: RInvItem
    isIssue!: string;
    memoStatus!: string;
    description!: string;

    //extra
    createdDateString!: string

    constructor() {
        super();
        this.description = "";
        this.defectedStone = new RInvItem();
        this.repairedStone = new RInvItem();
    }
}