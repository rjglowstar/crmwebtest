export class InvLogItem {
    action!: string;
    invIds!: string[];
    stonIds!: string[];

    constructor() {
        this.stonIds = [];
        this.invIds = [];
    }

}