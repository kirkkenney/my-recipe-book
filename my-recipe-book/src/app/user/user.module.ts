import { SharedModule } from './../shared/shared.module';
import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material.module';
import { LoadingOverlayModule } from '../loadingoverlay/loading-overlay.module';
import { UserRoutingModule } from './user-routing.module';
import { UserRecipesComponent } from './user-recipes/user-recipes.component';
import { ShoppingListComponent } from './shopping-list/shopping-list.component';


@NgModule({
    declarations: [
    UserRecipesComponent,
    ShoppingListComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        AngularMaterialModule,
        LoadingOverlayModule,
        UserRoutingModule,
        SharedModule
    ]
})

export class UserModule {}