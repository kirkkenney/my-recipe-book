import { RecipeModel } from './../../shared/recipe.model';
import { RecipeService } from './../../shared/recipe.service';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material';
import {COMMA, ENTER, SPACE} from '@angular/cdk/keycodes';
import { tagInputValidator } from 'src/app/validators/recipe-create.validator';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-create-recipe',
  templateUrl: './create-recipe.component.html',
  styleUrls: ['./create-recipe.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateRecipeComponent implements OnInit, OnDestroy {
  
  isLoading: boolean;
  form: FormGroup;
  // properties used for the form chips/tags input
  selectable = true;
  removable = true;
  addOnBlur = true;

  imgPreview: string = null;
  // separator keycodes to automatically add chip/tag once user presses on of these keys
  readonly separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
  // init chips/tags with 'chicken' as a default item
  tags: string[] = ['chicken'];
  userId: string;
  userIsAuthenticated: boolean;
  userAuthStatusListener: Subscription;
  // editMode property used to determine is current page is a new recipe submission, or editing an existing recipe
  editMode: boolean = false;
  recipe: RecipeModel;
  recipeId: string;
  //

  constructor(private recipeService: RecipeService, private router: Router, private authService: AuthService, private route: ActivatedRoute) {
   }

  ngOnInit() {
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.userAuthStatusListener = this.authService.getAuthStatusListener()
    .subscribe(isAuthenticated => {
      this.userId = this.authService.getUserId();
      this.userIsAuthenticated = isAuthenticated;
    })
    // get route parameters in order to determine if current page is new recipe or editing existing recipe
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      // if route parameter includes "id" field, set component recipeId property accordingly
      if (paramMap.has('id')) {
        this.recipeId = paramMap.get('id');
        // get the recipe being edited from recipeService
        this.recipeService.getRecipeItem(this.recipeId)
        .subscribe(response => {
          // once recipe data received, set component properties accordingly
          this.editMode = true;
          this.recipe = response;
          // route protected to ensure only recipe creator can access it. Below checks that the createdId property on the recipe, matches the userId of current user
          if (this.recipe.creatorId != this.userId) {
            this.router.navigate(['/recipe'])
          }
          this.initForm();
          this.populateFetchedForm();
          this.tags = this.recipe.tags;
        })
      } else {
        this.initForm();
        this.addInstruction();
        this.addIngredient();
      }
    })
    this.isLoading = false;
  }

  private initForm() {
    let recipeName = '';
    let recipeImgPath = '';
    let recipeIngredients = new FormArray([]);
    let recipeInstructions = new FormArray([]);
    let recipeTags = ['chicken'];
    // if user is editing an existing recipe, ensure form field values are reflected accordingly
    if (this.editMode) {
      recipeName = this.recipe.name;
      recipeImgPath = (this.recipe.imgPath.endsWith('defaultimg.png')) ? null : this.recipe.imgPath;
      this.imgPreview = (this.recipe.imgPath.endsWith('defaultimg.png')) ? null : this.recipe.imgPath;
    }
    
    this.form = new FormGroup({
      'name': new FormControl(recipeName, Validators.required),
      'imgPath': new FormControl(recipeImgPath),
      'tags': new FormControl(recipeTags, [tagInputValidator]),
      'ingredients': recipeIngredients,
      'instructions': recipeInstructions
    })
  }

  // add a chip/tag
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // If value exists, add it to component tags property, and to form data
    if ((value || '').trim()) {
      this.tags.push(value.toLowerCase().trim());
      this.tagsControls.value.push(value.toLowerCase().trim());
      this.tagsControls.updateValueAndValidity();
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  // remove a chip/tag
  remove(tag: string): void {
    // get index of chip/tag
    const index = this.tags.indexOf(tag);
    const formIndex = this.form.get('tags').value.indexOf(tag)

    if (index >= 0) {
      // remove chip/tag from component tags property
      this.tags.splice(index, 1);
      // remove from form data
      this.tagsControls.value.splice(formIndex, 1);
      this.tagsControls.updateValueAndValidity();
    }
  }

  get tagsControls() {
    return this.form.get('tags');
  }

  // add a blank instruction to FormArray
  addInstruction() {
    (<FormArray>this.form.get('instructions')).push(
      new FormControl(null, Validators.required)
    )
  }

  deleteInstruction(index: number) {
    (<FormArray>this.form.get('instructions')).removeAt(index);
  }

  get instructionControls() {
    return (<FormArray>this.form.get('instructions')).controls;
  }

  // add a blank ingredient to FormArray
  addIngredient() {
    (<FormArray>this.form.get('ingredients')).push(
      new FormControl(null, Validators.required)
    )
  }

  deleteIngredient(index: number) {
    (<FormArray>this.form.get('ingredients')).removeAt(index);
  }

  get ingredientControls() {
    return (<FormArray>this.form.get('ingredients')).controls;
  }

  // populateFetchedForm method used to populate form if user is editing an existing recipe
  populateFetchedForm() {
    // add and populate an "ingredients" form field for each ingredient property on the recipe
    this.recipe.ingredients.forEach(ingredient => {
      (<FormArray>this.form.get('ingredients')).push(
        new FormControl(ingredient.trim(), Validators.required)
      )
    })
      // add and populate an "instructions" form field for each instruction property on the recipe
    this.recipe.instructions.forEach(instruction => {
      (<FormArray>this.form.get('instructions')).push(
        new FormControl(instruction.trim(), Validators.required)
      )
    })
    // empty the tags property on the form in order to remove the default "chicken" optin
    this.tagsControls.value.splice(0, 1);
    this.tagsControls.updateValueAndValidity();
    // add and populate tags form fields for each tag property on the recipe
    this.recipe.tags.forEach(tag => {
      this.tags.push(tag);
      this.tagsControls.value.push(tag);
    })
  }

  onSaveRecipe() {
    if (!this.form.valid) {
      return;
    }
    let recipe: RecipeModel = {
      id: this.recipe ? this.recipe.id : null,
      name: this.form.value.name,
      ingredients: this.form.value.ingredients,
      instructions: this.form.value.instructions,
      tags: this.form.value.tags,
      votes: null,
      voters: null,
      imgPath: this.form.value.imgPath,
      creatorId: null,
      creatorUsername: null,
      createdAt: null,
    }
    this.isLoading = true;
    if (this.editMode) {
      this.recipeService.editRecipe(recipe)
    } else {
      this.recipeService.addRecipe(recipe)
    }
  }

  updateImgPreview() {
    this.imgPreview = this.form.get('imgPath').value;
  }

  // method called on DOM "error" event if image path is not a valid image URL, updating the errors property on form field to display to user
  setImgPathError(event: any) {
    this.imgPreview = null;
    this.form.get('imgPath').setErrors({ 'invalidPath': true })
  }

  trimArrInput(string) {
    return string.trim();
  }

  ngOnDestroy() {
    this.userAuthStatusListener.unsubscribe();
  }

}
