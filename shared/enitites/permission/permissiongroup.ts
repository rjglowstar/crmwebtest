import { Permission } from "../../businessobjects";
import { BaseEntity } from "../common/baseentity";

export class PermissionGroup extends BaseEntity {

    menus: Permission[]
    navGroups: Permission[]
    navItems: Permission[]
    reportGroups: Permission[]
    reportItems: Permission[]
    actions: Permission[]
    gridConfigs: Permission[]

    constructor() {
        super();
        this.menus = [];
        this.navGroups = [];
        this.navItems = [];
        this.reportGroups = [];
        this.reportItems = [];
        this.actions = [];
        this.gridConfigs = [];
    }

}