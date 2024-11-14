import { UserRights } from "./userrights";

export class UserRightItem {
    group!: string
    items: UserRights[]
    isChecked!: boolean
    isAdmin?: boolean

    constructor() {
        this.items = [];
    }
}