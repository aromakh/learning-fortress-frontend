import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase';
import { Observable } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { DragulaService } from 'ng2-dragula';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent {
    constructor(private dragula: DragulaService, public authService: AuthService) { 
        this.dragulaIOS11Fix();
    }

    dragulaIOS11Fix() {
        let isScrolable: Boolean = true;

        const listener = function(e) {
            if (isScrolable) {
                e.preventDefault();
            }
        };

        document.addEventListener('touchmove', listener, { passive: false });

        this.dragula
            .drag()
            .subscribe(value => {
                isScrolable = true;
        });

        this.dragula
            .drop()
            .subscribe(value => {
                isScrolable = false;
        });
    }
}
