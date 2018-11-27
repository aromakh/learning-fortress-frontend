import * as mojs from 'mo-js';

function isIOSSafari() {
    let userAgent;
    userAgent = window.navigator.userAgent;
    return userAgent.match(/iPad/i) || userAgent.match(/iPhone/i);
}

function isTouch() {
    let isIETouch;
    isIETouch = navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    return [].indexOf.call(window, 'ontouchstart') >= 0 || isIETouch;
}

// taken from mo.js demos
const isIOS = isIOSSafari(),
    clickHandler = isIOS || isTouch() ? 'touchstart' : 'click';

function extend( a, b ) {
    for (const key in b ) {
        if (b.hasOwnProperty( key ) ) {
            a[key] = b[key];
        }
    }
    return a;
}

function Animocon(el, options, sounds = []) {
    this.el = el;
    this.options = extend( {}, this.options );
    extend( this.options, options );

    this.timeline = new mojs.Timeline();

    for (let i = 0, len = this.options.tweens.length; i < len; ++i) {
        this.timeline.add(this.options.tweens[i]);
    }

    const self = this;
    this.el.addEventListener(clickHandler, function() {
        sounds.forEach(sound => {
            if (sound.delay) {
                setTimeout(function() {
                    const audio = new Audio(sound.src);
                    audio.play();
                }, sound.delay);
            } else {
                const audio = new Audio(sound.src);
                audio.play();
            }
        });
        self.timeline.replay();
    });
}

Animocon.prototype.options = {
    tweens : [new mojs.Burst({})],
};

// Animocon animation function
export function animateButtons(buttons, sounds = []) {
    buttons.forEach(el1 => {
        const el1span = el1.querySelector('mat-icon');
        const notUsedObj = new Animocon(el1, {
            tweens : [
                // burst animation
                new mojs.Burst({
                    parent: el1,
                    radius: {30: 90},
                    count: 6,
                    children : {
                        fill: '#0076b4',
                        opacity: 0.6,
                        radius: 15,
                        duration: 1700,
                        easing: mojs.easing.bezier(0.1, 1, 0.3, 1)
                    }
                }),
                // ring animation
                new mojs.Shape({
                    parent: 		el1,
                    type: 			'circle',
                    radius: 		{0: 60},
                    fill: 			'transparent',
                    stroke: 		'#0076b4',
                    strokeWidth: {20: 0},
                    opacity: 		0.6,
                    duration: 	700,
                    easing: 		mojs.easing.sin.out
                }),
                // icon scale animation
                new mojs.Tween({
                    // This is longer than the slide transition to next question
                    // But it seems to work ok at the moment
                    duration : 1200,
                    onUpdate: function(progress) {
                        if (progress > 0.3) {
                            const elasticOutProgress = mojs.easing.elastic.out(1.43 * progress - 0.43);
                            el1span.style.WebkitTransform = el1span.style.transform =
                                'scale3d(' + elasticOutProgress + ',' + elasticOutProgress + ',1)';
                        } else {
                            el1span.style.WebkitTransform = el1span.style.transform = 'scale3d(0,0,1)';
                        }
                    }
                })
            ],
        }, sounds);
    });
}
