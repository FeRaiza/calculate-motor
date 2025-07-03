
import { NgModule } from '@angular/core';
import { RouterModule, Routes, ExtraOptions } from '@angular/router';
import { CalculateMotorComponent } from './calculate-motor/calculate-motor.component';
import { ColabsComponent } from './colabs/colabs.component';

const routes: Routes = [
  { path: '', component: CalculateMotorComponent },
  { path: 'colabs', component: ColabsComponent }
];

const routerOptions: ExtraOptions = {
  onSameUrlNavigation: 'reload',
  scrollPositionRestoration: 'enabled',
};

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
