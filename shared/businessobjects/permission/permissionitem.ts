export class PermissionItem {
    name!: string
    items!: PermissionItem[]
    isChecked?: boolean

    constructor() {
        this.items = [];
    }
}