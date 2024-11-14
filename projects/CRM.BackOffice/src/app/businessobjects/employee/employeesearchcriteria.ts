export class EmployeeSearchCriteria {
    firstName!: string
    lastName!: string
    organizationId!: string
    branch!: string
    departmentId!: string
    origin!: string
    isActive?: boolean

    constructor() {
        this.firstName = ""
        this.lastName = ""
        this.organizationId = ""
        this.branch = ""
        this.departmentId = ""
        this.origin = ""
        this.isActive = null as any;
    }
}