import { Component } from "@angular/core";
import { AuthService } from "../auth/auth.service";

@Component({
    selector: 'app-login',
    template: `
    <div class="login-body" fxLayout="column" fxLayoutAlign="center center">
        <div class="login-container" fxLayout="column" fxLayoutAlign="center center">
            <div class="login-logo">
                <img src="assets/lflogo.png" alt="lol"><br />
                <h1>Learning Fortress</h1>
            </div>
            <user-type *ngIf="!sel" (select)="selected($event)"></user-type>
            <sign-in *ngIf="sel" [userType]="userType"></sign-in>
                <img style="width:50%; margin-top: 20px" src="assets/brillder-2-logo.png" alt="lol"><br />
        </div>
    </div>
    `,
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    userType: number;

    sel: boolean = false;

    constructor(public authService: AuthService) { }

    selected(userType: number) {
        this.sel = true;
        this.userType = userType;
    }
}
