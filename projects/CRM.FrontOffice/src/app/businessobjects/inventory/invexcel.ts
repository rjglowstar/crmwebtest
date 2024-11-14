import { InventoryItems } from '../../entities';

export class InvExcel {
    inventories: InventoryItems[]
    imageURL!: string
    videoURL!: string
    certiURL!: string
    otherImageBaseURL!: string

    constructor() {
        this.inventories = [];
    }
}