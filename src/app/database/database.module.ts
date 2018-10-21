import { NgModule } from '@angular/core';

import { AngularFirestoreModule } from '@angular/fire/firestore';
import { DatabaseService } from './database.service';

@NgModule({
    imports: [
        AngularFirestoreModule
    ],
    exports: [
        AngularFirestoreModule
    ],
    providers: [
        DatabaseService
    ]
})
export class DatabaseModule { }
