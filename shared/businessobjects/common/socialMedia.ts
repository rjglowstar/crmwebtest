import { SocialMediaProvider } from "./socialMediaProvider";

export class SocialMedia {
    public provider: SocialMediaProvider
    public profileName!: string
    public mobileNumber!: string

    constructor() {
        this.provider = new SocialMediaProvider();
    }
}