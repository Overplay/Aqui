/**
 * Created by mkahn on 12/26/16.
 */


/*

 Pass in array like this:
 [ { heading: "Coming Up", messages: [ "Basketball", "GSW vs LAL" ] }, ... ]
 */

app.directive( 'vertMsgBox',
    function ( $log, $timeout, $rootScope ) {
        return {
            restrict:    'E',
            scope:       {
                msgBlocks: '='
            },
            templateUrl: 'app/components/crawler/vrtmessage.template.html',
            link:        function ( scope, elem, attrs ) {

                var DISPLAY_DURATION = attrs.delay || 5000;
                var blockIdx;
                var msgIdx;
                var blocks = [];
                var terminate = false;

                function resetView() {

                    scope.nup = {
                        message:         '',
                        header:          '',
                        hideHeader:      true,
                        showMessage:     false,
                        showPlaceholder: true,
                        placeholderSrc:  attrs.placeholderSrc || "assets/img/OG_LOGO.png"
                    }

                    blockIdx = 0;
                    msgIdx = 0;
                    terminate = false;
                }


                function switchHeader( title ) {

                    scope.nup.hideHeader = true;
                    if ( terminate )
                        return;
                    $timeout( (function ( newTitle ) {
                        return function () {
                            scope.nup.header = newTitle
                            scope.nup.hideHeader = false;
                        }
                    })( title ), 1000 );

                }

                function switchMessage( msg ) {
                    scope.nup.showMessage = false;

                    if ( terminate )
                        return;

                    $timeout( (function ( newMessage ) {
                        return function () {
                            scope.nup.message = newMessage
                            scope.nup.showMessage = true;
                        }
                    })( msg ), 1000 );
                }

                function showNextMessage() {

                    if ( terminate )
                        return;

                    var msgs = blocks[ blockIdx ].messages;
                    switchMessage( msgs[ msgIdx ] );
                    msgIdx++;

                    if ( msgIdx < msgs.length ) {
                        $timeout( function () {
                            showNextMessage();
                        }, DISPLAY_DURATION );
                    } else {
                        $timeout( function () {
                            blockIdx++;
                            msgIdx = 0;
                            showNextEntry();
                        }, DISPLAY_DURATION );
                    }

                }

                function showNextEntry() {

                    if ( terminate )
                        return;

                    if ( blockIdx < blocks.length ) {
                        switchHeader( blocks[ blockIdx ].header );
                        showNextMessage();
                    } else {
                        switchHeader( '' );
                        switchMessage( '' );
                        $rootScope.$broadcast( 'VERT_RELOAD_INTERVAL' );
                        $timeout( startCycle, 1000 );
                    }

                }

                function startCycle() {
                    resetView();
                    blocks = _.cloneDeep( scope.msgBlocks );
                    if ( blocks.length == 0 ) {
                        scope.nup.showPlaceholder = true;
                    } else {
                        scope.nup.showPlaceholder = false;
                        showNextEntry();
                    }
                }

                function stopCycle() {
                    terminate = true;
                    scope.nup.hideHeader = true;
                    scope.nup.showMessage = false;
                }

                scope.$watch( 'msgBlocks', function ( nval ) {
                    if ( nval.length && scope.nup.showPlaceholder ){
                        startCycle();
                    }
                    if (!nval || !nval.length){
                        scope.nup.showPlaceholder = true;
                    }
                } );


                startCycle();

            }
        }
    } );