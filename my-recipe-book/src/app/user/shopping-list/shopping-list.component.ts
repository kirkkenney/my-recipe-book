import { FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/user/user.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  
  username: string;
  shoppingList: string[];
  shoppingListSubscription: Subscription;
  form: FormGroup;
  infoMessage: string = null;
  displayInfoMessage: boolean = false;
  isLoading: boolean;

  constructor(private userService: UserService, private authService: AuthService) { }

  ngOnInit() {
    this.isLoading = true;
    this.username = this.authService.getUsername();
    this.userService.getUserData(this.username);
    // subscribe to user's ShoppingList data to asynchronously load, edit, delete etc
    this.shoppingListSubscription = this.userService.getUserShoppingListListener()
    .subscribe(shoppingList => {
      this.shoppingList = shoppingList;
      this.initForm();
    })
    this.isLoading = false;
  }

  initForm() {
    this.form = new FormGroup({
      ingredients: new FormArray([])
    });
    this.shoppingList.forEach(ingredient => {
      (<FormArray>this.form.get('ingredients')).push(
        new FormControl(ingredient.trim(), Validators.required)
      )
    })
  }

  get ingredientControls() {
    return (<FormArray>this.form.get('ingredients')).controls;
  }

  deleteIngredient(index: number) {
    (<FormArray>this.form.get('ingredients')).removeAt(index);
  }

  addIngredient() {
    (<FormArray>this.form.get('ingredients')).push(
      new FormControl(null, Validators.required)
    )
  }

  onSubmit() {
    if (!this.form.valid) {
      return
    }
    this.userService.updateShoppingList(this.form.value)
    this.showInfoMessage('Shopping List updated')
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
    this.shoppingListSubscription.unsubscribe();
  }

}
