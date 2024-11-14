import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemorequestmasterComponent } from './memorequestmaster.component';

describe('MemorequestmasterComponent', () => {
  let component: MemorequestmasterComponent;
  let fixture: ComponentFixture<MemorequestmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemorequestmasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MemorequestmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
