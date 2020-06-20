import { ShoppingListComponent } from './shopping-list/shopping-list.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { UserRecipesComponent } from './user-recipes/user-recipes.component';

const routes: Routes = [
    { path: 'shopping-list', component: ShoppingListComponent, canActivate: [AuthGuard] },
    { path: ':username', component: UserRecipesComponent },
    { path: '**', redirectTo: '/', pathMatch: 'full' }
]

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule],
    providers: [AuthGuard]
})

export class UserRoutingModule {}