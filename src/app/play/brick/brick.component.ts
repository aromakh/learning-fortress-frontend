import { Component } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { BrickService } from './brick.service';
import { Brick } from '../../schema';

@Component({
  templateUrl: './brick.component.html',
  styleUrls: ['./brick.component.scss'],
  styles: [
    ':host >>> .background-green { background: #44dd44; }',
    ':host >>> .color-red { color: red; }',
    ':host >>> .nowrap { white-space: nowrap; }'
    ]
})
export class BrickComponent {
    constructor(
        private bricks: BrickService,
        private route: ActivatedRoute
    ) {
        this.route.paramMap
            .subscribe((data: ParamMap) => {
                var id = data.get('id');
                bricks.loadBrick(id);
                bricks.currentBrick.subscribe((data) => {
                    this.brick = data;
                })
            })
    }

    brick: Brick;
}
