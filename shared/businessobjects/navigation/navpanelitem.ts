export class NavPanelItem {
    name!: string
    path!: string
    icon!: string
    items: NavPanelItem[]
    isAdmin?: boolean

    constructor() {
        this.items = [];
        this.isAdmin = false;
    }

}