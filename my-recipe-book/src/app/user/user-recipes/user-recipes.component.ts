import { RecipeService } from 'src/app/shared/recipe.service';
import { Subscription} from 'rxjs';
import { UserModel } from './../user.model';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../user.service';
import { RecipeModel } from '../../shared/recipe.model';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-user-recipes',
  templateUrl: './user-recipes.component.html',
  styleUrls: ['./user-recipes.component.css']
})
export class UserRecipesComponent implements OnInit, OnDestroy {

  isLoading: boolean;
  // userQuery stores username of user being queried
  userQuery: string;
  // below properties store user information for validation and equality checks (eg user being queried is/is not same as client user)
  userData: UserModel;
  userDataSubscription: Subscription;
  // store user recipes from back-end - is toggled between user's saved and created recipes
  recipes: RecipeModel[] = [];
  // boolean to determine whether user's created or saved recipes should be displayed
  createdRecipes: boolean = true;
  recipeSelectionText: string;
  userId: string;
  userIsAuthenticated: boolean;
  authStatusSubscription: Subscription;
  infoMessage: string = null;
  displayInfoMessage: boolean = false;
  loadingString = 'Loading recipes ...'

  constructor(private route: ActivatedRoute, private userService: UserService, private authService: AuthService, private recipeService: RecipeService) { }

  ngOnInit() {
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    // get username of user being queried and assing to component "userQuery" property. Is used to check whether user being queried is same as client user
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.userQuery = paramMap.get('username');
      this.userService.getUserData(this.userQuery);
      // subscribe to changes to user data and assign to corresponding component properties
      this.userDataSubscription = this.userService.getUserDataListener()
      .subscribe(user => {
        this.userData = user;
        this.recipes = user.createdRecipes;
        this.recipeSelectionText = `Saved Recipes`
        if (this.recipes.length === 0) {
          this.loadingString = 'No recipes to display ...'
        }
      })
    })
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSubscription = this.authService.getAuthStatusListener()
    .subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();
    })
    this.isLoading = false;
  }

  // toggle display of user's created/saved recipes
  alternateDisplayRecipes() {
    this.createdRecipes = !this.createdRecipes;
    if (!this.createdRecipes) {
      this.recipes = this.userData.savedRecipes;
      this.recipeSelectionText = `Created Recipes`
    } else {
      this.recipes = this.userData.createdRecipes;
      this.recipeSelectionText = `Saved Recipes`
    }
  }

  // method called to apply dynamic styling on recipe items dependent on whether or not client user has favourited
  userHasVoted(recipe: RecipeModel) {
    if (recipe.voters.indexOf(this.userId) > -1) {
      return 'favourited'
    } else {
      return 'not-favourited'
    }
  }

  addToFavourites(recipe: RecipeModel, index: number) {
    let msg: string;
    // if client user is not authenticated, do nothing and display info message
    if (!this.userIsAuthenticated) {
      msg = 'You must be logged in to do that';
      this.showInfoMessage(msg);
      return
    }
    // user cannot favourite recipes that they have created. Check that this is not the case
    if (this.userId === recipe.creatorId) {
      msg = 'Cannot unfavourite recipes you have created';
      this.showInfoMessage(msg);
      return
    }
    // if user has already favourited recipe, unfavourite and replace recipe with new recipe returned from backend. Recipe is replaced with new data in order to re-apply state, styling rules etc
    if (recipe.voters.indexOf(this.userId) > -1) {
      this.recipeService.removeFromFavourites(recipe)
      .subscribe(response => {
        if (this.userId === this.userData.id) {
          this.recipes.splice(index, 1)
        } else {
          this.recipes[index] = response;
        }
        msg = `${recipe.name} removed from your favourites`;
        this.showInfoMessage(msg);
      })
    } else {
      // if above checks pass, add recipe to user's favourites and replace recipe with new data returned from back-end - allows re-application of state, styling rules etc
      this.recipeService.addToFavourites(recipe)
      .subscribe(response => {
        this.recipes[index] = response;
        msg = `${recipe.name} added to your favourites`
        this.showInfoMessage(msg);
      })
    }
  }

  showInfoMessage(message: string) {
    this.infoMessage = message;
    this.displayInfoMessage = true;
    setTimeout(() => {
      this.displayInfoMessage = false;
      this.infoMessage = null;
    }, 2500)
  }

  ngOnDestroy() {
    this.userDataSubscription.unsubscribe();
  }

}
