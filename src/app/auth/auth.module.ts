import { FirebaseUIAuthConfig, AuthProvider, AuthMethods, CredentialHelper, FirebaseUIModule } from "firebaseui-angular";
import { AngularFireModule } from "@angular/fire"
import { AngularFireAuthModule } from "@angular/fire/auth";
import { NgModule } from "@angular/core";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";

// https://github.com/RaphaelJenni/FirebaseUI-Angular
//
const firebaseUiAuthConfig: FirebaseUIAuthConfig = {
    providers: [
      AuthProvider.Password,
      AuthProvider.Google
    ],
    method: AuthMethods.Popup,
    // tos: '<your-tos-link>',
    credentialHelper: CredentialHelper.AccountChooser,
    autoUpgradeAnonymousUsers: false,
    disableSignInSuccessCallback: true,
};

@NgModule({
    imports: [
        AngularFireAuthModule,
        FirebaseUIModule.forRoot(firebaseUiAuthConfig)
    ],
    exports: [
        AngularFireAuthModule,
        FirebaseUIModule
    ],
    providers: [
        AuthService
    ]
})
export class AuthModule { }
