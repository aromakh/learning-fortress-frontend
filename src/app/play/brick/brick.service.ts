import { Injectable } from '@angular/core';
import { DatabaseService } from '../../database/database.service';

import { BehaviorSubject, Observable } from 'rxjs';

import { Brick, BrickAttempt, Pallet } from '../../schema';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
    providedIn: 'root'
})
export class BrickService {
    constructor(public database: DatabaseService, private sanitizer: DomSanitizer) {
        this.currentBrick = new BehaviorSubject(null);
    }

    currentBrick: BehaviorSubject<Brick>;
    currentPallet: Observable<Pallet>;
    currentBrickAttempt: BrickAttempt;

    /*
      This function called once for each brick.
      All manipulation with bricks should be here like sanitizering HTML content.
    */
    loadBrick(id: string) {
        this.currentBrick = this.database.getBrick(id);

        this.currentBrick.subscribe(val => {
            if (val) {
                // Sanitize brick when it was load in service
                val.prep = this.sanitizer.bypassSecurityTrustHtml(val.prep) as string;
                this.currentPallet = this.database.getPallet(val.pallet.id);
            }
        })
    }

    publishBrickAttempt(ba: BrickAttempt) {
        this.database.createBrickAttempt(ba).subscribe((msg) => {
            console.log(msg);
        });
    }
}
