import { IssueRight } from "shared/businessobjects";
import { PermissionGroup } from "./permissiongroup";

export class DeptPermission extends PermissionGroup {
    departmentId!: string
    department!: string
    origin!: string
    issueRights: IssueRight[]

    constructor() {
        super();
        this.issueRights = [];
    }

}