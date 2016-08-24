/**
 * Created by madelineer on 8/4/16.
 */

app.factory('clockService', function ($log) {
    var service = {};
    var _moment = moment();
    var _countUp = true;



    service.setDate = function (date) {

        _moment = moment(date);

    };

    service.countUp = function (countUp) {

        _countUp = countUp;

    };

    service.update = function (ms) {

        var changeBy = (ms || 1000) * (_countUp ? 1 : -1);
        _moment.add(changeBy, 'ms');
        $log.debug('Current moment is ' + _moment.format());

        var currentHours = _moment.format('HH');
        var currentMinutes = _moment.format('mm');
        var currentSeconds = _moment.format('ss');

        return [
            currentHours.charAt(0),
            currentHours.charAt(1),
            currentMinutes.charAt(0),
            currentMinutes.charAt(1),
            currentSeconds.charAt(0),
            currentSeconds.charAt(1)
        ];







    };

    return service;
})