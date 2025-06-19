import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path: '',
        loadChildren: () => import('./page/bolt-wallet-ui/bolt-wallet-ui-routing.module').then(m => m.BoltWalletUiRoutingModule),
        pathMatch: 'full'
    }
];
