import { BaseEntity } from "shared/enitites";
import { ManageEventImages } from "./manageeventimages";

export class ManageEvent extends BaseEntity {

    eventName!: string
    tagline!: string
    boothNo!: string
    venue!: string
    eventImage!: string
    eventLogo!: string
    description!: string
    startDate!: Date;
    endDate!: Date;
    images: ManageEventImages[];

    constructor() {
        super();
        this.images = new Array<ManageEventImages>();
    }

}