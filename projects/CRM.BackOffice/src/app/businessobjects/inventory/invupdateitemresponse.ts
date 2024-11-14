export class InvUpdateItemResponse {
    successStoneIds: string[];
    holdStoneIds: string[];

    constructor(){
        this.successStoneIds = [];
        this.holdStoneIds = [];
    }
}