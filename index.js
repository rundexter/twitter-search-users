var Twit = require('twit');
var _ = require('lodash');

var pickResult = {
    'screen_name': 'screen_name',
    'url': 'url',
    'status.entities.urls': 'urls',
    'status.entities.hashtags': 'hashtags'
};

module.exports = {
    /**
     * Return pick result.
     *
     * @param outputs
     * @returns {*}
     */
    pickResult: function (outputs) {
        var result = [];

        _.map(outputs, function (output) {
            var tmpResult = {};

            _.map(_.keys(pickResult), function (val) {

                if (_.has(output, val)) {

                    _.set(tmpResult, pickResult[val], _.get(output, val));
                }
            });

            result.push(tmpResult);
        });

        return result;
    },

    /**
     * Allows the authenticating users to follow the user specified in the ID parameter.
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var credentials = dexter.provider('twitter').credentials(),
            twitter = new Twit({
                access_token: credentials.access_token,
                access_token_secret: credentials.access_token_secret,
                consumer_key: credentials.consumer_key,
                consumer_secret: credentials.consumer_secret
            });

        twitter.get('users/search', step.inputs(), function (error, twitterResult) {
            if (error) {
                // if error - send message
                this.fail(error);
            } else {
                // return befriendedInfo
                this.complete(this.pickResult(twitterResult));
            }
        }.bind(this));
    }
};
