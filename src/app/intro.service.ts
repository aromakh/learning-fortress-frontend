import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class IntroService {
    introPage: number = 1 as number;

    nextPage() {
      this.introPage++;
    }
}
