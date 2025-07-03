import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateMotorComponent } from './calculate-motor.component';

describe('CalculateMotorComponent', () => {
  let component: CalculateMotorComponent;
  let fixture: ComponentFixture<CalculateMotorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalculateMotorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculateMotorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
