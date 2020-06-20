import { Routes, RouterModule } from "@angular/router";
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { CreateRecipeComponent } from './create-recipe/create-recipe.component';
import { NgModule } from '@angular/core';
import { AuthGuard } from '../auth/auth.guard';
import { RecipeItemComponent } from './recipe-item/recipe-item.component';


const routes: Routes = [
    { path: '', component: RecipeListComponent },
    { path: 'share', component: CreateRecipeComponent, canActivate: [AuthGuard] },
    { path: 'tag/:tag', component: RecipeListComponent },
    { path: 'recipe/:id', component: RecipeItemComponent },
    { path: 'recipe/edit/:id', component: CreateRecipeComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: '/recipes', pathMatch: 'full' }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule],
    providers: [AuthGuard]
})

export class RecipeRoutingModule {}