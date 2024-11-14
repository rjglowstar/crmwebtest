export class ExportPdfMail {
    transactionId!: string;
    toEmail!:string;
    subject!: string;
    body!: string;
    cc!: string;
    bcc!: string;
    pdfHtml!: string;
    siteUrl!: string;

    constructor() { }
}