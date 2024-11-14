export class ExpoInvItem {
    invId!: string;
    stoneId!: string;
    status!: string;
    updatedAt?: Date;
    updatedBy!: string;

    issueAt?: Date;
    issueBy!: string;
    receiveAt?: Date;
    receiveBy!: string;

    constructor() { }
}
