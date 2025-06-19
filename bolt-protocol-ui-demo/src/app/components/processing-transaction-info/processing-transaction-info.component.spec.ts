import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingTransactionInfoComponent } from './processing-transaction-info.component';

describe('ProcessingTransactionInfoComponent', () => {
  let component: ProcessingTransactionInfoComponent;
  let fixture: ComponentFixture<ProcessingTransactionInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessingTransactionInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessingTransactionInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
