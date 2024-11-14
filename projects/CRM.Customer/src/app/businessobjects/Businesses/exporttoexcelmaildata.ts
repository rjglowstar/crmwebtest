export class ExportToExcelMailData {
    systemUserId!: string;
    toEmail!: string;
    cC!: string;
    bcc!: string;
    subject!: string
    excelFileName!: string;
    excelBase64String!: string;
    excelMediaType!: string;
    companyName!:string;

    constructor() { }
}