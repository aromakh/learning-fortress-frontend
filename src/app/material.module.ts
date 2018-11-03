import { NgModule } from '@angular/core';

import { MatToolbarModule } from '@angular/material/toolbar'
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTreeModule } from '@angular/material/tree';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
    imports: [
        MatToolbarModule, MatIconModule, MatButtonModule, MatSidenavModule,
        MatListModule, MatChipsModule, MatProgressSpinnerModule, MatExpansionModule,
        MatStepperModule, MatButtonToggleModule, MatCardModule, MatMenuModule,
        MatFormFieldModule, MatInputModule, MatTreeModule, MatGridListModule,
        MatCheckboxModule, MatSnackBarModule, MatSelectModule
    ],
    exports: [
        MatToolbarModule, MatIconModule, MatButtonModule, MatSidenavModule,
        MatListModule, MatChipsModule, MatProgressSpinnerModule, MatExpansionModule,
        MatStepperModule, MatButtonToggleModule, MatCardModule, MatMenuModule,
        MatFormFieldModule, MatInputModule, MatTreeModule, MatGridListModule,
        MatCheckboxModule, MatSnackBarModule, MatSelectModule
    ],
})
export class MaterialModule {  }
