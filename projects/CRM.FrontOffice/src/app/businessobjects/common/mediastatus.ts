import { Media } from "../../entities/inventory/media"

export class MediaStatus {
    stoneId!: string
    media: Media

    constructor() {
        this.media = new Media();
    }
}