import { SharedModule } from './../shared/shared.module';
import { TrimPipe } from './../shared/trim.pipe';
import { LoadingOverlayModule } from './../loadingoverlay/loading-overlay.module';
import { LoadingoverlayComponent } from './../loadingoverlay/loadingoverlay.component';
import { NgModule } from "@angular/core";
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { CreateRecipeComponent } from './create-recipe/create-recipe.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material.module';
import { RecipeRoutingModule } from './recipes-routing.module';
import { RecipeItemComponent } from './recipe-item/recipe-item.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';


@NgModule({
    declarations: [
        RecipeListComponent,
        CreateRecipeComponent,
        RecipeItemComponent,
        // TrimPipe
    ],
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        AngularMaterialModule,
        LoadingOverlayModule,
        RecipeRoutingModule,
        InfiniteScrollModule,
        SharedModule
    ],
    // providers: [TrimPipe]
})

export class RecipesModule {}