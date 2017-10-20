/*
 *	Token Anonymous
 */

nodefony.register.call(nodefony.security.tokens, "Anonymous", function () {

    const settingsAnonymous = {
        realm: "user@",
    };

    const Anonymous = class Anonymous {

        constructor(request, response, options) {
            this.name = "Anonymous";
            this.settings = nodefony.extend({}, settingsAnonymous, options);
            this.request = request;
            this.response = response;
            this.method = request.method;
        }

        generateResponse() {
            return this.settings.realm + this.name;
        }

        checkResponse(getUserPassword, callback) {
            callback(null, true);
        }

        generatePasswd( /*realm, username, passwd*/ ) {
            return this.settings.realm + this.name;
        }
    };

    return Anonymous;

});
