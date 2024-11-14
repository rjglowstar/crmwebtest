export class MemoSearchCriteria {

    party!: string;
    stoneIds: string[];
    certificateNos: string[];
    isRecieved: boolean = false;
    isOverseas!: boolean;

    constructor() {
        this.stoneIds = new Array<string>();
        this.certificateNos = new Array<string>();
    }
}