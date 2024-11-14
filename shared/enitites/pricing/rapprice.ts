import { BaseEntity } from '../common/baseentity'

export class RapPrice extends BaseEntity {
    shape!: string
    minSize!: number
    maxSize!: number
    color!: string
    clarity!: string
    price!: number

    constructor() {
        super();
    }
}