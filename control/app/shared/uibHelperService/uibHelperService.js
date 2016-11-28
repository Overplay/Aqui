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


app.factory( 'uibHelper', function ( $log, $uibModal ) {

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
            templateUrl: 'app/shared/uibHelperService/confirmmodal.template.html',
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
            templateUrl: '/uiapp/app/shared/uibHelperService/datemodal.template.html',
            controller:  function ( $scope, $uibModalInstance, params ) {

                if (!_.isDate(params.currentDateChoice)){
                    params.currentDateChoice ?
                        params.currentDateChoice = new Date(params.currentDateChoice):
                        params.currentDateChoice = new Date();
                }

                $scope.modalUi = { title: params.title, 
                        body: params.body, 
                        date: params.currentDateChoice,
                        datePickerOptions:  {
                            minDate:     new Date(),
                            showWeeks:   true
                        },
                        time: new Date(params.currentDateChoice)
                        
                };

                $scope.ok = function () {
                    $scope.modalUi.date.setHours($scope.modalUi.time.getHours());
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
     * Usage:  uibHelper.selectListModal("My Title", "Body Text", [[ "choice 1" "beer"], ["choice 2", "wine"]], 1)
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
            templateUrl: '/uiapp/app/shared/uibHelperService/selectlistmodal.template.html',
            controller:  function ( $scope, $uibModalInstance, params ) {

                $scope.modalUi = { title: params.title, body: params.body, choices: params.choices, 
                    currentChoice: params.currentChoice, showChoice: !params.body };

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
            templateUrl: '/uiapp/app/shared/uibHelperService/stringeditmodal.template.html',
            controller:  function ( $scope, $uibModalInstance, params ) {

                $scope.modalUi = { title: params.title, 
                            body: params.body, 
                            editString: params.string2Edit,
                            placeholder: params.placeholder || params.title };

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
     * @param fieldsArray [ { label:"First Name", placeholder: "LaLa", type: text, field: 'firstName', value: 'John' }]
     * @param placeholder
     * @returns {*}
     */
    service.inputBoxesModal = function ( title, body, fieldsArray ) {

        var modalInstance = $uibModal.open( {
            templateUrl: '/uiapp/app/shared/uibHelperService/inputboxesmodal.template.html',
            controller:  function ( $scope, $uibModalInstance, params ) {

                $scope.modalUi = {
                    title:       params.title,
                    body:        params.body,
                    fieldsArray:  params.fieldsArray
                };


                $scope.ok = function () {
                    var rval = {};
                    $scope.modalUi.fieldsArray.forEach( function(f){
                        rval[f.field]=f.value;
                    })
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


    return service;

} );
