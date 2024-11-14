export class SystemUserSearchCriteria {
    firstName!: string
    lastName!: string
    origin!: string
    isActive?: boolean

    constructor() {
        this.firstName = ""
        this.lastName = ""
        this.origin = ""
        this.isActive = null as any;
    }
}