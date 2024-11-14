import { IssueRight } from "shared/businessobjects";
import { PermissionGroup } from "./permissiongroup";

export class EmpPermission extends PermissionGroup {
    employeeId!: string
    employeeName!: string
    origin!: string
    issueRights: IssueRight[]

    constructor() {
        super();
        this.issueRights = [];
    }

}