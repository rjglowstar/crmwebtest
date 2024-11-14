import { SafeUrl } from "@angular/platform-browser";

export class ContactUsDetail  {
    address!: string;
    contactNo!: string;
    email!: string;
    websiteUrl!: string;
    locationUrl!: SafeUrl;
    constructor() {
    }
}