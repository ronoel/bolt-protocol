import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionInfoComponent } from './transaction-info.component';

describe('TransactionInfoComponent', () => {
  let component: TransactionInfoComponent;
  let fixture: ComponentFixture<TransactionInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
