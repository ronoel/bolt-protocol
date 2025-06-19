import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingBoltTransactionInfoComponent } from './processing-bolt-transaction-info.component';

describe('ProcessingBoltTransactionInfoComponent', () => {
  let component: ProcessingBoltTransactionInfoComponent;
  let fixture: ComponentFixture<ProcessingBoltTransactionInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessingBoltTransactionInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessingBoltTransactionInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
