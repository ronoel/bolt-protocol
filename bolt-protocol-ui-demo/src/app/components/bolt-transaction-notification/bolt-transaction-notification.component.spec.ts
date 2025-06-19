import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoltTransactionNotificationComponent } from './bolt-transaction-notification.component';

describe('BoltTransactionNotificationComponent', () => {
  let component: BoltTransactionNotificationComponent;
  let fixture: ComponentFixture<BoltTransactionNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoltTransactionNotificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoltTransactionNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
