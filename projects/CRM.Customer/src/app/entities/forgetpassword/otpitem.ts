export class OTPItem {
    userId!: string;
    type!: string;
    companyName!: string;
    email!: string;
    token!: string;
    otpCode!: string;
    issuedUtc!: Date;
    expireUtc!: Date;

    constructor() {
        this.email = "";
    }

}