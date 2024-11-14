export class QcCommuteItem {
    leadId!: string
    ident!: string;
    isRequest!:boolean;
    acceptedStones!: Array<string>;
    rejectedStones!: Array<string>;
    comment!: string;
    constructor() {}
} 