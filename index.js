var Twit = require('twit');
var _ = require('lodash');

var mapAuthOptionsEnv = {
    'twitter_consumer_key': 'consumer_key',
    'twitter_consumer_secret': 'consumer_secret',
    'twitter_access_token': 'access_token',
    'twitter_access_token_secret': 'access_token_secret'
};

var pickResult = {
    'screen_name': 'screen_name',
    'url': 'url',
    'status.entities.urls': 'urls',
    'status.entities.hashtags': 'hashtags'
};

module.exports = {
    /**
     * Run main twitter function.
     *
     * @param authOptions
     * @param params
     * @param callback
     */
    twitterMain: function (authOptions, params, callback) {
        var twitter = new Twit(authOptions);

        // Follow befriended
        twitter.get('users/search', params, callback);
    },

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
     * Get Auth options from Environment.
     *
     * @param dexter
     * @returns {{}}
     */
    authOptions: function (dexter) {
        // twitter auth property
        var authOptions = {};

        _.map(mapAuthOptionsEnv, function (authOpt, twitterOpt) {
            if(dexter.environment(twitterOpt)) {
                // get auth property
                authOptions[authOpt] = dexter.environment(twitterOpt);
            } else {
                // catch no-arguments message
                this.fail('A ' + twitterOpt + ' environment variable is required for this module');
            }
        }, this);

        return authOptions;
    },

    /**
     * Allows the authenticating users to follow the user specified in the ID parameter.
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {

        this.twitterMain(this.authOptions(dexter), step.inputs(), function (error, twitterResult) {
            if (error) {
                // if error - send message
                this.fail(error);
            }

            // return befriendedInfo
            this.complete(this.pickResult(twitterResult));
        }.bind(this));
    }
};
