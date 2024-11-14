export class CommuteItem {
    isHold!: boolean;
    holdBy!:string;
    stoneIds: string[];

    constructor() {
        this.stoneIds = [];
        this.holdBy = "";
    }
}