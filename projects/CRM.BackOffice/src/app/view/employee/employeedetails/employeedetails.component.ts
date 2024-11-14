import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertdialogService } from 'shared/views';
import { Employee } from '../../../entities';
import { EmployeeService } from '../../../services';

@Component({
  selector: 'app-employeedetails',
  templateUrl: './employeedetails.component.html',
  styleUrls: ['./employeedetails.component.css']
})
export class EmployeedetailsComponent implements OnInit {

  public employeeObj: Employee = new Employee;

  constructor(private employeeService: EmployeeService,
    private alertDialogService: AlertdialogService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private spinnerService: NgxSpinnerService) { }

  public async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region Initialize Data
  async defaultMethodsLoad() {
    this.spinnerService.show();
    this.activatedRoute.params.subscribe(async params => {
      const id = params['id'];
      await this.getEmployeeData(id);
    });
  }

  public async getEmployeeData(id: string) {
    try {
      this.employeeObj = await this.employeeService.getEmployeeById(id);
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

}
