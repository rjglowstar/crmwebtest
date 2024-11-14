import { Name, Badge, SocialMedia, Address } from "shared/businessobjects"
import { BaseEntity } from "shared/enitites"
import { EmailConfig } from "../social/emailconfig"

export class SystemUser extends BaseEntity {
  name: Name
  fullName!: string
  code!: string
  origin!: string
  badge: Badge
  email!: string
  mobile!: string
  address: Address
  nativeAddress!: string
  socialMedias: SocialMedia[]
  joiningDate!: Date
  enrollmentNumber!: string
  isManager!: boolean
  isActive!: boolean
  isAvailable!: boolean
  isLoadDash!: boolean
  emailConfig: EmailConfig
  refId!: string
  companyName!: string
  signatureImageName!: string
  canUnlockPrice!: boolean

  constructor() {
    super();
    this.name = new Name();
    this.badge = new Badge();
    this.address = new Address();
    this.socialMedias = [];
    this.origin = "";
    this.nativeAddress = "";
    this.enrollmentNumber = "";
    this.isActive = false;
    this.isManager = false;
    this.isAvailable = false;
    this.isLoadDash = false;
    this.emailConfig = new EmailConfig();
  }
}