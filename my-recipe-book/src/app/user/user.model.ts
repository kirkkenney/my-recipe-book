import { RecipeModel } from './../shared/recipe.model';

export interface UserModel {
    id: string;
    username: string;
    savedRecipes: RecipeModel[];
    createdRecipes: RecipeModel[];
    shoppingList: string[];
    createdAt: Date;
}