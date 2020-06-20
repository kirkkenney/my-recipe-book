import { RecipeModel } from './../shared/recipe.model';
import { HttpClient } from '@angular/common/http';
import { UserModel } from './user.model';
import { environment } from "../../environments/environment";
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';


const BACKEND_URL = `${environment.apiUrl}/user`

@Injectable({
    providedIn: 'root'
})

export class UserService {

    private userData: UserModel;
    private userUpdates = new Subject<UserModel>();
    private userShoppingList: string[];
    private userShoppingListUpdates = new Subject<string[]>();
    

    constructor(private http: HttpClient) {}

    getUserDataListener() {
        return this.userUpdates.asObservable();
    }

    getUserShoppingListListener() {
        return this.userShoppingListUpdates.asObservable();
    }

    // get queried user data to assign to properties on this service
    // data is re-formatted to be compliant with data model
    getUserData(username: string) {
        this.http.get<UserModel>(`${BACKEND_URL}/get-user/${username}`)
        .pipe(
            tap((data: UserModel) => {
                return {
                    id: data.id,
                    username: data.username,
                    savedRecipes: data.savedRecipes,
                    createdRecipes: data.createdRecipes,
                    shoppingList: data.shoppingList.sort((a, b) => {
                        return a.toLowerCase().localeCompare(b.toLowerCase())
                    }),
                    createdAt: data.createdAt
                }
            })
        )
        .subscribe(user => {
            this.userData = user;
            this.userShoppingList = user.shoppingList;
            this.userUpdates.next(this.userData);
            this.userShoppingListUpdates.next(this.userShoppingList);
        })
    }

    addToShoppingList(ingredients: string[]) {
        this.http.post<string[]>(`${BACKEND_URL}/add-to-shopping-list`, ingredients)
        .subscribe(response => {
            this.userShoppingList = response;
            this.userShoppingListUpdates.next(this.userShoppingList);
        })
    }

    updateShoppingList(ingredients: [{name: string, amount: number}]) {
        this.http.post<string[]>(`${BACKEND_URL}/update-shopping-list`, ingredients)
        .subscribe(response => {
            this.userShoppingList = response.sort((a, b) => {
                return a.toLowerCase().localeCompare(b.toLowerCase())
            })
            this.userShoppingListUpdates.next(this.userShoppingList);
        })
    }

}

