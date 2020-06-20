import { AuthService } from './../../auth/auth.service';
import { RecipeModel } from './../../shared/recipe.model';
import { RecipeService } from './../../shared/recipe.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit, OnDestroy {

  recipes: RecipeModel[] = [];
  isLoading: boolean;
  userId: string;
  tagName: string = null;
  private authStatusSub: Subscription;
  userIsAuthenticated: boolean = false;
  infoMessage: string = null;
  displayInfoMessage: boolean = false;
  recipesAreTagged: boolean = false;
  sortBy: string = 'New';
  sortByStringDisplay: string = 'Popular';
  searchValue: string = null;
  loadingString: string = 'Loading recipes ...'

  constructor(public recipeService: RecipeService, private authService: AuthService, private route: ActivatedRoute, private router: Router) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    }
   }

  ngOnInit() {
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    // component is used to both display ALL recipes, and recipes by tag name. Check existence of parameter property to amend/set component properties accordingly
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('tag')) {
        this.tagName = paramMap.get('tag');
        this.recipesAreTagged = true;
      }
    })
    // recipes should be sorted by "New" by default
    this.getRecipes('New');
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService.getAuthStatusListener()
    .subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();
    })
    this.isLoading = false;
  }

  // method called from DOM to apply dynamic styling according to whether or not user has favourited recipe in view
  userHasVoted(recipe: RecipeModel) {
    if (recipe.voters.indexOf(this.userId) > -1) {
      return 'favourited'
    } else {
      return 'not-favourited'
    }
  }

  addToFavourites(recipe: RecipeModel, index: number) {
    let msg: string;
    // if user is not authenticated, prevent data from transmitting
    if (!this.userIsAuthenticated) {
      msg = 'You must be logged in to do that';
      this.showInfoMessage(msg);
      return
    }
    // user cannot favourite their own recipes. Check that recipe creatorId property is not the same as user's userId. 
    if (this.userId === recipe.creatorId) {
      msg = 'Cannot unfavourite recipes you have created';
      this.showInfoMessage(msg);
      return
    }
    // If user has already favourited recipe, UNfavourite, and replace recipe with response from backend - this allows for reinitialisation of state, styling rules etc
    if (recipe.voters.indexOf(this.userId) > -1) {
      this.recipeService.removeFromFavourites(recipe)
      .subscribe(response => {
        this.recipes[index] = response;
        msg = `${recipe.name} removed from your favourites`;
        this.showInfoMessage(msg);
      })
    } else {
      // if above checks pass, add the recipe to users favoruites and replace recipe with response from backed
      this.recipeService.addToFavourites(recipe)
      .subscribe(response => {
        this.recipes[index] = response;
        msg = `${recipe.name} added to your favourites`
        this.showInfoMessage(msg);
      })
    }
  }

  // info message displayed to user on certain events (eg favouriting a recipe)
  showInfoMessage(message: string) {
    this.infoMessage = message;
    this.displayInfoMessage = true;
    setTimeout(() => {
      this.displayInfoMessage = false;
      this.infoMessage = null;
    }, 2500)
  }

  // below method fetches recipes from backend asynchronously, and allows for infinite scrolling.
  // sortBy passed to backend to sort recipes return either by newest first, or highest votes first
  // the length of current recipes array is also passed to backend, ensuring that reipes returned are not duplicated
  getRecipes(sortBy: string) {
    const skipOption = this.recipes.length;
    const sortByString = sortBy;
    // recipesAreTagged property on component is determined by whether or not there is a "tag" property in route parameters. This is handled on page initialisation - see ngOnInit method
    if (!this.recipesAreTagged) {
      this.recipeService.getRecipes(skipOption, sortByString)
      .subscribe(
        response => {
          response.forEach(recipe => {
            this.recipes.push(recipe)
          })
          if (this.recipes.length === 0) {
            this.loadingString = 'No recipes to display ...'
          }
        })
    } else {
      this.recipeService.getRecipesByTagName(this.tagName, skipOption, sortByString)
      .subscribe(response => {
        response.forEach(recipe => {
          this.recipes.push(recipe)
        })
        if (this.recipes.length === 0) {
          this.loadingString = 'No recipes to display ...'
        }
      })
    }
  }

  // method called by Scroll event, continously fetching and updating recipes from backend
  onScroll() {
    this.getRecipes(this.sortBy);
  }

  // toggle the sortBy property to allow user to sort by newest recipes first, or most popular recipes first
  sortRecipes() {
    this.recipes = [];
    if (this.sortBy === 'New') {
      this.sortBy = 'Popular';
      this.sortByStringDisplay = 'New';
    } else {
      this.sortBy = 'New'
      this.sortByStringDisplay = 'Popular';
    }
    this.getRecipes(this.sortBy)
  }

  // get searchValue value from input field, and redirect user to appropriate rout
  searchTags() {
    if (!this.searchValue || this.searchValue.length == 0) {
      return
    }
    this.router.navigate(['/tag', this.searchValue])
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

}
