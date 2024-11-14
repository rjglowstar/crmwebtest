export class BaseEntity {
    id!: string
    version!: number
    createdBy!: string
    createdById!: string
    createdDate!: Date
    updatedBy!: string
    updatedAt!: Date

    constructor() { }

}