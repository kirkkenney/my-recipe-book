import { RecipeModel } from './../shared/recipe.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RecipeService } from '../shared/recipe.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  isLoading: boolean;
  recipes: RecipeModel[] = [];
  private recipesSubscription: Subscription;
  userIsAuthenticated: boolean;
  userAuthStatusSub: Subscription;

  constructor(private recipeService: RecipeService, private authService: AuthService) { }

  ngOnInit() {
    this.isLoading = true;
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.recipeService.getRecentRecipes();
    this.recipesSubscription = this.recipeService.getRecentRecipesListener()
    .subscribe(recipes => {
      this.recipes = recipes
      this.isLoading = false;
      });
    this.userAuthStatusSub = this.authService.getAuthStatusListener()
    .subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
    })
  }

  ngOnDestroy() {
    this.userAuthStatusSub.unsubscribe();
    this.recipesSubscription.unsubscribe();
  }

}
