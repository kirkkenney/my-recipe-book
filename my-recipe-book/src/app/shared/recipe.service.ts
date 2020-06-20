import { RecipeModel } from './recipe.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

const BACKEND_URL = `${environment.apiUrl}/recipe`

@Injectable({
    providedIn: 'root'
})

export class RecipeService {

    private recipes: RecipeModel[] = [];
    private recentRecipes: RecipeModel[] = [];
    private recipeItem: RecipeModel;
    recipesUpdated = new Subject<{ recipes: RecipeModel[], recipeCount: number }>();
    recentRecipesUpdated = new Subject<RecipeModel[]>();
    recipeCount: number;

    constructor(private http: HttpClient, private router: Router) {}

    getUpdatedRecipesListener() {
        return this.recipesUpdated.asObservable();
    }

    getRecentRecipesListener() {
      return this.recentRecipesUpdated.asObservable();
    }

    addRecipe(recipe: RecipeModel) {
      const recipeData: RecipeModel = recipe;
      this.http.post<RecipeModel>(`${BACKEND_URL}/create-recipe`, recipeData)
      .subscribe(response => {
        this.router.navigate(['/discover'])
      })
  }

    getRecentRecipes() {
      this.http.get<RecipeModel[]>(`${BACKEND_URL}/recent`)
      .subscribe(response => {
        this.recentRecipes = response;
        this.recentRecipesUpdated.next([...this.recentRecipes]);
      })
    }

    getRecipeItem(id: string) {
      return this.http.get<RecipeModel>(`${BACKEND_URL}/id?id=${id}`)
    }

    addToFavourites(recipe: RecipeModel) {
      return this.http.post<RecipeModel>(`${BACKEND_URL}/add-to-favourites`, recipe)
    }

    removeFromFavourites(recipe: RecipeModel) {
      return this.http.post<RecipeModel>(`${BACKEND_URL}/remove-from-favourites`, recipe)
    }

    // replaceRecipe method is called when a recipe is updated. This allows asynchronous reloading of an individual recipe so as to not need to reload the entire list
    replaceRecipe(index: number, recipe: RecipeModel) {
      this.recipes[index] = recipe;
      this.recipesUpdated.next({
        recipes: [...this.recipes],
        recipeCount: this.recipeCount
      })
    }

    getRecipes(skipOption: number, sortBy: string) {
      return this.http.get<RecipeModel[]>(`${BACKEND_URL}?skipOption=${skipOption}&sortBy=${sortBy}`)
    }

    getRecipesByTagName(tag: string, skipOption: number, sortBy: string) {
      return this.http.get<RecipeModel[]>(`${BACKEND_URL}/tag?skipOption=${skipOption}&tag=${tag}&sortBy=${sortBy}`)
    }

    deleteRecipe(id: string) {
      const data = { id: id }
      return this.http.post<{message: string}>(`${BACKEND_URL}/delete-recipe`, data)
    }

    editRecipe(recipe: RecipeModel) {
      this.http.post<{success: boolean, message: string}>(`${BACKEND_URL}/edit-recipe`, recipe)
      .subscribe(response => {
        if (response.success) {
          this.router.navigate(['/recipe', recipe.id])
        }
      })
    }

}