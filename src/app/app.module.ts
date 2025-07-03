import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { CalculateMotorComponent } from './calculate-motor/calculate-motor.component';

@NgModule({
  declarations: [
    AppComponent,
    CalculateMotorComponent
  ],
  imports: [
    BrowserModule,
    // Necessário para ngModel funcionar
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
