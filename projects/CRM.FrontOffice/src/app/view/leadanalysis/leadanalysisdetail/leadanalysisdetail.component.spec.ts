import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadanalysisdetailComponent } from './leadanalysisdetail.component';

describe('LeadanalysisdetailComponent', () => {
  let component: LeadanalysisdetailComponent;
  let fixture: ComponentFixture<LeadanalysisdetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeadanalysisdetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeadanalysisdetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
