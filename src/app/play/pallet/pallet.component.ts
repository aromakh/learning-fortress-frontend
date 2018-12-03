import { Component, Input, ViewChild, ElementRef } from "@angular/core";
import { Pallet, Brick } from "../../schema";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { DatabaseService } from "../../database/database.service";
import { Observable } from "rxjs";
import * as introJs from 'intro.js';
import { IntroService } from "src/app/intro.service";

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

    constructor(public database: DatabaseService, private router: Router, private route: ActivatedRoute, private introService: IntroService) {
        this.route.paramMap
            .subscribe((data: ParamMap) => {
                this.palletId = data.get('id');
                this.pallet = database.getPallet(this.palletId);
                this.pallet.subscribe((pallet) => {
                    this.bricks = database.getBricksInPallet(pallet);
                    const bricks = this.bricks;

                    bricks.subscribe(bricksData => {
                        setTimeout(() => {
                            if (introService.introPage === 1) {
                                // show second and third steps
                                introJs().goToStepNumber(2).start().oncomplete(function() {
                                    introService.nextPage();
                                    router.navigate(["/play/brick/" + bricksData[0]._ref.id]);
                                });
                            } else {
                                introJs().addStep({
                                    element: this.palletTitle.nativeElement,
                                    intro: 'Welcome to Learning Fortress, try some more Bricks and tell us what you think',
                                    position: 'down'
                                }).start();
                            }
                        }, 1000);
                    });
                });
            });
    }
}
