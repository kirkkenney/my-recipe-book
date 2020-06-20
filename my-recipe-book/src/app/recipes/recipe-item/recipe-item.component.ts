import { ConfirmDialogComponent } from './../../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { RecipeModel } from './../../shared/recipe.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { RecipeService } from 'src/app/shared/recipe.service';
import { UserService } from 'src/app/user/user.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-recipe-item',
  templateUrl: './recipe-item.component.html',
  styleUrls: ['./recipe-item.component.css']
})
export class RecipeItemComponent implements OnInit, OnDestroy {

  recipe: RecipeModel;
  recipeId: string;
  isLoading: boolean;
  userId: string;
  private authStatusSub: Subscription;
  userIsAuthenticated: boolean = false;
  infoMessage: string = null;
  displayInfoMessage: boolean = false;
  form: FormGroup;

  constructor(private authService: AuthService, private route: ActivatedRoute, private recipeService: RecipeService, private userService: UserService, public dialog: MatDialog, private location: Location) { }

  ngOnInit() {
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    this.userIsAuthenticated = this.authService.getIsAuth()
    // get recipeId from "id" param property, then assign response from server to component recipe property
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.recipeId = paramMap.get('id');
      this.recipeService.getRecipeItem(this.recipeId)
      .subscribe(response => {
        this.recipe = response;
        this.initForm();
      })
    })
    this.authStatusSub = this.authService.getAuthStatusListener()
    .subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();
    })
    this.isLoading = false;
  }

  // method called from HTML to dynamically apply styling according to whether or not user has already favourited thre recipe
  userHasVoted() {
    if (this.recipe.voters.indexOf(this.userId) > -1) {
      return 'favourited'
    } else {
      return 'not-favourited'
    }
  }

  // populate form containing all of the recipe's ingredients, giving the user the option to add all or some of the ingredients to their shopping list
  initForm() {
    this.form = new FormGroup({
      ingredients: new FormArray([])
    });
    this.recipe.ingredients.forEach(ingredient => {
        (<FormArray>this.form.get('ingredients')).push(
          new FormControl(ingredient, Validators.required)
        )
    })
  }

  get ingredientControls() {
    return (<FormArray>this.form.get('ingredients')).controls;
  }

  deleteIngredient(index: number) {
    (<FormArray>this.form.get('ingredients')).removeAt(index);
  }

  // form submission adds selected recipe ingredients to their shopping list
  onAddIngredients() {
    if (!this.form.valid) {
      return
    }
    this.userService.addToShoppingList(this.form.value)
    this.showInfoMessage('Shopping List updated')
  }

  addToFavourites() {
    let msg: string;
    // if user is not authenticated, prevent any data from being trasmitted
    if (!this.userIsAuthenticated) {
      msg = 'You must be logged in to do that';
      this.showInfoMessage(msg);
      return
    }
    // check that current user is not the owner of current recipe
    if (this.userId === this.recipe.creatorId) {
      msg = 'Cannot unfavourite recipes you have created';
      this.showInfoMessage(msg);
      return
    }
    // check if user has already favourited current recipe. If they have, then the recipe is UNfavourited, and recipe is updated to reflect changes on the backend - this enables a re-application of state, styling rules etc
    if (this.recipe.voters.indexOf(this.userId) > -1) {
      this.recipeService.removeFromFavourites(this.recipe)
      .subscribe(response => {
        this.recipe = response;
        msg = `${this.recipe.name} removed from your favourites`;
        this.showInfoMessage(msg);
      })
    } else {
      // once recipe is favourited by the user, the recipe is updated to reflect changes on the backend - this enables a re-application of state, styling rules etc
      this.recipeService.addToFavourites(this.recipe)
      .subscribe(response => {
        this.recipe = response;
        msg = `${this.recipe.name} added to your favourites`
        this.showInfoMessage(msg);
      })
    }
  }

  // dynamic information message is displayed to user on certain events (favouriting recipe, adding items to shopping list etc)
  showInfoMessage(message: string) {
    this.infoMessage = message;
    this.displayInfoMessage = true;
    setTimeout(() => {
      this.displayInfoMessage = false;
      this.infoMessage = null;
    }, 2500)
  }

  // user clicking the "delete" button inserts the ConfirmDialog component, giving them a choice to confirm or to cancel recipe deletion
  onDeleteDialog() {
    const message = `Are you sure you want to delete this recipe?`;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: message },
      panelClass: 'error-modal'
    })
    // ConfirmDialog component presents user with "confirm" and "cancel" options. Listen to the option selected, and direct data accordingly.
    // afterCLosed method return a boolean. If false, user has cancelled deletion. If true, they have confirmed deletion.
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (!dialogResult) {
        return
      }
      this.isLoading = true;
      this.recipeService.deleteRecipe(this.recipe.id)
      .subscribe(response => {
        this.location.back();
      })
    })
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

}
