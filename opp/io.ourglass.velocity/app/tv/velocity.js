/**
 * Created by mkahn on 6/23/16.
 */


window.onload = function() {

    console.log( "Ready!" );

    var scroller = $('.scroller');

    var SPEED = 100;

    var startX = window.innerWidth;
    var dX = window.innerWidth+scroller.width();
    var time = (dX/SPEED)*1000;

    function loop() {
    	console.log('Looping');
    	scroller.velocity( { translateX: '-'+dX, translateZ: 0 }, { duration: time, easing: 'linear', complete: function() {
    		scroller.velocity( { translateX: 0 }, { duration: 0, complete: loop } );
    	} } );
    }

    scroller.css({left:startX});
    loop();

}

