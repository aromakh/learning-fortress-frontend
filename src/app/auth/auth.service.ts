import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { User } from "firebase";
import { Observable } from "rxjs";
import { FirebaseUISignInSuccessWithAuthResult, FirebaseUISignInFailure } from "firebaseui-angular";
import { environment } from "../../environments/environment.prod";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    user: Observable<User>;

    constructor(public afAuth: AngularFireAuth, private router: Router) {
        this.user = afAuth.user;
    }

    signInSuccess(event: FirebaseUISignInSuccessWithAuthResult) {
        console.log(`signed in as ${event.authResult.user.displayName} who is${event.authResult.additionalUserInfo.isNewUser?"":" not"} a new user.`);
        return true;
    }

    signInFailure(event: FirebaseUISignInFailure) {
        console.log(`sign in failed because ${event.code}`);
        return true;
    }

    logout() {
        this.afAuth.auth.signOut();
    }
}
