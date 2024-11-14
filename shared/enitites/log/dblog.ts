import { BaseEntity } from "../common/baseentity";

export class DbLog extends BaseEntity {
    userName!: string;
    userIpAddress!: string;
    controller!: string;
    action!: string;
    commentText!: string;
    ident!: string;
    category!: string;
    eventTime!: string;
    eventLevel!: string;
    text!: string;
    errorText!: string;
    payLoad!: string;

    constructor() {
        super();
    }
}