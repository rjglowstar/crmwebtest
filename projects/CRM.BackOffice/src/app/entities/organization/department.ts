import { BaseEntity } from "shared/enitites";

export class Department extends BaseEntity {
      name!: string
      origin!: string
      branchName!: string
      phoneExtNo!: string

      constructor() {
            super();
      }

}