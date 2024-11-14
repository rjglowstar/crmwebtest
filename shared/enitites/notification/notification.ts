import { BaseEntity } from "../common/baseentity";

export class Notifications extends BaseEntity {

    icon!: string; //info - icon-info  warning & Alert - icon-erroricon
    title!: string;
    categoryType!: string; //information, warning, alert, redirect, modal 
    description!: string;
    action!: string;
    param!: string;
    senderId!: string;
    receiverId!: string;
    isVisible: boolean = true;
    isDelivered:boolean = false;
    reason!:string

    constructor() {
        super();
    }
}