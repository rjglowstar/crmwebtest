export class InvUpdateItem {
    supplierCode!: string
    isRemove: boolean
    stoneIds!: string[]
    status!: string
    memoRequestIds!: string[]
    memoProcess!: string
    heldBy!: string
    updatedBy!: string

    constructor() {
        this.stoneIds = [];
        this.memoRequestIds = [];
        this.isRemove = false;
    }
}