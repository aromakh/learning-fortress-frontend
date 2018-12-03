import { Component, Input } from "@angular/core";
import { Pallet, Brick } from "../../schema";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { DatabaseService } from "../../database/database.service";
import { Observable } from "rxjs";
import * as introJs from 'intro.js';

@Component({
    selector: 'pallets',
    templateUrl: './pallet.component.html',
    styleUrls: ['./pallet.component.scss']
})
export class PalletComponent {
    palletId: string;
    pallet: Observable<Pallet>;
    bricks: Observable<Brick[]>;

    constructor(public database: DatabaseService, private router: Router, private route: ActivatedRoute) {
        this.route.paramMap
            .subscribe((data: ParamMap) => {
                this.palletId = data.get('id');
                this.pallet = database.getPallet(this.palletId);
                this.pallet.subscribe((pallet) => {
                    this.bricks = database.getBricksInPallet(pallet);
                    const bricks = this.bricks;
                    
                    bricks.subscribe(bricksData => {
                        setTimeout(() => {
                            introJs().setOption('doneLabel', 'Next page').start().oncomplete(function() {
                                router.navigate(["/play/brick/" + bricksData[0]._ref.id]);
                            });
                        }, 1000);
                    });
                });
            });
    }
}
