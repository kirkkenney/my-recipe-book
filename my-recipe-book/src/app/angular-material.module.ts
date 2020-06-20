import { MatToolbarModule, MatMenuModule, MatIconModule, MatButtonModule, MatInputModule, MatCardModule, MatFormFieldModule, MatProgressSpinnerModule, MatPaginatorModule, MatDialogModule, MatChipsModule, MatAutocompleteModule } from '@angular/material';
import { NgModule } from "@angular/core";

@NgModule({
    imports: [
        MatToolbarModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatCardModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        MatDialogModule,
        MatChipsModule,
        MatAutocompleteModule
    ],
    exports: [
        MatToolbarModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatCardModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        MatDialogModule,
        MatChipsModule,
        MatAutocompleteModule
    ]
})

export class AngularMaterialModule {}