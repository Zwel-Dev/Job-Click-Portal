
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  // { path: '', redirectTo: 'dashboard' },
  //{ path: "", component: LoginComponent },

  //{ path: 'dashboard', component: DefaultComponent },
  
  
  
  // { path: 'hr', loadChildren: () => import('./systematic/modules/hr/hr.module').then(m => m.HrModule) },
  // { path: 'services', loadChildren: () => import('./systematic/modules/services/services.module').then(m => m.ServicesModule) },
  // { path: 'finance', loadChildren: () => import('./systematic/modules/finance/finance.module').then(m => m.FinanceModule) },
  // { path: 'crm', loadChildren: () => import('./systematic/modules/crm/crm.module').then(m => m.CrmModule) },
  // { path: 'sale', loadChildren: () => import('./systematic/modules/sale/sale.module').then(m => m.SaleModule) },
  // { path: 'inv', loadChildren: () => import('./systematic/modules/Inventory/inv.module').then(m => m.InventoryModule) },
  // { path: 'sub', loadChildren: () => import('./systematic/modules/canal-plus/canal-plus.module').then(m => m.CanalPlusModule) },
  // { path: 'ticketing', loadChildren: () => import('./systematic/modules/ticketing/ticketing.module').then(m => m.TicketingModule) },
  // { path: 'Product', loadChildren: () => import('./systematic/modules/product/product.module').then(m => m.ProductModule) },
  // { path: 'tasking', loadChildren: () => import('./systematic/modules/TaskManagement/tasking.module').then(m => m.TaskingModule) },


  //{ path: 'learning', loadChildren: () => import('./systematic/modules/learning/learning.module').then(m => m.LearningModule) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
