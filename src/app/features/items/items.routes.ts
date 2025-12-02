import { Routes } from '@angular/router';
import { ItemListComponent } from './item-list/item-list.component';
import { ReportLostComponent } from './report-lost/report-lost.component';
import { ReportFoundComponent } from './report-found/report-found.component';
import { ItemDetailComponent } from './item-detail/item-detail.component';
import { authGuard } from '../../core/guards/auth.guard';

export const ITEM_ROUTES: Routes = [
    {
        path: '',
        component: ItemListComponent
    },
    {
        path: 'report-lost',
        component: ReportLostComponent,
        canActivate: [authGuard]
    },
    {
        path: 'report-found',
        component: ReportFoundComponent,
        canActivate: [authGuard]
    },
    {
        path: ':id',
        component: ItemDetailComponent
    }
];
