import { Injectable } from "@angular/core";
import * as introJs from 'intro.js';

@Injectable({
    providedIn: 'root'
})
export class IntroService {
    introPage: number = 1 as number;
    isSkipped: Boolean = false;

    nextPage() {
      this.introPage++;
    }

    start(successCallback) {
        setTimeout(() => {
            let isDone = false;
            introJs().start()
            .oncomplete(function() {
                isDone = true;
                this.nextPage();
                successCallback();
            }.bind(this))
            .onskip(() => {
                !isDone ? this.skip() : null;
            });
        }, 200);
    }

    skip() {
        this.isSkipped = true;
    }
}
