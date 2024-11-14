import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactitemComponent } from './transactitem.component';

describe('TransactitemComponent', () => {
  let component: TransactitemComponent;
  let fixture: ComponentFixture<TransactitemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransactitemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactitemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
