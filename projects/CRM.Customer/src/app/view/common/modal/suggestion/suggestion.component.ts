import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Suggestion } from 'shared/enitites';
import { AppPreloadService, SuggestionService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';

@Component({
  selector: 'app-suggestion',
  templateUrl: './suggestion.component.html',
  styleUrl: './suggestion.component.css'
})
export class SuggestionComponent implements OnInit {

  public suggestionObj: Suggestion = new Suggestion();
  public credential: any;


  constructor(
    private utilityService: UtilityService,
    private appPreloadService: AppPreloadService,
    private suggestionService: SuggestionService,
    private alertDialogService: AlertdialogService,
  ) {
  }

  async ngOnInit() {
    this.credential = await this.appPreloadService.fetchFxCredentials("", "customer");
  }

  public closeSuggestionDialog() {
    this.suggestionService.setSuggestion(false);
  }

  public async saveSuggestion(suggestionForm: NgForm) {
    try {
      let suggestionObj = new Suggestion();
      suggestionObj.company = this.credential.company
      suggestionObj.customerName = this.credential.fullName
      suggestionObj.email = suggestionForm.value.email;
      suggestionObj.description = suggestionForm.value.description;
      suggestionObj.createdDate = new Date();
      let result = await this.suggestionService.insertSuggestion(suggestionObj);
      if (result) {
        this.utilityService.showNotification(`Successfully Saved.`);
        this.suggestionService.setSuggestion(false);
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
      this.suggestionService.setSuggestion(false);
    }
  }


}
