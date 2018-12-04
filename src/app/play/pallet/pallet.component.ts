import { Component, Input, ViewChild, ElementRef } from "@angular/core";
import { Pallet, Brick } from "../../schema";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { DatabaseService } from "../../database/database.service";
import { Observable } from "rxjs";
import * as introJs from 'intro.js';
import { IntroService } from "src/app/intro.service";
import { AuthService } from "src/app/auth/auth.service";

@Component({
    selector: 'pallets',
    templateUrl: './pallet.component.html',
    styleUrls: ['./pallet.component.scss']
})
export class PalletComponent {
    palletId: string;
    pallet: Observable<Pallet>;
    bricks: Observable<Brick[]>;

    intro: any = null;
    introStepCount = 1;

    @ViewChild('palletTitle') palletTitle: ElementRef;

    constructor(public database: DatabaseService, private router: Router, private route: ActivatedRoute,
        private auth: AuthService, private introService: IntroService) {

        this.route.paramMap
            .subscribe((data: ParamMap) => {
                this.palletId = data.get('id');
                this.pallet = database.getPallet(this.palletId);
                this.pallet.subscribe((pallet) => {
                    this.bricks = database.getBricksInPallet(pallet);
                    if (auth.isNewUser && !introService.isSkipped) {
                        this.showIntroduction(this.bricks, router, introService);
                    }
                });
            });
    }

    showIntroduction(bricks: Observable<Brick[]>, router: Router, introService: IntroService) {
        bricks.subscribe(bricksData => {
            setTimeout(() => {
                let isDone = false;
                if (introService.introPage === 1) {
                    // show second and third steps
                    introJs().goToStepNumber(2).start()
                    .oncomplete(function() {
                        isDone = true;
                        introService.nextPage();
                        router.navigate(["/play/brick/" + bricksData[0]._ref.id]);
                    })
                    .onskip(() => {
                        !isDone ? introService.skip() : null;
                    });
                } else {
                    introJs().addStep({
                        element: this.palletTitle.nativeElement,
                        intro: 'Welcome to Learning Fortress, try some more Bricks and tell us what you think',
                        position: 'down'
                    })
                    .start()
                    .onskip(() => {
                        introService.skip();
                    });
                }
            }, 200);
        });
    }
}
