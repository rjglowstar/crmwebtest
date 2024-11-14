export class OrganizationSearchCriteria {
      name!: string
      organizationType!: string
      businessType!: string
      registrationNo!: string
      country!: string
      email!: string

      constructor() {
            this.name = ""
            this.organizationType = ""
            this.registrationNo = ""
            this.country = ""
            this.email = ""
            this.businessType = ""
      }

}