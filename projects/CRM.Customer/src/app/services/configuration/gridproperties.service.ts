import { Injectable } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { GridDetailConfig } from "shared/businessobjects";

@Injectable()

export class GridPropertiesService {

    constructor(private translateService: TranslateService) { }

    public getSearchResultInventoryGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 42, sortOrder: i++, isSelected: true },
            { propertyName: "location", title: this.translateService.instant('BasicText.Location'), width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "lab", title: this.translateService.instant('BasicText.Lab'), width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "status", title: this.translateService.instant('BasicText.Status'), width: 75, sortOrder: i++, isSelected: true },
            { propertyName: "media", title: this.translateService.instant('BasicText.Media'), width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: this.translateService.instant('BasicText.Stone Id'), width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: this.translateService.instant('BasicText.Shape'), width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: this.translateService.instant('BasicText.Weight'), width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: this.translateService.instant('BasicText.Color'), width: 65, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: this.translateService.instant('BasicText.Clarity'), width: 75, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: this.translateService.instant('BasicText.Cut'), width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: this.translateService.instant('BasicText.Polish'), width: 75, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: this.translateService.instant('BasicText.Symmetry'), width: 105, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: this.translateService.instant('BasicText.Fluorescence'), width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "measurement", title: this.translateService.instant('BasicText.Measurement'), width: 135, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.depth", title: this.translateService.instant('BasicText.Depth %'), width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.table", title: this.translateService.instant('BasicText.Table %'), width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: this.translateService.instant('BasicText.Certificate No'), width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "price.rap", title: this.translateService.instant('BasicText.Rap'), width: 55, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: this.translateService.instant('BasicText.Discount'), width: 90, sortOrder: i++, isSelected: true },
            { propertyName: "price.netAmount", title: this.translateService.instant('BasicText.NetAmount'), width: 115, sortOrder: i++, isSelected: true },
            { propertyName: "price.perCarat", title: this.translateService.instant('BasicText.$/CT'), width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.shade", title: this.translateService.instant('BasicText.Shade'), width: 75, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.brown", title: this.translateService.instant('BasicText.Brown'), width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.green", title: this.translateService.instant('BasicText.Green'), width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.milky", title: this.translateService.instant('BasicText.Milky'), width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.eyeClean", title: this.translateService.instant('BasicText.Eye Clean'), width: 105, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.girdlePer", title: this.translateService.instant('BasicText.Girdle %'), width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.pavilionDepth", title: this.translateService.instant('BasicText.P_Depth'), width: 95, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.pavilionAngle", title: this.translateService.instant('BasicText.P_Angle'), width: 95, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.crownAngle", title: this.translateService.instant('BasicText.C_Angle'), width: 90, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.crownHeight", title: this.translateService.instant('BasicText.C_Height'), width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.hna", title: "HNA", width: 55, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.culet", title: this.translateService.instant('BasicText.Culet'), width: 75, sortOrder: i++, isSelected: true },
            { propertyName: "natts", title: this.translateService.instant('BasicText.NATTS'), width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.ktoS", title: this.translateService.instant('BasicText.Key To Symbol'), width: 180, sortOrder: i++, isSelected: true },
            { propertyName: "typeA", title: this.translateService.instant('BasicText.TypeA'), width: 75, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getInventoryGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "media", title: "Media", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "StoneId", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "StoneId" },
            { propertyName: "shape", title: "Shape", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Shape" },
            { propertyName: "certificateNo", title: "Certificate No", width: 110, sortOrder: i++, isSelected: true, sortFieldName: "CertificateNo" },
            { propertyName: "weight", title: "Weight", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Weight" },
            { propertyName: "color", title: "Color", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Color" },
            { propertyName: "clarity", title: "Clarity", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Clarity" },
            { propertyName: "cut", title: "Cut", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Cut" },
            { propertyName: "polish", title: "Polish", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Polish" },
            { propertyName: "symmetry", title: "Symmetry", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Symmetry" },
            { propertyName: "fluorescence", title: "Fluorescence", width: 100, sortOrder: i++, isSelected: true, sortFieldName: "Fluorescence" },
            { propertyName: "price.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Price.Rap" },
            { propertyName: "price.discount", title: "Disc", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.netAmount", title: "NetAmount", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "Price.NetAmount" },
            { propertyName: "price.perCarat", title: "$/CT", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Price.PerCarat" },
            { propertyName: "inclusion.brown", title: "Brown", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Inclusion.Brown" },
            { propertyName: "inclusion.green", title: "Green", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Inclusion.Green" },
            { propertyName: "inclusion.milky", title: "Milky", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Inclusion.Milky" },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getAppointmentGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "createdDate", title: this.translateService.instant('BasicText.Created Date'), width: 10, sortOrder: i++, isSelected: true },
            { propertyName: "customer.name", title: this.translateService.instant('BasicText.Customer Name'), width: 12, sortOrder: i++, isSelected: true },
            { propertyName: "customer.companyName", title: this.translateService.instant('BasicText.Company Name'), width: 10, sortOrder: i++, isSelected: true },
            { propertyName: "appointmentDate", title: this.translateService.instant('BasicText.Appointment Date'), width: 10, sortOrder: i++, isSelected: true },
            { propertyName: "status", title: this.translateService.instant('BasicText.Status'), width: 7, sortOrder: i++, isSelected: true },
            { propertyName: "totalstone", title: this.translateService.instant('BasicText.Total Stones'), width: 7, sortOrder: i++, isSelected: true },
            { propertyName: "approvedDate", title: this.translateService.instant('BasicText.Approved Date'), width: 70, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getAppointmentStoneGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "stoneId", title: this.translateService.instant('BasicText.Stone Id'), width: 7, sortOrder: i++, isSelected: true },
            { propertyName: "Action", title: "Action", width: 2, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getProposalGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "status", title: this.translateService.instant('BasicText.Status'), width: 45, sortOrder: i++, isSelected: true },
            { propertyName: "media", title: this.translateService.instant('BasicText.Media'), width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: this.translateService.instant('BasicText.Stone Id'), width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: this.translateService.instant('BasicText.Shape'), width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: this.translateService.instant('BasicText.Weight'), width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: this.translateService.instant('BasicText.Color'), width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: this.translateService.instant('BasicText.Clarity'), width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: this.translateService.instant('BasicText.Cut'), width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: this.translateService.instant('BasicText.Polish'), width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: this.translateService.instant('BasicText.Symmetry'), width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: this.translateService.instant('BasicText.Fluorescence'), width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "diameter", title: this.translateService.instant('BasicText.Diameter'), width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.depth", title: this.translateService.instant('BasicText.Depth') + "%", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.table", title: this.translateService.instant('BasicText.Table') + "%", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.rap", title: this.translateService.instant('BasicText.Rap'), width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: this.translateService.instant('BasicText.Discount'), width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.netAmount", title: this.translateService.instant('BasicText.NetAmount'), width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.perCarat", title: this.translateService.instant('BasicText.$/CT'), width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "location", title: this.translateService.instant('BasicText.Location'), width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "lab", title: this.translateService.instant('BasicText.Lab'), width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: this.translateService.instant('BasicText.Certificate No'), width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inscription", title: this.translateService.instant('BasicText.Inscription'), width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "labReceiveDate", title: "LabReceiveDate", width: 95, sortOrder: i++, isSelected: true },
            { propertyName: "bgmComments", title: "BGM Comments", width: 95, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.shade", title: "Shade", width: 95, sortOrder: i++, isSelected: true }
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }
    public getBidingMasterGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: true },
            // { propertyName: "location", title: "Location", width: 80, sortOrder: i++, isSelected: true, filterable: true },
            { propertyName: "stoneId", title: "StoneId", width: 100, sortOrder: i++, isSelected: true, sortFieldName: "StoneId", filterable: true },
            { propertyName: "media", title: "Media", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "Shape", filterable: true },
            { propertyName: "weight", title: "Carats", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "Weight", filterable: true },
            { propertyName: "color", title: "Color", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "Color", filterable: true },
            { propertyName: "clarity", title: "Clarity", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "Clarity", filterable: true },
            { propertyName: "cut", title: "Cut", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "Cut", filterable: true },
            { propertyName: "polish", title: "Polish", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "Polish", filterable: true },
            { propertyName: "symmetry", title: "Symm", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "Symmetry", filterable: true },
            { propertyName: "fluorescence", title: "Fluor", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "Fluorescence", filterable: true },
            { propertyName: "measurement", title: "Measurement", width: 110, sortOrder: i++, isSelected: true, sortFieldName: "Fluorescence", filterable: false },
            { propertyName: "measurement.depth", title: "Depth %", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "measurement.depth", filterable: true },
            { propertyName: "measurement.table", title: "Table %", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "measurement.table", filterable: true },
            { propertyName: "lab", title: "Lab", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "Lab", filterable: true },
            { propertyName: "certificateNo", title: "Report No", width: 100, sortOrder: i++, isSelected: true, filterable: true },
            { propertyName: "price.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: false, filterable: true },
            { propertyName: "bidPerCarat", title: "Bid Pr/Ct", width: 95, sortOrder: i++, isSelected: false },
            { propertyName: "bidAmount", title: "Bid Net Amt$", width: 95, sortOrder: i++, isSelected: false },
            { propertyName: "biddisc", title: "Disc (%)", width: 95, sortOrder: i++, isSelected: false },

        ];
        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

}