/**
 * Created by mkahn on 4/10/16.
 */

/**
 *
 * Wraps some of the more labor intensive bits of UI-Bootstrap such as:
 * - Modals
 *
 *
 */

(function ( window, angular, undefined ) {

    angular.module( 'ui.ogMobile', [] )

    // Templatlized, specialized UIB Helper
        .factory( 'uibHelper', function ( $log, $uibModal, $templateCache ) {

            var _curtain;

            var service = {};

            /**
             *
             * Provides a very basic UIB confirm modal with almost no options. Returns the result promise.
             *
             * Usage:  uibHelper.confirmModal("My Title", "Body Text", true)
             *          .then( function(confirmed){
     *              // do something with confirmation
     *          });
             *
             * @param title
             * @param body
             * @param confirmValue
             * @returns {*}
             */
            service.confirmModal = function ( title, body, confirmValue ) {

                var modalInstance = $uibModal.open( {
                    templateUrl: 'confirmmodal.template.html',
                    controller:  function ( $scope, $uibModalInstance, params ) {

                        $scope.modalUi = { title: params.title, body: params.body };

                        $scope.ok = function () {
                            $uibModalInstance.close( params.confirmValue );
                        }

                        $scope.cancel = function () {
                            $uibModalInstance.dismiss( 'cancel' );
                        }

                    },
                    resolve:     {
                        params: function () {
                            return { title: title, body: body, confirmValue: confirmValue };
                        }
                    }
                } );

                return modalInstance.result;


            }

            /**
             *
             * Provides a very basic UIB heads-up modal with almost no options. Returns the result promise.
             *
             * Usage:  uibHelper.headsupModal("My Title", "Body Text")
             *          .then( function(){
     *          });
             *
             * @param title
             * @param body
             * @returns {*}
             */
            service.headsupModal = function ( title, body ) {

                var modalInstance = $uibModal.open( {
                    templateUrl: 'headsupmodal.template.html',
                    controller:  function ( $scope, $uibModalInstance, params ) {

                        $scope.modalUi = { title: params.title, body: params.body };

                        $scope.ok = function () {
                            $uibModalInstance.close();
                        }


                    },
                    resolve:     {
                        params: function () {
                            return { title: title, body: body };
                        }
                    }
                } );

                return modalInstance.result;


            }


            /**
             *
             * Provides a very  UIB  modal to pick a date. Returns the result promise.
             *
             * Usage:  uibHelper.dateModal("My Title", "Body Text", currentDateChoice)
             *          .then( function(newDate){
     *              // do something with newDate
     *          });
             *
             * @param title
             * @param body
             * @param currentDataChoice
             * @returns {*}
             */
            service.dateModal = function ( title, body, currentDateChoice ) {

                var modalInstance = $uibModal.open( {
                    templateUrl: 'datemodal.template.html',
                    controller:  function ( $scope, $uibModalInstance, params ) {

                        if ( !_.isDate( params.currentDateChoice ) ) {
                            params.currentDateChoice ?
                                params.currentDateChoice = new Date( params.currentDateChoice ) :
                                params.currentDateChoice = new Date();
                        }

                        $scope.modalUi = {
                            title:             params.title,
                            body:              params.body,
                            date:              params.currentDateChoice,
                            datePickerOptions: {
                                minDate:   new Date(),
                                showWeeks: true
                            },
                            time:              new Date( params.currentDateChoice )

                        };

                        $scope.ok = function () {
                            $scope.modalUi.date.setHours( $scope.modalUi.time.getHours() );
                            $scope.modalUi.date.setMinutes( $scope.modalUi.time.getMinutes() );
                            $uibModalInstance.close( $scope.modalUi.date );
                        }

                        $scope.cancel = function () {
                            $uibModalInstance.dismiss( 'cancel' );
                        }

                    },
                    resolve:     {
                        params: function () {
                            return { title: title, body: body, currentDateChoice: currentDateChoice };
                        }
                    }
                } );

                return modalInstance.result;


            }

            // selectListModal

            /**
             *
             * Provides a UIB  from a list of objects. Returns the result promise.
             *
             * Usage:  uibHelper.selectListModal("My Title", "Body Text", [[ "choice 1" "beer"], ["choice 2", "wine"]],
             * 1)
             *          .then( function(newDate){
     *              // do something with newDate
     *          });
             *
             * @param title
             * @param body
             * @param choiceArray [ [ field1, field2, ... ], ... ]
             * @param currentChoiceIdx
             * @returns {*}
             */
            service.selectListModal = function ( title, body, choiceArray, currentChoiceIdx ) {

                var modalInstance = $uibModal.open( {
                    templateUrl: 'selectlistmodal.template.html',
                    controller:  function ( $scope, $uibModalInstance, params ) {

                        $scope.modalUi = {
                            title:         params.title, body: params.body, choices: params.choices,
                            currentChoice: params.currentChoice, showChoice: !params.body
                        };

                        $scope.ok = function () {
                            $uibModalInstance.close( $scope.modalUi.currentChoice );
                        }

                        $scope.cancel = function () {
                            $uibModalInstance.dismiss( 'cancel' );
                        }

                    },
                    resolve:     {
                        params: function () {
                            return { title: title, body: body, choices: choiceArray, currentChoice: currentChoiceIdx };
                        }
                    }
                } );

                return modalInstance.result;


            }

            /**
             *
             * Provides a very  UIB  modal to edit a single string. Returns the result promise.
             *
             * Usage:  uibHelper.stringEditModal("My Title", "Body Text", string2Edit)
             *          .then( function(confirmed){
     *              // do something with confirmation
     *          });
             *
             * @param title
             * @param body
             * @param string2Edit
             * @param placeholder
             * @returns {*}
             */
            service.stringEditModal = function ( title, body, string2Edit, placeholder ) {

                var modalInstance = $uibModal.open( {
                    templateUrl: 'stringeditmodal.template.html',
                    controller:  function ( $scope, $uibModalInstance, params ) {

                        $scope.modalUi = {
                            title:       params.title,
                            body:        params.body,
                            editString:  params.string2Edit,
                            placeholder: params.placeholder || params.title
                        };

                        $scope.ok = function () {
                            $uibModalInstance.close( $scope.modalUi.editString );
                        }

                        $scope.cancel = function () {
                            $uibModalInstance.dismiss( 'cancel' );
                        }

                    },
                    resolve:     {
                        params: function () {
                            return { title: title, body: body, string2Edit: string2Edit, placeholder: placeholder };
                        }
                    }
                } );

                return modalInstance.result;


            }

            /**
             *
             * Provides a  UIB  modal to edit a series of strings. Returns the result promise.
             *
             * Usage:  uibHelper.inputBoxesModal("My Title", "Body Text", paramsArray)
             *          .then( function(confirmed){
     *              // do something with confirmation
     *          });
             *
             * @param title
             * @param body
             * @param fieldsArray [ { label:"First Name", placeholder: "LaLa", type: text, field: 'firstName', value:
             *     'John' }]
             * @param placeholder
             * @returns {*}
             */
            service.inputBoxesModal = function ( title, body, fieldsArray ) {

                var modalInstance = $uibModal.open( {
                    templateUrl: 'inputboxesmodal.template.html',
                    controller:  function ( $scope, $uibModalInstance, params ) {

                        $scope.modalUi = {
                            title:       params.title,
                            body:        params.body,
                            fieldsArray: params.fieldsArray
                        };


                        $scope.ok = function () {
                            var rval = {};
                            $scope.modalUi.fieldsArray.forEach( function ( f ) {
                                rval[ f.field ] = f.value;
                            } )
                            $uibModalInstance.close( rval );
                        }

                        $scope.cancel = function () {
                            $uibModalInstance.dismiss( 'cancel' );
                        }

                    },
                    resolve:     {
                        params: function () {
                            return { title: title, body: body, fieldsArray: fieldsArray };
                        }
                    }
                } );

                return modalInstance.result;

            }
            
            service.curtainModal = function(title){

                var chtml = $templateCache.get('curtain.template.html');
                var t = title || '';
                chtml = chtml.replace('$$message$$', title);
                _curtain = angular.element( chtml );
                
                var body = angular.element( document ).find( 'body' ).eq( 0 );

                body.append( _curtain )

                return {
                    dismiss: function(){
                        $log.debug("Detaching");
                        _curtain.remove();
                    }
                }
                
            }

            service.dismissCurtain = function(){
                if (_curtain)
                    _curtain.remove();
            }

            return service;

        } )

        // These are generated via Gulp task
        .run( [ '$templateCache', function ( $templateCache ) {
            console.log( "Loading ogUI Template Cache" );
            $templateCache.put( 'curtain.template.html', '<style>\n\n    .curtain {\n\n        position: absolute;\n        top: 0;\n        bottom: 0;\n        left: 0;\n        width: 100%;\n        background: rgba(0,0,0,0.7);\n\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        flex-direction: column;z-index: 1000;    }\n\n    .spinner-holder {\n        width: 80px;\n        height: 80px;\n        background-color: #00A000;\n        padding: 5px;\n        border-radius: 5px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n    }\n\n    .spinner {\n        width: 40px;\n        height: 40px;\n        /*position: relative;*/\n        text-align: center;\n        margin-bottom: 8px;\n\n        -webkit-animation: sk-rotate 2.0s infinite linear;\n        animation: sk-rotate 2.0s infinite linear;\n    }\n\n    .dot1, .dot2 {\n        width: 60%;\n        height: 60%;\n        display: inline-block;\n        position: absolute;\n        top: 0;\n        background-color: #ffffff;\n        border-radius: 100%;\n\n        -webkit-animation: sk-bounce 2.0s infinite ease-in-out;\n        animation: sk-bounce 2.0s infinite ease-in-out;\n    }\n\n    .dot2 {\n        top: auto;\n        bottom: 0;\n        -webkit-animation-delay: -1.0s;\n        animation-delay: -1.0s;\n    }\n\n    @-webkit-keyframes sk-rotate {\n        100% {\n            -webkit-transform: rotate(360deg)\n        }\n    }\n\n    @keyframes sk-rotate {\n        100% {\n            transform: rotate(360deg);\n            -webkit-transform: rotate(360deg)\n        }\n    }\n\n    @-webkit-keyframes sk-bounce {\n        0%, 100% {\n            -webkit-transform: scale(0.0)\n        }\n        50% {\n            -webkit-transform: scale(1.0)\n        }\n    }\n\n    @keyframes sk-bounce {\n        0%, 100% {\n            transform: scale(0.0);\n            -webkit-transform: scale(0.0);\n        }\n        50% {\n            transform: scale(1.0);\n            -webkit-transform: scale(1.0);\n        }\n    }\n</style>\n<div class="curtain">\n    <div class="spinner-holder">\n        <div class="spinner">\n            <div class="dot1"></div>\n            <div class="dot2"></div>\n        </div></div><h3>$$message$$</h3></div>\n' );
            $templateCache.put( 'confirmmodal.template.html', '<div class="modal-header">\n    <h3 class="modal-title">{{ modalUi.title }}</h3>\n</div>\n<div class="modal-body">\n    {{ modalUi.body }}\n</div>\n<div class="modal-footer">\n    <button class="btn btn-primary" type="button" ng-click="ok()">OK</button>\n    <button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button>\n</div>' );
            $templateCache.put( 'datemodal.template.html', '<div class="modal-header">\n    <h3 class="modal-title">{{ modalUi.title }}</h3>\n</div>\n<div class="modal-body">\n    {{ modalUi.body }}\n    <!--\n    <uib-datepicker ng-model="modalUi.date" class="well well-sm" datepicker-options="options"></uib-datepicker>\n    -->\n    <p class="input-group">\n        <input type="text" class="form-control" uib-datepicker-popup="MMMM-dd-yyyy" ng-model="modalUi.date"\n               is-open="modalUi.dateOpened"\n               datepicker-options="modalUi.datePickerOptions" ng-required="true" close-text="Close"/>\n          <span class="input-group-btn">\n            <button type="button" class="btn btn-default" ng-click="modalUi.dateOpened = !modalUi.dateOpened"><i\n                    class="glyphicon glyphicon-calendar"></i></button>\n          </span>\n    </p>\n    <uib-timepicker ng-model="modalUi.time" hour-step="1" minute-step="15"\n                    show-meridian="true"></uib-timepicker>\n</div>\n<div class="modal-footer">\n    <button class="btn btn-primary" type="button" ng-click="ok()">OK</button>\n    <button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button>\n</div>' );
            $templateCache.put( 'headsupmodal.template.html', '<div class="modal-header">\n    <h3 class="modal-title">{{ modalUi.title }}</h3>\n</div>\n<div class="modal-body">\n    {{ modalUi.body }}\n</div>\n<div class="modal-footer">\n    <button class="btn btn-primary" type="button" ng-click="ok()">OK</button>\n</div>' );
            $templateCache.put( 'inputboxesmodal.template.html', '<div class="modal-header">\n    <h3 class="modal-title">{{ modalUi.title }}</h3>\n</div>\n<div class="modal-body">\n    <p>{{ modalUi.body }}</p>\n    <div class="form-group" ng-repeat="f in modalUi.fieldsArray track by $index" >\n        <label for="{{ \'f\'+$index }}">{{ f.label }}</label>\n        <input type="{{ f.type }}" placeholder="{{ f.placeholder }}"\n               class="form-control" id="{{ \'f\'+$index }}"\n               ng-model="f.value">\n    </div>\n</div>\n\n<div class="modal-footer">\n    <button class="btn btn-primary" type="button" ng-click="ok()">OK</button>\n    <button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button>\n</div>' );
            $templateCache.put( 'selectlistmodal.template.html', '<style>\n    .slm-pick-item {\n        color: teal;\n        padding: 10px 0 10px 5px;\n        margin-left: 0;\n    }\n\n    .slm-picked {\n        background: #696969;\n        color: white;\n        transition: all 0.5s;\n    }\n\n    .slm-no-num {\n        list-style-type: none;\n        padding: 10px;\n    }\n</style>\n\n<div class="modal-header">\n    <h3 class="modal-title">{{ modalUi.title }}</h3>\n</div>\n<div class="modal-body" ng-show="showChoice">\n    {{ modalUi.choices[modalUi.currentChoice] }}\n</div>\n<div class="modal-body" ng-hide="showChoice">\n    {{ modalUi.body }}\n</div>\n<ol class="slm-no-num" style="margin: 10px; border: 1px solid #cacaca;">\n    <li ng-repeat="choice in modalUi.choices" class="slm-pick-item"\n        ng-class="{ \'slm-picked\': modalUi.currentChoice==$index}"\n        ng-click="modalUi.currentChoice = $index">{{ choice }}</li>\n</ol>\n\n\n<div class="modal-footer">\n    <button class="btn btn-primary" type="button" ng-click="ok()">OK</button>\n    <button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button>\n</div>' );
            $templateCache.put( 'stringeditmodal.template.html', '<div class="modal-header">\n    <h3 class="modal-title">{{ modalUi.title }}</h3>\n</div>\n<div class="modal-body">\n    <p>{{ modalUi.body }}</p>\n    <input class="form-control input-lg" type="text" ng-model="modalUi.editString" placeholder="{{ modalUi.placeholder }}">\n    </div>\n\n<div class="modal-footer">\n    <button class="btn btn-primary" type="button" ng-click="ok()">OK</button>\n    <button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button>\n</div>' );
        } ] )


})( window, window.angular );


