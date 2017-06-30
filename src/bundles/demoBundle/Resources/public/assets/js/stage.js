/**
 * Twig.js 0.7.0
 *
 * @copyright 2011-2013 John Roepke
 * @license   Available under the BSD 2-Clause License
 * @link      https://github.com/justjohn/twig.js
 */

var Twig = (function (Twig) {

    Twig.VERSION = "0.7.0";

    return Twig;
})(Twig || {});
//     Twig.js
//     Copyright (c) 2011-2013 John Roepke
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

var Twig = (function (Twig) {
    "use strict";
    // ## twig.core.js
    //
    // This file handles template level tokenizing, compiling and parsing.

    Twig.trace = false;
    Twig.debug = false;

    // Default caching to true for the improved performance it offers
    Twig.cache = true;

    Twig.placeholders = {
        parent: "{{|PARENT|}}"
    };

    /**
     * Fallback for Array.indexOf for IE8 et al
     */
    Twig.indexOf = function (arr, searchElement /*, fromIndex */ ) {
        if (Array.prototype.hasOwnProperty("indexOf")) {
            return arr.indexOf(searchElement);
        }
        if (arr === void 0 || arr === null) {
            throw new TypeError();
        }
        var t = Object(arr);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 0) {
            n = Number(arguments[1]);
            if (n !== n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            // console.log("indexOf not found1 ", JSON.stringify(searchElement), JSON.stringify(arr));
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        if (arr == searchElement) {
            return 0;
        }
        // console.log("indexOf not found2 ", JSON.stringify(searchElement), JSON.stringify(arr));

        return -1;
    }

    Twig.forEach = function (arr, callback, thisArg) {
        if (Array.prototype.forEach ) {
            return arr.forEach(callback, thisArg);
        }

        var T, k;

        if ( arr == null ) {
          throw new TypeError( " this is null or not defined" );
        }

        // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
        var O = Object(arr);

        // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0; // Hack to convert O.length to a UInt32

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if ( {}.toString.call(callback) != "[object Function]" ) {
          throw new TypeError( callback + " is not a function" );
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if ( thisArg ) {
          T = thisArg;
        }

        // 6. Let k be 0
        k = 0;

        // 7. Repeat, while k < len
        while( k < len ) {

          var kValue;

          // a. Let Pk be ToString(k).
          //   This is implicit for LHS operands of the in operator
          // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
          //   This step can be combined with c
          // c. If kPresent is true, then
          if ( k in O ) {

            // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
            kValue = O[ k ];

            // ii. Call the Call internal method of callback with T as the this value and
            // argument list containing kValue, k, and O.
            callback.call( T, kValue, k, O );
          }
          // d. Increase k by 1.
          k++;
        }
        // 8. return undefined
    };

    /**
     * Exception thrown by twig.js.
     */
    Twig.Error = function(message) {
       this.message = message;
       this.name = "TwigException";
       this.type = "TwigException";
    };

    /**
     * Get the string representation of a Twig error.
     */
    Twig.Error.prototype.toString = function() {
        var output = this.name + ": " + this.message;

        return output;
    };

    /**
     * Wrapper for logging to the console.
     */
    Twig.log = {
        trace: function() {if (Twig.trace && console) {console.log(Array.prototype.slice.call(arguments));}},
        debug: function() {if (Twig.debug && console) {console.log(Array.prototype.slice.call(arguments));}}
    };

    if (typeof console !== "undefined" && 
        typeof console.log !== "undefined") {
        Twig.log.error = function() {
            console.log.apply(console, arguments);
        }
    } else {
        Twig.log.error = function(){};
    }

    /**
     * Container for methods related to handling high level template tokens
     *      (for example: {{ expression }}, {% logic %}, {# comment #}, raw data)
     */
    Twig.token = {};

    /**
     * Token types.
     */
    Twig.token.type = {
        output:  'output',
        logic:   'logic',
        comment: 'comment',
        raw:     'raw'
    };

    /**
     * Token syntax definitions.
     */
    Twig.token.definitions = [
        {
            type: Twig.token.type.raw,
            open: '{% raw %}',
            close: '{% endraw %}'
        },
        // *Output type tokens*
        //
        // These typically take the form `{{ expression }}`.
        {
            type: Twig.token.type.output,
            open: '{{',
            close: '}}'
        },
        // *Logic type tokens*
        //
        // These typically take a form like `{% if expression %}` or `{% endif %}`
        {
            type: Twig.token.type.logic,
            open: '{%',
            close: '%}'
        },
        // *Comment type tokens*
        //
        // These take the form `{# anything #}`
        {
            type: Twig.token.type.comment,
            open: '{#',
            close: '#}'
        }
    ];


    /**
     * What characters start "strings" in token definitions. We need this to ignore token close
     * strings inside an expression.
     */
    Twig.token.strings = ['"', "'"];

    Twig.token.findStart = function (template) {
        var output = {
                position: null,
                def: null
            },
            i,
            token_template,
            first_key_position;

        for (i=0;i<Twig.token.definitions.length;i++) {
            token_template = Twig.token.definitions[i];
            first_key_position = template.indexOf(token_template.open);

            Twig.log.trace("Twig.token.findStart: ", "Searching for ", token_template.open, " found at ", first_key_position);

            // Does this token occur before any other types?
            if (first_key_position >= 0 && (output.position === null || first_key_position < output.position)) {
                output.position = first_key_position;
                output.def = token_template;
            }
        }

        return output;
    };

    Twig.token.findEnd = function (template, token_def, start) {
        var end = null,
            found = false,
            offset = 0,

            // String position variables
            str_pos = null,
            str_found = null,
            pos = null,
            end_offset = null,
            this_str_pos = null,
            end_str_pos = null,

            // For loop variables
            i,
            l;

        while (!found) {
            str_pos = null;
            str_found = null;
            pos = template.indexOf(token_def.close, offset);

            if (pos >= 0) {
                end = pos;
                found = true;
            } else {
                // throw an exception
                throw new Twig.Error("Unable to find closing bracket '" + token_def.close +
                                "'" + " opened near template position " + start);
            }

            // Ignore quotes within comments; just look for the next comment close sequence,
            // regardless of what comes before it. https://github.com/justjohn/twig.js/issues/95
            if (token_def.type === Twig.token.type.comment) {
              break;
            }

            l = Twig.token.strings.length;
            for (i = 0; i < l; i += 1) {
                this_str_pos = template.indexOf(Twig.token.strings[i], offset);

                if (this_str_pos > 0 && this_str_pos < pos &&
                        (str_pos === null || this_str_pos < str_pos)) {
                    str_pos = this_str_pos;
                    str_found = Twig.token.strings[i];
                }
            }

            // We found a string before the end of the token, now find the string's end and set the search offset to it
            if (str_pos !== null) {
                end_offset = str_pos + 1;
                end = null;
                found = false;
                while (true) {
                    end_str_pos = template.indexOf(str_found, end_offset);
                    if (end_str_pos < 0) {
                        throw "Unclosed string in template";
                    }
                    // Ignore escaped quotes
                    if (template.substr(end_str_pos - 1, 1) !== "\\") {
                        offset = end_str_pos + 1;
                        break;
                    } else {
                        end_offset = end_str_pos + 1;
                    }
                }
            }
        }
        return end;
    };

    /**
     * Convert a template into high-level tokens.
     */
    Twig.tokenize = function (template) {
        var tokens = [],
            // An offset for reporting errors locations in the template.
            error_offset = 0,

            // The start and type of the first token found in the template.
            found_token = null,
            // The end position of the matched token.
            end = null;

        while (template.length > 0) {
            // Find the first occurance of any token type in the template
            found_token = Twig.token.findStart(template);

            Twig.log.trace("Twig.tokenize: ", "Found token: ", found_token);

            if (found_token.position !== null) {
                // Add a raw type token for anything before the start of the token
                if (found_token.position > 0) {
                    tokens.push({
                        type: Twig.token.type.raw,
                        value: template.substring(0, found_token.position)
                    });
                }
                template = template.substr(found_token.position + found_token.def.open.length);
                error_offset += found_token.position + found_token.def.open.length;

                // Find the end of the token
                end = Twig.token.findEnd(template, found_token.def, error_offset);

                Twig.log.trace("Twig.tokenize: ", "Token ends at ", end);

                tokens.push({
                    type:  found_token.def.type,
                    value: template.substring(0, end).trim()
                });

                if ( found_token.def.type === "logic" && template.substr( end + found_token.def.close.length, 1 ) === "\n" ) {
                    // Newlines directly after logic tokens are ignored
                    end += 1;
                }

                template = template.substr(end + found_token.def.close.length);

                // Increment the position in the template
                error_offset += end + found_token.def.close.length;

            } else {
                // No more tokens -> add the rest of the template as a raw-type token
                tokens.push({
                    type: Twig.token.type.raw,
                    value: template
                });
                template = '';
            }
        }

        return tokens;
    };


    Twig.compile = function (tokens) {
        try {

            // Output and intermediate stacks
            var output = [],
                stack = [],
                // The tokens between open and close tags
                intermediate_output = [],

                token = null,
                logic_token = null,
                unclosed_token = null,
                // Temporary previous token.
                prev_token = null,
                // The previous token's template
                prev_template = null,
                // The output token
                tok_output = null,

                // Logic Token values
                type = null,
                open = null,
                next = null;

            while (tokens.length > 0) {
                token = tokens.shift();
                Twig.log.trace("Compiling token ", token);
                switch (token.type) {
                    case Twig.token.type.raw:
                        if (stack.length > 0) {
                            intermediate_output.push(token);
                        } else {
                            output.push(token);
                        }
                        break;

                    case Twig.token.type.logic:
                        // Compile the logic token
                        logic_token = Twig.logic.compile.apply(this, [token]);

                        type = logic_token.type;
                        open = Twig.logic.handler[type].open;
                        next = Twig.logic.handler[type].next;

                        Twig.log.trace("Twig.compile: ", "Compiled logic token to ", logic_token,
                                                         " next is: ", next, " open is : ", open);

                        // Not a standalone token, check logic stack to see if this is expected
                        if (open !== undefined && !open) {
                            prev_token = stack.pop();
                            prev_template = Twig.logic.handler[prev_token.type];

                            if (Twig.indexOf(prev_template.next, type) < 0) {
                                throw new Error(type + " not expected after a " + prev_token.type);
                            }

                            prev_token.output = prev_token.output || [];

                            prev_token.output = prev_token.output.concat(intermediate_output);
                            intermediate_output = [];

                            tok_output = {
                                type: Twig.token.type.logic,
                                token: prev_token
                            };
                            if (stack.length > 0) {
                                intermediate_output.push(tok_output);
                            } else {
                                output.push(tok_output);
                            }
                        }

                        // This token requires additional tokens to complete the logic structure.
                        if (next !== undefined && next.length > 0) {
                            Twig.log.trace("Twig.compile: ", "Pushing ", logic_token, " to logic stack.");

                            if (stack.length > 0) {
                                // Put any currently held output into the output list of the logic operator
                                // currently at the head of the stack before we push a new one on.
                                prev_token = stack.pop();
                                prev_token.output = prev_token.output || [];
                                prev_token.output = prev_token.output.concat(intermediate_output);
                                stack.push(prev_token);
                                intermediate_output = [];
                            }

                            // Push the new logic token onto the logic stack
                            stack.push(logic_token);

                        } else if (open !== undefined && open) {
                            tok_output = {
                                type: Twig.token.type.logic,
                                token: logic_token
                            };
                            // Standalone token (like {% set ... %}
                            if (stack.length > 0) {
                                intermediate_output.push(tok_output);
                            } else {
                                output.push(tok_output);
                            }
                        }
                        break;

                    // Do nothing, comments should be ignored
                    case Twig.token.type.comment:
                        break;

                    case Twig.token.type.output:
                        Twig.expression.compile.apply(this, [token]);
                        if (stack.length > 0) {
                            intermediate_output.push(token);
                        } else {
                            output.push(token);
                        }
                        break;
                }

                Twig.log.trace("Twig.compile: ", " Output: ", output,
                                                 " Logic Stack: ", stack,
                                                 " Pending Output: ", intermediate_output );
            }

            // Verify that there are no logic tokens left in the stack.
            if (stack.length > 0) {
                unclosed_token = stack.pop();
                throw new Error("Unable to find an end tag for " + unclosed_token.type +
                                ", expecting one of " + unclosed_token.next);
            }
            return output;
        } catch (ex) {
            Twig.log.error("Error compiling twig template " + this.id + ": ");
            if (ex.stack) {
                Twig.log.error(ex.stack);
            } else {
                Twig.log.error(ex.toString());
            }

            if (this.options.rethrow) throw ex;
        }
    };

    /**
     * Parse a compiled template.
     *
     * @param {Array} tokens The compiled tokens.
     * @param {Object} context The render context.
     *
     * @return {string} The parsed template.
     */
    Twig.parse = function (tokens, context) {
        try {
            var output = [],
                // Track logic chains
                chain = true,
                that = this;

            // Default to an empty object if none provided
            context = context || { };


            Twig.forEach(tokens, function parseToken(token) {
                Twig.log.debug("Twig.parse: ", "Parsing token: ", token);

                switch (token.type) {
                    case Twig.token.type.raw:
                        output.push(token.value);
                        break;

                    case Twig.token.type.logic:
                        var logic_token = token.token,
                            logic = Twig.logic.parse.apply(that, [logic_token, context, chain]);

                        if (logic.chain !== undefined) {
                            chain = logic.chain;
                        }
                        if (logic.context !== undefined) {
                            context = logic.context;
                        }
                        if (logic.output !== undefined) {
                            output.push(logic.output);
                        }
                        break;

                    case Twig.token.type.comment:
                        // Do nothing, comments should be ignored
                        break;

                    case Twig.token.type.output:
                        Twig.log.debug("Twig.parse: ", "Output token: ", token.stack);
                        // Parse the given expression in the given context
                        output.push(Twig.expression.parse.apply(that, [token.stack, context]));
                        break;
                }
            });
            return output.join("");
        } catch (ex) {
            Twig.log.error("Error parsing twig template " + this.id + ": ");
            if (ex.stack) {
                Twig.log.error(ex.stack);
            } else {
                Twig.log.error(ex.toString());
            }

            if (this.options.rethrow) throw ex;

            if (Twig.debug) {
                return ex.toString();
            }
        }
    };

    /**
     * Tokenize and compile a string template.
     *
     * @param {string} data The template.
     *
     * @return {Array} The compiled tokens.
     */
    Twig.prepare = function(data) {
        var tokens, raw_tokens;

        // Tokenize
        Twig.log.debug("Twig.prepare: ", "Tokenizing ", data);
        raw_tokens = Twig.tokenize.apply(this, [data]);

        // Compile
        Twig.log.debug("Twig.prepare: ", "Compiling ", raw_tokens);
        tokens = Twig.compile.apply(this, [raw_tokens]);

        Twig.log.debug("Twig.prepare: ", "Compiled ", tokens);

        return tokens;
    };

    // Namespace for template storage and retrieval
    Twig.Templates = {
        registry: {}
    };

    /**
     * Is this id valid for a twig template?
     *
     * @param {string} id The ID to check.
     *
     * @throws {Twig.Error} If the ID is invalid or used.
     * @return {boolean} True if the ID is valid.
     */
    Twig.validateId = function(id) {
        if (id === "prototype") {
            throw new Twig.Error(id + " is not a valid twig identifier");
        } else if (Twig.Templates.registry.hasOwnProperty(id)) {
            throw new Twig.Error("There is already a template with the ID " + id);
        }
        return true;
    }

    /**
     * Save a template object to the store.
     *
     * @param {Twig.Template} template   The twig.js template to store.
     */
    Twig.Templates.save = function(template) {
        if (template.id === undefined) {
            throw new Twig.Error("Unable to save template with no id");
        }
        Twig.Templates.registry[template.id] = template;
    };

    /**
     * Load a previously saved template from the store.
     *
     * @param {string} id   The ID of the template to load.
     *
     * @return {Twig.Template} A twig.js template stored with the provided ID.
     */
    Twig.Templates.load = function(id) {
        if (!Twig.Templates.registry.hasOwnProperty(id)) {
            return null;
        }
        return Twig.Templates.registry[id];
    };

    /**
     * Load a template from a remote location using AJAX and saves in with the given ID.
     *
     * Available parameters:
     *
     *      async:       Should the HTTP request be performed asynchronously.
     *                      Defaults to true.
     *      method:      What method should be used to load the template
     *                      (fs or ajax)
     *      precompiled: Has the template already been compiled.
     *
     * @param {string} location  The remote URL to load as a template.
     * @param {Object} params The template parameters.
     * @param {function} callback  A callback triggered when the template finishes loading.
     * @param {function} error_callback  A callback triggered if an error occurs loading the template.
     *
     *
     */
    Twig.Templates.loadRemote = function(location, params, callback, error_callback) {
        var id          = params.id,
            method      = params.method,
            async       = params.async,
            precompiled = params.precompiled,
            template    = null;

        // Default to async
        if (async === undefined) async = true;

        // Default to the URL so the template is cached.
        if (id === undefined) {
            id = location;
        }
        params.id = id;

        // Check for existing template
        if (Twig.cache && Twig.Templates.registry.hasOwnProperty(id)) {
            // A template is already saved with the given id.
            if (callback) {
                callback(Twig.Templates.registry[id]);
            }
            return Twig.Templates.registry[id];
        }

        if (method == 'ajax') {
            if (typeof XMLHttpRequest == "undefined") {
                throw new Twig.Error("Unsupported platform: Unable to do remote requests " +
                                     "because there is no XMLHTTPRequest implementation");
            }

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
                var data = null;

                if(xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        Twig.log.debug("Got template ", xmlhttp.responseText);

                        if (precompiled === true) {
                            data = JSON.parse(xmlhttp.responseText);
                        } else {
                            data = xmlhttp.responseText;
                        }

                        params.url = location;
                        params.data = data;

                        template = new Twig.Template(params);

                        if (callback) {
                            callback(template);
                        }
                    } else {
                        if (error_callback) {
                            error_callback(xmlhttp);
                        }
                    }
                }
            };
            xmlhttp.open("GET", location, async);
            xmlhttp.send();

        } else { // if method = 'fs'
            // Create local scope
            (function() {
                var fs = require('fs'),
                    path = require('path'),
                    data = null,
                    loadTemplateFn = function(err, data) {
                        if (err) {
                            if (error_callback) {
                                error_callback(err);
                            }
                            return;
                        }

                        if (precompiled === true) {
                            data = JSON.parse(data);
                        }

                        params.data = data;
                        params.path = location;

                        // template is in data
                        template = new Twig.Template(params);

                        if (callback) {
                            callback(template);
                        }
                    };

                if (async === true) {
                    fs.stat(location, function (err, stats) {
                        if (err || !stats.isFile())
                            throw new Twig.Error("Unable to find template file " + location);

                        fs.readFile(location, 'utf8', loadTemplateFn);
                    });
                } else {
                    if (!fs.statSync(location).isFile())
                        throw new Twig.Error("Unable to find template file " + location);

                    data = fs.readFileSync(location, 'utf8');
                    loadTemplateFn(undefined, data);
                }
            })();
        }
        if (async === false) {
            return template;
        } else {
            // placeholder for now, should eventually return a deferred object.
            return true;
        }
    };

    // Determine object type
    function is(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }

    /**
     * Create a new twig.js template.
     *
     * Parameters: {
     *      data:   The template, either pre-compiled tokens or a string template
     *      id:     The name of this template
     *      blocks: Any pre-existing block from a child template
     * }
     *
     * @param {Object} params The template parameters.
     */
    Twig.Template = function ( params ) {
        var data = params.data,
            id = params.id,
            blocks = params.blocks,
            macros = params.macros || {},
            base = params.base,
            path = params.path,
            url = params.url,
            // parser options
            options = params.options;

        // # What is stored in a Twig.Template
        //
        // The Twig Template hold several chucks of data.
        //
        //     {
        //          id:     The token ID (if any)
        //          tokens: The list of tokens that makes up this template.
        //          blocks: The list of block this template contains.
        //          base:   The base template (if any)
        //            options:  {
        //                Compiler/parser options
        //
        //                strict_variables: true/false
        //                    Should missing variable/keys emit an error message. If false, they default to null.
        //            }
        //     }
        //

        this.id     = id;
        this.base   = base;
        this.path   = path;
        this.url    = url;
        this.macros = macros;
        this.options = options;

        this.reset(blocks);

        if (is('String', data)) {
            this.tokens = Twig.prepare.apply(this, [data]);
        } else {
            this.tokens = data;
        }

        if (id !== undefined) {
            Twig.Templates.save(this);
        }
    };

    Twig.Template.prototype.reset = function(blocks) {
        Twig.log.debug("Twig.Template.reset", "Reseting template " + this.id);
        this.blocks = {};
        this.child = {
            blocks: blocks || {}
        };
        this.extend = null;
    };

    Twig.Template.prototype.render = function (context, params) {
        params = params || {};

        var output,
            url;

        this.context = context || {};

        // Clear any previous state
        this.reset();
        if (params.blocks) {
            this.blocks = params.blocks;
        }
        if (params.macros) {
            this.macros = params.macros;
        }

        output = Twig.parse.apply(this, [this.tokens, this.context]);

        // Does this template extend another
        if (this.extend) {
            var ext_template;

            // check if the template is provided inline
            if ( this.options.allowInlineIncludes ) {
                ext_template = Twig.Templates.load(this.extend);
                if ( ext_template ) {
                    ext_template.options = this.options;
                }
            }

            // check for the template file via include
            if (!ext_template) {
                url = relativePath(this, this.extend);

                ext_template = Twig.Templates.loadRemote(url, {
                    method: this.url?'ajax':'fs',
                    base: this.base,
                    async:  false,
                    id:     url,
                    options: this.options
                });
            }

            this.parent = ext_template;

            return this.parent.render(this.context, {
                blocks: this.blocks
            });
        }

        if (params.output == 'blocks') {
            return this.blocks;
        } else if (params.output == 'macros') {
            return this.macros;
        } else {
            return output;
        }
    };

    Twig.Template.prototype.importFile = function(file) {
        var url, sub_template;
        if ( !this.url && !this.path && this.options.allowInlineIncludes ) {
            sub_template = Twig.Templates.load(file);
            sub_template.options = this.options;
            if ( sub_template ) {
                return sub_template;
            }

            throw new Twig.Error("Didn't find the inline template by id");
        }

        url = relativePath(this, file);

        // Load blocks from an external file
        sub_template = Twig.Templates.loadRemote(url, {
            method: this.url?'ajax':'fs',
            base: this.base,
            async: false,
            options: this.options,
            id: url
        });

        return sub_template;
    };

    Twig.Template.prototype.importBlocks = function(file, override) {
        var sub_template = this.importFile(file),
            context = this.context,
            that = this,
            key;

        override = override || false;

        sub_template.render(context);

        // Mixin blocks
        Twig.forEach(Object.keys(sub_template.blocks), function(key) {
            if (override || that.blocks[key] === undefined) {
                that.blocks[key] = sub_template.blocks[key];
            }
        });
    };

    Twig.Template.prototype.importMacros = function(file) {
        var url = relativePath(this, file);

        // load remote template
        var remoteTemplate = Twig.Templates.loadRemote(url, {
            method: this.url?'ajax':'fs',
            async: false,
            id: url
        });

        return remoteTemplate;
    };

    Twig.Template.prototype.compile = function(options) {
        // compile the template into raw JS
        return Twig.compiler.compile(this, options);
    };

    /**
     * Generate the relative canonical version of a url based on the given base path and file path.
     *
     * @param {string} template The Twig.Template.
     * @param {string} file The file path, relative to the base path.
     *
     * @return {string} The canonical version of the path.
     */
    function relativePath(template, file) {
        var base,
            base_path,
            sep_chr = "/",
            new_path = [],
            val;

        if (template.url) {
            if (typeof template.base !== 'undefined') {
                base = template.base + ((template.base.charAt(template.base.length-1) === '/') ? '' : '/');
            } else {
                base = template.url;
            }
        } else if (template.path) {
            // Get the system-specific path separator
            var path = require("path"),
                sep = path.sep || sep_chr,
                relative = new RegExp("^\\.{1,2}" + sep.replace("\\", "\\\\"));

            if (template.base !== undefined && file.match(relative) == null) {
                file = file.replace(template.base, '');
                base = template.base + sep;
            } else {
                base = template.path;
            }

            base = base.replace(sep+sep, sep);
            sep_chr = sep;
        } else {
            throw new Twig.Error("Cannot extend an inline template.");
        }

        base_path = base.split(sep_chr);

        // Remove file from url
        base_path.pop();
        base_path = base_path.concat(file.split(sep_chr));

        while (base_path.length > 0) {
            val = base_path.shift();
            if (val == ".") {
                // Ignore
            } else if (val == ".." && new_path.length > 0 && new_path[new_path.length-1] != "..") {
                new_path.pop();
            } else {
                new_path.push(val);
            }
        }

        return new_path.join(sep_chr);
    }

    return Twig;

}) (Twig || { });

// The following methods are from MDN and are available under a
// [MIT License](http://www.opensource.org/licenses/mit-license.php) or are
// [Public Domain](https://developer.mozilla.org/Project:Copyrights).
//
// See:
// * [Object.keys - MDN](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys)

// ## twig.fills.js
//
// This file contains fills for backwards compatability.
(function() {
    "use strict";
    // Handle methods that don't yet exist in every browser

    if (!String.prototype.trim) {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g,'');
        }
    };

    if(!Object.keys) Object.keys = function(o){
        if (o !== Object(o)) {
            throw new TypeError('Object.keys called on non-object');
        }
        var ret = [], p;
        for (p in o) if (Object.prototype.hasOwnProperty.call(o, p)) ret.push(p);
        return ret;
    }

})();
// ## twig.lib.js
//
// This file contains 3rd party libraries used within twig.
//
// Copies of the licenses for the code included here can be found in the
// LICENSES.md file.
//

var Twig = (function(Twig) {

    // Namespace for libraries
    Twig.lib = { };

    /**
    sprintf() for JavaScript 0.7-beta1
    http://www.diveintojavascript.com/projects/javascript-sprintf
    **/
    var sprintf = (function() {
            function get_type(variable) {
                    return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
            }
            function str_repeat(input, multiplier) {
                    for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
                    return output.join('');
            }

            var str_format = function() {
                    if (!str_format.cache.hasOwnProperty(arguments[0])) {
                            str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
                    }
                    return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
            };

            str_format.format = function(parse_tree, argv) {
                    var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
                    for (i = 0; i < tree_length; i++) {
                            node_type = get_type(parse_tree[i]);
                            if (node_type === 'string') {
                                    output.push(parse_tree[i]);
                            }
                            else if (node_type === 'array') {
                                    match = parse_tree[i]; // convenience purposes only
                                    if (match[2]) { // keyword argument
                                            arg = argv[cursor];
                                            for (k = 0; k < match[2].length; k++) {
                                                    if (!arg.hasOwnProperty(match[2][k])) {
                                                            throw(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
                                                    }
                                                    arg = arg[match[2][k]];
                                            }
                                    }
                                    else if (match[1]) { // positional argument (explicit)
                                            arg = argv[match[1]];
                                    }
                                    else { // positional argument (implicit)
                                            arg = argv[cursor++];
                                    }

                                    if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
                                            throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));
                                    }
                                    switch (match[8]) {
                                            case 'b': arg = arg.toString(2); break;
                                            case 'c': arg = String.fromCharCode(arg); break;
                                            case 'd': arg = parseInt(arg, 10); break;
                                            case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
                                            case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
                                            case 'o': arg = arg.toString(8); break;
                                            case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
                                            case 'u': arg = Math.abs(arg); break;
                                            case 'x': arg = arg.toString(16); break;
                                            case 'X': arg = arg.toString(16).toUpperCase(); break;
                                    }
                                    arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
                                    pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
                                    pad_length = match[6] - String(arg).length;
                                    pad = match[6] ? str_repeat(pad_character, pad_length) : '';
                                    output.push(match[5] ? arg + pad : pad + arg);
                            }
                    }
                    return output.join('');
            };

            str_format.cache = {};

            str_format.parse = function(fmt) {
                    var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
                    while (_fmt) {
                            if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
                                    parse_tree.push(match[0]);
                            }
                            else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
                                    parse_tree.push('%');
                            }
                            else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
                                    if (match[2]) {
                                            arg_names |= 1;
                                            var field_list = [], replacement_field = match[2], field_match = [];
                                            if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                                                    field_list.push(field_match[1]);
                                                    while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                                                            if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                                                                    field_list.push(field_match[1]);
                                                            }
                                                            else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
                                                                    field_list.push(field_match[1]);
                                                            }
                                                            else {
                                                                    throw('[sprintf] huh?');
                                                            }
                                                    }
                                            }
                                            else {
                                                    throw('[sprintf] huh?');
                                            }
                                            match[2] = field_list;
                                    }
                                    else {
                                            arg_names |= 2;
                                    }
                                    if (arg_names === 3) {
                                            throw('[sprintf] mixing positional and named placeholders is not (yet) supported');
                                    }
                                    parse_tree.push(match);
                            }
                            else {
                                    throw('[sprintf] huh?');
                            }
                            _fmt = _fmt.substring(match[0].length);
                    }
                    return parse_tree;
            };

            return str_format;
    })();

    var vsprintf = function(fmt, argv) {
        argv.unshift(fmt);
        return sprintf.apply(null, argv);
    };

    // Expose to Twig
    Twig.lib.sprintf = sprintf;
    Twig.lib.vsprintf = vsprintf;


    /**
     * jPaq - A fully customizable JavaScript/JScript library
     * http://jpaq.org/
     *
     * Copyright (c) 2011 Christopher West
     * Licensed under the MIT license.
     * http://jpaq.org/license/
     *
     * Version: 1.0.6.0000W
     * Revised: April 6, 2011
     */
    ; (function() {
        var shortDays = "Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(",");
        var fullDays = "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(",");
        var shortMonths = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(",");
        var fullMonths = "January,February,March,April,May,June,July,August,September,October,November,December".split(",");
        function getOrdinalFor(intNum) {
                return (((intNum = Math.abs(intNum) % 100) % 10 == 1 && intNum != 11) ? "st"
                        : (intNum % 10 == 2 && intNum != 12) ? "nd" : (intNum % 10 == 3
                        && intNum != 13) ? "rd" : "th");
        }
        function getISO8601Year(aDate) {
                var d = new Date(aDate.getFullYear() + 1, 0, 4);
                if((d - aDate) / 86400000 < 7 && (aDate.getDay() + 6) % 7 < (d.getDay() + 6) % 7)
                        return d.getFullYear();
                if(aDate.getMonth() > 0 || aDate.getDate() >= 4)
                        return aDate.getFullYear();
                return aDate.getFullYear() - (((aDate.getDay() + 6) % 7 - aDate.getDate() > 2) ? 1 : 0);
        }
        function getISO8601Week(aDate) {
                // Get a day during the first week of the year.
                var d = new Date(getISO8601Year(aDate), 0, 4);
                // Get the first monday of the year.
                d.setDate(d.getDate() - (d.getDay() + 6) % 7);
                return parseInt((aDate - d) / 604800000) + 1;
        }
        Twig.lib.formatDate = function(date, format) {
            /// <summary>
            ///   Gets a string for this date, formatted according to the given format
            ///   string.
            /// </summary>
            /// <param name="format" type="String">
            ///   The format of the output date string.  The format string works in a
            ///   nearly identical way to the PHP date function which is highlighted here:
            ///   http://php.net/manual/en/function.date.php.
            ///   The only difference is the fact that "u" signifies milliseconds
            ///   instead of microseconds.  The following characters are recognized in
            ///   the format parameter string:
            ///     d - Day of the month, 2 digits with leading zeros
            ///     D - A textual representation of a day, three letters
            ///     j - Day of the month without leading zeros
            ///     l (lowercase 'L') - A full textual representation of the day of the week
            ///     N - ISO-8601 numeric representation of the day of the week (starting from 1)
            ///     S - English ordinal suffix for the day of the month, 2 characters st,
            ///         nd, rd or th. Works well with j.
            ///     w - Numeric representation of the day of the week (starting from 0)
            ///     z - The day of the year (starting from 0)
            ///     W - ISO-8601 week number of year, weeks starting on Monday
            ///     F - A full textual representation of a month, such as January or March
            ///     m - Numeric representation of a month, with leading zeros
            ///     M - A short textual representation of a month, three letters
            ///     n - Numeric representation of a month, without leading zeros
            ///     t - Number of days in the given month
            ///     L - Whether it's a leap year
            ///     o - ISO-8601 year number. This has the same value as Y, except that if
            ///         the ISO week number (W) belongs to the previous or next year, that
            ///         year is used instead.
            ///     Y - A full numeric representation of a year, 4 digits
            ///     y - A two digit representation of a year
            ///     a - Lowercase Ante meridiem and Post meridiem
            ///     A - Uppercase Ante meridiem and Post meridiem
            ///     B - Swatch Internet time
            ///     g - 12-hour format of an hour without leading zeros
            ///     G - 24-hour format of an hour without leading zeros
            ///     h - 12-hour format of an hour with leading zeros
            ///     H - 24-hour format of an hour with leading zeros
            ///     i - Minutes with leading zeros
            ///     s - Seconds, with leading zeros
            ///     u - Milliseconds
            ///     U - Seconds since the Unix Epoch (January 1 1970 00:00:00 GMT)
            /// </param>
            /// <returns type="String">
            ///   Returns the string for this date, formatted according to the given
            ///   format string.
            /// </returns>
            // If the format was not passed, use the default toString method.
            if(typeof format !== "string" || /^\s*$/.test(format))
                    return date + "";
            var jan1st = new Date(date.getFullYear(), 0, 1);
            var me = date;
            return format.replace(/[dDjlNSwzWFmMntLoYyaABgGhHisuU]/g, function(option) {
                switch(option) {
                    // Day of the month, 2 digits with leading zeros
                    case "d": return ("0" + me.getDate()).replace(/^.+(..)$/, "$1");
                    // A textual representation of a day, three letters
                    case "D": return shortDays[me.getDay()];
                    // Day of the month without leading zeros
                    case "j": return me.getDate();
                    // A full textual representation of the day of the week
                    case "l": return fullDays[me.getDay()];
                    // ISO-8601 numeric representation of the day of the week
                    case "N": return (me.getDay() + 6) % 7 + 1;
                    // English ordinal suffix for the day of the month, 2 characters
                    case "S": return getOrdinalFor(me.getDate());
                    // Numeric representation of the day of the week
                    case "w": return me.getDay();
                    // The day of the year (starting from 0)
                    case "z": return Math.ceil((jan1st - me) / 86400000);
                    // ISO-8601 week number of year, weeks starting on Monday
                    case "W": return ("0" + getISO8601Week(me)).replace(/^.(..)$/, "$1");
                    // A full textual representation of a month, such as January or March
                    case "F": return fullMonths[me.getMonth()];
                    // Numeric representation of a month, with leading zeros
                    case "m": return ("0" + (me.getMonth() + 1)).replace(/^.+(..)$/, "$1");
                    // A short textual representation of a month, three letters
                    case "M": return shortMonths[me.getMonth()];
                    // Numeric representation of a month, without leading zeros
                    case "n": return me.getMonth() + 1;
                    // Number of days in the given month
                    case "t": return new Date(me.getFullYear(), me.getMonth() + 1, -1).getDate();
                    // Whether it's a leap year
                    case "L": return new Date(me.getFullYear(), 1, 29).getDate() == 29 ? 1 : 0;
                    // ISO-8601 year number. This has the same value as Y, except that if the
                    // ISO week number (W) belongs to the previous or next year, that year is
                    // used instead.
                    case "o": return getISO8601Year(me);
                    // A full numeric representation of a year, 4 digits
                    case "Y": return me.getFullYear();
                    // A two digit representation of a year
                    case "y": return (me.getFullYear() + "").replace(/^.+(..)$/, "$1");
                    // Lowercase Ante meridiem and Post meridiem
                    case "a": return me.getHours() < 12 ? "am" : "pm";
                    // Uppercase Ante meridiem and Post meridiem
                    case "A": return me.getHours() < 12 ? "AM" : "PM";
                    // Swatch Internet time
                    case "B": return Math.floor((((me.getUTCHours() + 1) % 24) + me.getUTCMinutes() / 60 + me.getUTCSeconds() / 3600) * 1000 / 24);
                    // 12-hour format of an hour without leading zeros
                    case "g": return me.getHours() % 12 != 0 ? me.getHours() % 12 : 12;
                    // 24-hour format of an hour without leading zeros
                    case "G": return me.getHours();
                    // 12-hour format of an hour with leading zeros
                    case "h": return ("0" + (me.getHours() % 12 != 0 ? me.getHours() % 12 : 12)).replace(/^.+(..)$/, "$1");
                    // 24-hour format of an hour with leading zeros
                    case "H": return ("0" + me.getHours()).replace(/^.+(..)$/, "$1");
                    // Minutes with leading zeros
                    case "i": return ("0" + me.getMinutes()).replace(/^.+(..)$/, "$1");
                    // Seconds, with leading zeros
                    case "s": return ("0" + me.getSeconds()).replace(/^.+(..)$/, "$1");
                    // Milliseconds
                    case "u": return me.getMilliseconds();
                    // Seconds since the Unix Epoch (January 1 1970 00:00:00 GMT)
                    case "U": return me.getTime() / 1000;
                }
            });
        };
    })();

    Twig.lib.strip_tags = function(input, allowed) {
        // Strips HTML and PHP tags from a string
        //
        // version: 1109.2015
        // discuss at: http://phpjs.org/functions/strip_tags
        // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   improved by: Luke Godfrey
        // +      input by: Pul
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   bugfixed by: Onno Marsman
        // +      input by: Alex
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: Marc Palau
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   bugfixed by: Eric Nagel
        // +      input by: Bobby Drake
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   bugfixed by: Tomasz Wesolowski
        // +      input by: Evertjan Garretsen
        // +    revised by: Rafał Kukawski (http://blog.kukawski.pl/)
        // *     example 1: strip_tags('<p>Kevin</p> <b>van</b> <i>Zonneveld</i>', '<i><b>');
        // *     returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
        // *     example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>');
        // *     returns 2: '<p>Kevin van Zonneveld</p>'
        // *     example 3: strip_tags("<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>", "<a>");
        // *     returns 3: '<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>'
        // *     example 4: strip_tags('1 < 5 5 > 1');
        // *     returns 4: '1 < 5 5 > 1'
        // *     example 5: strip_tags('1 <br/> 1');
        // *     returns 5: '1  1'
        // *     example 6: strip_tags('1 <br/> 1', '<br>');
        // *     returns 6: '1  1'
        // *     example 7: strip_tags('1 <br/> 1', '<br><br/>');
        // *     returns 7: '1 <br/> 1'
        allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
            commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
        return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
            return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
        });
    }

    Twig.lib.parseISO8601Date = function (s){
        // Taken from http://n8v.enteuxis.org/2010/12/parsing-iso-8601-dates-in-javascript/
        // parenthese matches:
        // year month day    hours minutes seconds  
        // dotmilliseconds 
        // tzstring plusminus hours minutes
        var re = /(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(\.\d+)?(Z|([+-])(\d\d):(\d\d))/;

        var d = [];
        d = s.match(re);

        // "2010-12-07T11:00:00.000-09:00" parses to:
        //  ["2010-12-07T11:00:00.000-09:00", "2010", "12", "07", "11",
        //     "00", "00", ".000", "-09:00", "-", "09", "00"]
        // "2010-12-07T11:00:00.000Z" parses to:
        //  ["2010-12-07T11:00:00.000Z",      "2010", "12", "07", "11", 
        //     "00", "00", ".000", "Z", undefined, undefined, undefined]

        if (! d) {
            throw "Couldn't parse ISO 8601 date string '" + s + "'";
        }

        // parse strings, leading zeros into proper ints
        var a = [1,2,3,4,5,6,10,11];
        for (var i in a) {
            d[a[i]] = parseInt(d[a[i]], 10);
        }
        d[7] = parseFloat(d[7]);

        // Date.UTC(year, month[, date[, hrs[, min[, sec[, ms]]]]])
        // note that month is 0-11, not 1-12
        // see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/UTC
        var ms = Date.UTC(d[1], d[2] - 1, d[3], d[4], d[5], d[6]);

        // if there are milliseconds, add them
        if (d[7] > 0) {  
            ms += Math.round(d[7] * 1000);
        }

        // if there's a timezone, calculate it
        if (d[8] != "Z" && d[10]) {
            var offset = d[10] * 60 * 60 * 1000;
            if (d[11]) {
                offset += d[11] * 60 * 1000;
            }
            if (d[9] == "-") {
                ms -= offset;
            }
            else {
                ms += offset;
            }
        }

        return new Date(ms);
    };

    Twig.lib.strtotime = function (str, now) {
        // http://kevin.vanzonneveld.net
        // +   original by: Caio Ariede (http://caioariede.com)
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: David
        // +   improved by: Caio Ariede (http://caioariede.com)
        // +   improved by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Wagner B. Soares
        // +   bugfixed by: Artur Tchernychev
        // %        note 1: Examples all have a fixed timestamp to prevent tests to fail because of variable time(zones)
        // *     example 1: strtotime('+1 day', 1129633200);
        // *     returns 1: 1129719600
        // *     example 2: strtotime('+1 week 2 days 4 hours 2 seconds', 1129633200);
        // *     returns 2: 1130425202
        // *     example 3: strtotime('last month', 1129633200);
        // *     returns 3: 1127041200
        // *     example 4: strtotime('2009-05-04 08:30:00');
        // *     returns 4: 1241418600
        var i, l, match, s, parse = '';

        str = str.replace(/\s{2,}|^\s|\s$/g, ' '); // unecessary spaces
        str = str.replace(/[\t\r\n]/g, ''); // unecessary chars
        if (str === 'now') {
            return now === null || isNaN(now) ? new Date().getTime() / 1000 | 0 : now | 0;
        } else if (!isNaN(parse = Date.parse(str))) {
            return parse / 1000 | 0;
        } else if (now) {
            now = new Date(now * 1000); // Accept PHP-style seconds
        } else {
            now = new Date();
        }

        var upperCaseStr = str;

        str = str.toLowerCase();

        var __is = {
            day: {
                'sun': 0,
                'mon': 1,
                'tue': 2,
                'wed': 3,
                'thu': 4,
                'fri': 5,
                'sat': 6
            },
            mon: [
                'jan',
                'feb',
                'mar',
                'apr',
                'may',
                'jun',
                'jul',
                'aug',
                'sep',
                'oct',
                'nov',
                'dec'
            ]
        };

        var process = function (m) {
            var ago = (m[2] && m[2] === 'ago');
            var num = (num = m[0] === 'last' ? -1 : 1) * (ago ? -1 : 1);

            switch (m[0]) {
            case 'last':
            case 'next':
                switch (m[1].substring(0, 3)) {
                case 'yea':
                    now.setFullYear(now.getFullYear() + num);
                    break;
                case 'wee':
                    now.setDate(now.getDate() + (num * 7));
                    break;
                case 'day':
                    now.setDate(now.getDate() + num);
                    break;
                case 'hou':
                    now.setHours(now.getHours() + num);
                    break;
                case 'min':
                    now.setMinutes(now.getMinutes() + num);
                    break;
                case 'sec':
                    now.setSeconds(now.getSeconds() + num);
                    break;
                case 'mon':
                    if (m[1] === "month") {
                        now.setMonth(now.getMonth() + num);
                        break;
                    }
                    // fall through
                default:
                    var day = __is.day[m[1].substring(0, 3)];
                    if (typeof day !== 'undefined') {
                        var diff = day - now.getDay();
                        if (diff === 0) {
                            diff = 7 * num;
                        } else if (diff > 0) {
                            if (m[0] === 'last') {
                                diff -= 7;
                            }
                        } else {
                            if (m[0] === 'next') {
                                diff += 7;
                            }
                        }
                        now.setDate(now.getDate() + diff);
                        now.setHours(0, 0, 0, 0); // when jumping to a specific last/previous day of week, PHP sets the time to 00:00:00
                    }
                }
                break;

            default:
                if (/\d+/.test(m[0])) {
                    num *= parseInt(m[0], 10);

                    switch (m[1].substring(0, 3)) {
                    case 'yea':
                        now.setFullYear(now.getFullYear() + num);
                        break;
                    case 'mon':
                        now.setMonth(now.getMonth() + num);
                        break;
                    case 'wee':
                        now.setDate(now.getDate() + (num * 7));
                        break;
                    case 'day':
                        now.setDate(now.getDate() + num);
                        break;
                    case 'hou':
                        now.setHours(now.getHours() + num);
                        break;
                    case 'min':
                        now.setMinutes(now.getMinutes() + num);
                        break;
                    case 'sec':
                        now.setSeconds(now.getSeconds() + num);
                        break;
                    }
                } else {
                    return false;
                }
                break;
            }
            return true;
        };

        match = str.match(/^(\d{2,4}-\d{2}-\d{2})(?:\s(\d{1,2}:\d{2}(:\d{2})?)?(?:\.(\d+))?)?$/);
        if (match !== null) {
            if (!match[2]) {
                match[2] = '00:00:00';
            } else if (!match[3]) {
                match[2] += ':00';
            }

            s = match[1].split(/-/g);

            s[1] = __is.mon[s[1] - 1] || s[1];
            s[0] = +s[0];

            s[0] = (s[0] >= 0 && s[0] <= 69) ? '20' + (s[0] < 10 ? '0' + s[0] : s[0] + '') : (s[0] >= 70 && s[0] <= 99) ? '19' + s[0] : s[0] + '';
            return parseInt(this.strtotime(s[2] + ' ' + s[1] + ' ' + s[0] + ' ' + match[2]) + (match[4] ? match[4] / 1000 : ''), 10);
        }

        var regex = '([+-]?\\d+\\s' + '(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?' + '|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday' + '|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday)' + '|(last|next)\\s' + '(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?' + '|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday' + '|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday))' + '(\\sago)?';

        match = str.match(new RegExp(regex, 'gi')); // Brett: seems should be case insensitive per docs, so added 'i'
        if (match === null) {
            // Try to parse ISO8601 in IE8
            try {
                num = Twig.lib.parseISO8601Date(upperCaseStr);
                if (num) {
                    return num / 1000 | 0;
               }
            } catch (err) {
                return false;
            }
            return false;
        }

        for (i = 0, l = match.length; i < l; i++) {
            if (!process(match[i].split(' '))) {
                return false;
            }
        }

        return now.getTime() / 1000 | 0;
    };

    Twig.lib.is = function(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    };

    // shallow-copy an object
    Twig.lib.copy = function(src) {
        var target = {},
            key;
        for (key in src)
            target[key] = src[key];

        return target;
    };

    Twig.lib.replaceAll = function(string, search, replace) {
        return string.split(search).join(replace);
    };

    return Twig;

})(Twig || { });
//     Twig.js
//     Copyright (c) 2011-2013 John Roepke
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.logic.js
//
// This file handles tokenizing, compiling and parsing logic tokens. {% ... %}
var Twig = (function (Twig) {
    "use strict";

    /**
     * Namespace for logic handling.
     */
    Twig.logic = {};

    /**
     * Logic token types.
     */
    Twig.logic.type = {
        if_:       'Twig.logic.type.if',
        endif:     'Twig.logic.type.endif',
        for_:      'Twig.logic.type.for',
        endfor:    'Twig.logic.type.endfor',
        else_:     'Twig.logic.type.else',
        elseif:    'Twig.logic.type.elseif',
        set:       'Twig.logic.type.set',
        setcapture:'Twig.logic.type.setcapture',
        endset:    'Twig.logic.type.endset',
        filter:    'Twig.logic.type.filter',
        endfilter: 'Twig.logic.type.endfilter',
        block:     'Twig.logic.type.block',
        endblock:  'Twig.logic.type.endblock',
        extends_:  'Twig.logic.type.extends',
        use:       'Twig.logic.type.use',
        include:   'Twig.logic.type.include',
        spaceless: 'Twig.logic.type.spaceless',
        endspaceless: 'Twig.logic.type.endspaceless',
        macro:     'Twig.logic.type.macro',
        endmacro:  'Twig.logic.type.endmacro',
        import_:   'Twig.logic.type.import',
        from:      'Twig.logic.type.from'
    };


    // Regular expressions for handling logic tokens.
    //
    // Properties:
    //
    //      type:  The type of expression this matches
    //
    //      regex: A regular expression that matches the format of the token
    //
    //      next:  What logic tokens (if any) pop this token off the logic stack. If empty, the
    //             logic token is assumed to not require an end tag and isn't push onto the stack.
    //
    //      open:  Does this tag open a logic expression or is it standalone. For example,
    //             {% endif %} cannot exist without an opening {% if ... %} tag, so open = false.
    //
    //  Functions:
    //
    //      compile: A function that handles compiling the token into an output token ready for
    //               parsing with the parse function.
    //
    //      parse:   A function that parses the compiled token into output (HTML / whatever the
    //               template represents).
    Twig.logic.definitions = [
        {
            /**
             * If type logic tokens.
             *
             *  Format: {% if expression %}
             */
            type: Twig.logic.type.if_,
            regex: /^if\s+([^\s].+)$/,
            next: [
                Twig.logic.type.else_,
                Twig.logic.type.elseif,
                Twig.logic.type.endif
            ],
            open: true,
            compile: function (token) {
                var expression = token.match[1];
                // Compile the expression.
                token.stack = Twig.expression.compile.apply(this, [{
                    type:  Twig.expression.type.expression,
                    value: expression
                }]).stack;
                delete token.match;
                return token;
            },
            parse: function (token, context, chain) {
                var output = '',
                    // Parse the expression
                    result = Twig.expression.parse.apply(this, [token.stack, context]);

                // Start a new logic chain
                chain = true;

                if (result) {
                    chain = false;
                    // parse if output
                    output = Twig.parse.apply(this, [token.output, context]);
                }
                return {
                    chain: chain,
                    output: output
                };
            }
        },
        {
            /**
             * Else if type logic tokens.
             *
             *  Format: {% elseif expression %}
             */
            type: Twig.logic.type.elseif,
            regex: /^elseif\s+([^\s].*)$/,
            next: [
                Twig.logic.type.else_,
                Twig.logic.type.elseif,
                Twig.logic.type.endif
            ],
            open: false,
            compile: function (token) {
                var expression = token.match[1];
                // Compile the expression.
                token.stack = Twig.expression.compile.apply(this, [{
                    type:  Twig.expression.type.expression,
                    value: expression
                }]).stack;
                delete token.match;
                return token;
            },
            parse: function (token, context, chain) {
                var output = '';

                if (chain && Twig.expression.parse.apply(this, [token.stack, context]) === true) {
                    chain = false;
                    // parse if output
                    output = Twig.parse.apply(this, [token.output, context]);
                }

                return {
                    chain: chain,
                    output: output
                };
            }
        },
        {
            /**
             * Else if type logic tokens.
             *
             *  Format: {% elseif expression %}
             */
            type: Twig.logic.type.else_,
            regex: /^else$/,
            next: [
                Twig.logic.type.endif,
                Twig.logic.type.endfor
            ],
            open: false,
            parse: function (token, context, chain) {
                var output = '';
                if (chain) {
                    output = Twig.parse.apply(this, [token.output, context]);
                }
                return {
                    chain: chain,
                    output: output
                };
            }
        },
        {
            /**
             * End if type logic tokens.
             *
             *  Format: {% endif %}
             */
            type: Twig.logic.type.endif,
            regex: /^endif$/,
            next: [ ],
            open: false
        },
        {
            /**
             * For type logic tokens.
             *
             *  Format: {% for expression %}
             */
            type: Twig.logic.type.for_,
            regex: /^for\s+([a-zA-Z0-9_,\s]+)\s+in\s+([^\s].*?)(?:\s+if\s+([^\s].*))?$/,
            next: [
                Twig.logic.type.else_,
                Twig.logic.type.endfor
            ],
            open: true,
            compile: function (token) {
                var key_value = token.match[1],
                    expression = token.match[2],
                    conditional = token.match[3],
                    kv_split = null;

                token.key_var = null;
                token.value_var = null;

                if (key_value.indexOf(",") >= 0) {
                    kv_split = key_value.split(',');
                    if (kv_split.length === 2) {
                        token.key_var = kv_split[0].trim();
                        token.value_var = kv_split[1].trim();
                    } else {
                        throw new Twig.Error("Invalid expression in for loop: " + key_value);
                    }
                } else {
                    token.value_var = key_value;
                }

                // Valid expressions for a for loop
                //   for item     in expression
                //   for key,item in expression

                // Compile the expression.
                token.expression = Twig.expression.compile.apply(this, [{
                    type:  Twig.expression.type.expression,
                    value: expression
                }]).stack;

                // Compile the conditional (if available)
                if (conditional) {
                    token.conditional = Twig.expression.compile.apply(this, [{
                        type:  Twig.expression.type.expression,
                        value: conditional
                    }]).stack;
                }

                delete token.match;
                return token;
            },
            parse: function (token, context, continue_chain) {
                // Parse expression
                var result = Twig.expression.parse.apply(this, [token.expression, context]),
                    output = [],
					len,
					index = 0,
                    keyset,
                    that = this,
                    conditional = token.conditional,
                    buildLoop = function(index, len) {
                        var isConditional = conditional !== undefined;
                        return {
                            index: index+1,
                            index0: index,
                            revindex: isConditional?undefined:len-index,
                            revindex0: isConditional?undefined:len-index-1,
                            first: (index === 0),
                            last: isConditional?undefined:(index === len-1),
                            length: isConditional?undefined:len,
                            parent: context
                        };
                    },
                    loop = function(key, value) {
                        var inner_context = Twig.lib.copy(context);

                        inner_context[token.value_var] = value;
                        if (token.key_var) {
                            inner_context[token.key_var] = key;
                        }

                        // Loop object
                        inner_context.loop = buildLoop(index, len);

                        if (conditional === undefined ||
                            Twig.expression.parse.apply(that, [conditional, inner_context]))
                        {
                            output.push(Twig.parse.apply(that, [token.output, inner_context]));
                            index += 1;
                        }
                    };

                if (result instanceof Array) {
                    len = result.length;
                    Twig.forEach(result, function (value) {
                        var key = index;

                        loop(key, value);
                    });
                } else if (result instanceof Object) {
                    if (result._keys !== undefined) {
                        keyset = result._keys;
                    } else {
                        keyset = Object.keys(result);
                    }
					len = keyset.length;
                    Twig.forEach(keyset, function(key) {
                        // Ignore the _keys property, it's internal to twig.js
                        if (key === "_keys") return;

                        loop(key,  result[key]);
                    });
                }

                // Only allow else statements if no output was generated
                continue_chain = (output.length === 0);

                return {
                    chain: continue_chain,
                    output: output.join("")
                };
            }
        },
        {
            /**
             * End if type logic tokens.
             *
             *  Format: {% endif %}
             */
            type: Twig.logic.type.endfor,
            regex: /^endfor$/,
            next: [ ],
            open: false
        },
        {
            /**
             * Set type logic tokens.
             *
             *  Format: {% set key = expression %}
             */
            type: Twig.logic.type.set,
            regex: /^set\s+([a-zA-Z0-9_,\s]+)\s*=\s*(.+)$/,
            next: [ ],
            open: true,
            compile: function (token) {
                var key = token.match[1].trim(),
                    expression = token.match[2],
                    // Compile the expression.
                    expression_stack  = Twig.expression.compile.apply(this, [{
                        type:  Twig.expression.type.expression,
                        value: expression
                    }]).stack;

                token.key = key;
                token.expression = expression_stack;

                delete token.match;
                return token;
            },
            parse: function (token, context, continue_chain) {
                var value = Twig.expression.parse.apply(this, [token.expression, context]),
                    key = token.key;

                // set on both the global and local context
                this.context[key] = value;
                context[key] = value;

                return {
                    chain: continue_chain,
                    context: context
                };
            }
        },
        {
            /**
             * Set capture type logic tokens.
             *
             *  Format: {% set key %}
             */
            type: Twig.logic.type.setcapture,
            regex: /^set\s+([a-zA-Z0-9_,\s]+)$/,
            next: [
                Twig.logic.type.endset
            ],
            open: true,
            compile: function (token) {
                var key = token.match[1].trim();

                token.key = key;

                delete token.match;
                return token;
            },
            parse: function (token, context, continue_chain) {

                var value = Twig.parse.apply(this, [token.output, context]),
                    key = token.key;

                // set on both the global and local context
                this.context[key] = value;
                context[key] = value;

                return {
                    chain: continue_chain,
                    context: context
                };
            }
        },
        {
            /**
             * End set type block logic tokens.
             *
             *  Format: {% endset %}
             */
            type: Twig.logic.type.endset,
            regex: /^endset$/,
            next: [ ],
            open: false
        },
        {
            /**
             * Filter logic tokens.
             *
             *  Format: {% filter upper %} or {% filter lower|escape %}
             */
            type: Twig.logic.type.filter,
            regex: /^filter\s+(.+)$/,
            next: [
                Twig.logic.type.endfilter
            ],
            open: true,
            compile: function (token) {
                var expression = "|" + token.match[1].trim();
                // Compile the expression.
                token.stack = Twig.expression.compile.apply(this, [{
                    type:  Twig.expression.type.expression,
                    value: expression
                }]).stack;
                delete token.match;
                return token;
            },
            parse: function (token, context, chain) {
                var unfiltered = Twig.parse.apply(this, [token.output, context]),
                    stack = [{
                        type: Twig.expression.type.string,
                        value: unfiltered
                    }].concat(token.stack);

                var output = Twig.expression.parse.apply(this, [stack, context]);

                return {
                    chain: chain,
                    output: output
                };
            }
        },
        {
            /**
             * End filter logic tokens.
             *
             *  Format: {% endfilter %}
             */
            type: Twig.logic.type.endfilter,
            regex: /^endfilter$/,
            next: [ ],
            open: false
        },
        {
            /**
             * Block logic tokens.
             *
             *  Format: {% block title %}
             */
            type: Twig.logic.type.block,
            regex: /^block\s+([a-zA-Z0-9_]+)$/,
            next: [
                Twig.logic.type.endblock
            ],
            open: true,
            compile: function (token) {
                token.block = token.match[1].trim();
                delete token.match;
                return token;
            },
            parse: function (token, context, chain) {
                var block_output = "",
                    output = "",
                    hasParent = this.blocks[token.block] && this.blocks[token.block].indexOf(Twig.placeholders.parent) > -1;

                // Don't override previous blocks
                if (this.blocks[token.block] === undefined || hasParent) {
                    block_output = Twig.expression.parse.apply(this, [{
                        type: Twig.expression.type.string,
                        value: Twig.parse.apply(this, [token.output, context])
                    }, context]);

                    if (hasParent) {
                        this.blocks[token.block] =  this.blocks[token.block].replace(Twig.placeholders.parent, block_output);
                    } else {
                        this.blocks[token.block] = block_output;
                    }
                }

                // Check if a child block has been set from a template extending this one.
                if (this.child.blocks[token.block]) {
                    output = this.child.blocks[token.block];

                } else {
                    output = this.blocks[token.block];
                }

                return {
                    chain: chain,
                    output: output
                };
            }
        },
        {
            /**
             * End block logic tokens.
             *
             *  Format: {% endblock %}
             */
            type: Twig.logic.type.endblock,
            regex: /^endblock(?:\s+([a-zA-Z0-9_]+))?$/,
            next: [ ],
            open: false
        },
        {
            /**
             * Block logic tokens.
             *
             *  Format: {% extends "template.twig" %}
             */
            type: Twig.logic.type.extends_,
            regex: /^extends\s+(.+)$/,
            next: [ ],
            open: true,
            compile: function (token) {
                var expression = token.match[1].trim();
                delete token.match;

                token.stack   = Twig.expression.compile.apply(this, [{
                    type:  Twig.expression.type.expression,
                    value: expression
                }]).stack;

                return token;
            },
            parse: function (token, context, chain) {
                // Resolve filename
                var file = Twig.expression.parse.apply(this, [token.stack, context]);

                // Set parent template
                this.extend = file;

                return {
                    chain: chain,
                    output: ''
                };
            }
        },
        {
            /**
             * Block logic tokens.
             *
             *  Format: {% extends "template.twig" %}
             */
            type: Twig.logic.type.use,
            regex: /^use\s+(.+)$/,
            next: [ ],
            open: true,
            compile: function (token) {
                var expression = token.match[1].trim();
                delete token.match;

                token.stack = Twig.expression.compile.apply(this, [{
                    type:  Twig.expression.type.expression,
                    value: expression
                }]).stack;

                return token;
            },
            parse: function (token, context, chain) {
                // Resolve filename
                var file = Twig.expression.parse.apply(this, [token.stack, context]);

                // Import blocks
                this.importBlocks(file);

                return {
                    chain: chain,
                    output: ''
                };
            }
        },
        {
            /**
             * Block logic tokens.
             *
             *  Format: {% includes "template.twig" [with {some: 'values'} only] %}
             */
            type: Twig.logic.type.include,
            regex: /^include\s+(ignore missing\s+)?(.+?)\s*(?:with\s+(.+?))?\s*(only)?$/,
            next: [ ],
            open: true,
            compile: function (token) {
                var match = token.match,
                    includeMissing = match[1] !== undefined,
                    expression = match[2].trim(),
                    withContext = match[3],
                    only = ((match[4] !== undefined) && match[4].length);

                delete token.match;

                token.only = only;
                token.includeMissing = includeMissing;

                token.stack = Twig.expression.compile.apply(this, [{
                    type:  Twig.expression.type.expression,
                    value: expression
                }]).stack;

                if (withContext !== undefined) {
                    token.withStack = Twig.expression.compile.apply(this, [{
                        type:  Twig.expression.type.expression,
                        value: withContext.trim()
                    }]).stack;
                }

                return token;
            },
            parse: function (token, context, chain) {
                // Resolve filename
                var innerContext = {},
                    withContext,
                    i,
                    template;

                if (!token.only) {
                    for (i in context) {
                        if (context.hasOwnProperty(i))
                            innerContext[i] = context[i];
                    }
                }

                if (token.withStack !== undefined) {
                    withContext = Twig.expression.parse.apply(this, [token.withStack, context]);

                    for (i in withContext) {
                        if (withContext.hasOwnProperty(i))
                            innerContext[i] = withContext[i];
                    }
                }

                var file = Twig.expression.parse.apply(this, [token.stack, innerContext]);

                // Import file
                template = this.importFile(file);

                return {
                    chain: chain,
                    output: template.render(innerContext)
                };
            }
        },
        {
            type: Twig.logic.type.spaceless,
            regex: /^spaceless$/,
            next: [
                Twig.logic.type.endspaceless
            ],
            open: true,

            // Parse the html and return it without any spaces between tags
            parse: function (token, context, chain) {
                var // Parse the output without any filter
                    unfiltered = Twig.parse.apply(this, [token.output, context]),
                    // A regular expression to find closing and opening tags with spaces between them
                    rBetweenTagSpaces = />\s+</g,
                    // Replace all space between closing and opening html tags
                    output = unfiltered.replace(rBetweenTagSpaces,'><').trim();

                return {
                    chain: chain,
                    output: output
                };
            }
        },

        // Add the {% endspaceless %} token
        {
            type: Twig.logic.type.endspaceless,
            regex: /^endspaceless$/,
            next: [ ],
            open: false
        },
        {
            /**
             * Macro logic tokens.
             *
             * Format: {% maro input(name, value, type, size) %}
             *
             */ 
            type: Twig.logic.type.macro,
            regex: /^macro\s+([a-zA-Z0-9_]+)\s?\((([a-zA-Z0-9_]+(,\s?)?)*)\)$/,
            next: [
                Twig.logic.type.endmacro
            ],
            open: true,
            compile: function (token) {
                var macroName = token.match[1],
                    parameters = token.match[2].split(/[ ,]+/);

                //TODO: Clean up duplicate check
                for (var i=0; i<parameters.length; i++) {
                    for (var j=0; j<parameters.length; j++){
                        if (parameters[i] === parameters[j] && i !== j) {
                            throw new Twig.Error("Duplicate arguments for parameter: "+ parameters[i]);
                        }
                    }
                }

                token.macroName = macroName;
                token.parameters = parameters;

                delete token.match;
                return token;
            },
            parse: function (token, context, chain) {
                var template = this;
                this.macros[token.macroName] = function() {
                    // Pass global context and other macros 
                    var macroContext = {
                        _self: template.macros
                    }
                    // Add parameters from context to macroContext
                    for (var i=0; i<token.parameters.length; i++) {
                        var prop = token.parameters[i];
                        macroContext[prop] = arguments[i] || undefined;
                    }
                    // Render
                    return Twig.parse.apply(template, [token.output, macroContext])
                };

                return {
                    chain: chain,
                    output: ''
                };

            }
            
        },
        {
            /**
             * End macro logic tokens.
             *
             * Format: {% endmacro %}
             */ 
             type: Twig.logic.type.endmacro,
             regex: /^endmacro$/,
             next: [ ],
             open: false
        },
        {
            /*
            * import logic tokens.
            *
            * Format: {% import "template.twig" as form %}
            */
            type: Twig.logic.type.import_,
            regex: /^import\s+(.+)\s+as\s+([a-zA-Z0-9_]+)$/,
            next: [ ],
            open: true,
            compile: function (token) {
                var expression = token.match[1].trim(),
                    contextName = token.match[2].trim();
                delete token.match;

                token.expression = expression;
                token.contextName = contextName;

                token.stack = Twig.expression.compile.apply(this, [{
                    type: Twig.expression.type.expression,
                    value: expression
                }]).stack;

                return token;
            },
            parse: function (token, context, chain) {
                if (token.expression !== "_self") {
                    var file = Twig.expression.parse.apply(this, [token.stack, context]);
                    var template = this.importMacros(file || token.expression);
                    context[token.contextName] = template.render({}, {output: 'macros'});
                }
                else {
                    context[token.contextName] = this.macros;
                }

                return {
                    chain: chain,
                    output: ''
                }

            }
        },
        {
            /*
            * from logic tokens.
            *
            * Format: {% from "template.twig" import func as form %}
            */
            type: Twig.logic.type.from,
            regex: /^from\s+(.+)\s+import\s+([a-zA-Z0-9_, ]+)$/,
            next: [ ],
            open: true,
            compile: function (token) {
                var expression = token.match[1].trim(),
                    macroExpressions = token.match[2].trim().split(/[ ,]+/),
                    macroNames = {};
                    

                for (var i=0; i<macroExpressions.length; i++) {
                    var res = macroExpressions[i];

                    // match function as variable
                    var macroMatch = res.match(/^([a-zA-Z0-9_]+)\s+(.+)\s+as\s+([a-zA-Z0-9_]+)$/);
                    if (macroMatch) {
                        macroNames[macroMatch[1].trim()] = macroMatch[2].trim();
                    }
                    else if (res.match(/^([a-zA-Z0-9_]+)$/)) {
                        macroNames[res] = res;
                    }
                    else {
                        // ignore import
                    }

                }

                delete token.match;

                token.expression = expression;
                token.macroNames = macroNames;

                token.stack = Twig.expression.compile.apply(this, [{
                    type: Twig.expression.type.expression,
                    value: expression
                }]).stack;

                return token;
            },
            parse: function (token, context, chain) {
                var macros;

                if (token.expression !== "_self") {
                    var file = Twig.expression.parse.apply(this, [token.stack, context]);
                    var template = this.importMacros(file || token.expression);
                    macros = template.render({}, {output: 'macros'});
                }
                else {
                    macros = this.macros;
                }

                for (var macroName in token.macroNames) {
                    if (macros.hasOwnProperty(macroName)) {
                        context[token.macroNames[macroName]] = macros[macroName];
                    }
                }

                return {
                    chain: chain,
                    output: ''
                }

            }
        }

    ];


    /**
     * Registry for logic handlers.
     */
    Twig.logic.handler = {};

    /**
     * Define a new token type, available at Twig.logic.type.{type}
     */
    Twig.logic.extendType = function (type, value) {
        value = value || ("Twig.logic.type" + type);
        Twig.logic.type[type] = value;
    };

    /**
     * Extend the logic parsing functionality with a new token definition.
     *
     * // Define a new tag
     * Twig.logic.extend({
     *     type: Twig.logic.type.{type},
     *     // The pattern to match for this token
     *     regex: ...,
     *     // What token types can follow this token, leave blank if any.
     *     next: [ ... ]
     *     // Create and return compiled version of the token
     *     compile: function(token) { ... }
     *     // Parse the compiled token with the context provided by the render call
     *     //   and whether this token chain is complete.
     *     parse: function(token, context, chain) { ... }
     * });
     *
     * @param {Object} definition The new logic expression.
     */
    Twig.logic.extend = function (definition) {

        if (!definition.type) {
            throw new Twig.Error("Unable to extend logic definition. No type provided for " + definition);
        }
        if (Twig.logic.type[definition.type]) {
            throw new Twig.Error("Unable to extend logic definitions. Type " +
                                 definition.type + " is already defined.");
        } else {
            Twig.logic.extendType(definition.type);
        }
        Twig.logic.handler[definition.type] = definition;
    };

    // Extend with built-in expressions
    while (Twig.logic.definitions.length > 0) {
        Twig.logic.extend(Twig.logic.definitions.shift());
    }

    /**
     * Compile a logic token into an object ready for parsing.
     *
     * @param {Object} raw_token An uncompiled logic token.
     *
     * @return {Object} A compiled logic token, ready for parsing.
     */
    Twig.logic.compile = function (raw_token) {
        var expression = raw_token.value.trim(),
            token = Twig.logic.tokenize.apply(this, [expression]),
            token_template = Twig.logic.handler[token.type];

        // Check if the token needs compiling
        if (token_template.compile) {
            token = token_template.compile.apply(this, [token]);
            Twig.log.trace("Twig.logic.compile: ", "Compiled logic token to ", token);
        }

        return token;
    };

    /**
     * Tokenize logic expressions. This function matches token expressions against regular
     * expressions provided in token definitions provided with Twig.logic.extend.
     *
     * @param {string} expression the logic token expression to tokenize
     *                (i.e. what's between {% and %})
     *
     * @return {Object} The matched token with type set to the token type and match to the regex match.
     */
    Twig.logic.tokenize = function (expression) {
        var token = {},
            token_template_type = null,
            token_type = null,
            token_regex = null,
            regex_array = null,
            regex = null,
            match = null;

        // Ignore whitespace around expressions.
        expression = expression.trim();

        for (token_template_type in Twig.logic.handler) {
            if (Twig.logic.handler.hasOwnProperty(token_template_type)) {
                // Get the type and regex for this template type
                token_type = Twig.logic.handler[token_template_type].type;
                token_regex = Twig.logic.handler[token_template_type].regex;

                // Handle multiple regular expressions per type.
                regex_array = [];
                if (token_regex instanceof Array) {
                    regex_array = token_regex;
                } else {
                    regex_array.push(token_regex);
                }

                // Check regular expressions in the order they were specified in the definition.
                while (regex_array.length > 0) {
                    regex = regex_array.shift();
                    match = regex.exec(expression.trim());
                    if (match !== null) {
                        token.type  = token_type;
                        token.match = match;
                        Twig.log.trace("Twig.logic.tokenize: ", "Matched a ", token_type, " regular expression of ", match);
                        return token;
                    }
                }
            }
        }

        // No regex matches
        throw new Twig.Error("Unable to parse '" + expression.trim() + "'");
    };

    /**
     * Parse a logic token within a given context.
     *
     * What are logic chains?
     *      Logic chains represent a series of tokens that are connected,
     *          for example:
     *          {% if ... %} {% else %} {% endif %}
     *
     *      The chain parameter is used to signify if a chain is open of closed.
     *      open:
     *          More tokens in this chain should be parsed.
     *      closed:
     *          This token chain has completed parsing and any additional
     *          tokens (else, elseif, etc...) should be ignored.
     *
     * @param {Object} token The compiled token.
     * @param {Object} context The render context.
     * @param {boolean} chain Is this an open logic chain. If false, that means a
     *                        chain is closed and no further cases should be parsed.
     */
    Twig.logic.parse = function (token, context, chain) {
        var output = '',
            token_template;

        context = context || { };

        Twig.log.debug("Twig.logic.parse: ", "Parsing logic token ", token);

        token_template = Twig.logic.handler[token.type];

        if (token_template.parse) {
            output = token_template.parse.apply(this, [token, context, chain]);
        }
        return output;
    };

    return Twig;

})(Twig || { });
//     Twig.js
//     Copyright (c) 2011-2013 John Roepke
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.expression.js
//
// This file handles tokenizing, compiling and parsing expressions.
var Twig = (function (Twig) {
    "use strict";

    /**
     * Namespace for expression handling.
     */
    Twig.expression = { };

    /**
     * Reserved word that can't be used as variable names.
     */
    Twig.expression.reservedWords = [
        "true", "false", "null", "_context"
    ];

    /**
     * The type of tokens used in expressions.
     */
    Twig.expression.type = {
        comma:      'Twig.expression.type.comma',
        operator: {
            unary:  'Twig.expression.type.operator.unary',
            binary: 'Twig.expression.type.operator.binary'
        },
        string:     'Twig.expression.type.string',
        bool:       'Twig.expression.type.bool',
        array: {
            start:  'Twig.expression.type.array.start',
            end:    'Twig.expression.type.array.end'
        },
        object: {
            start:  'Twig.expression.type.object.start',
            end:    'Twig.expression.type.object.end'
        },
        parameter: {
            start:  'Twig.expression.type.parameter.start',
            end:    'Twig.expression.type.parameter.end'
        },
        key: {
            period:   'Twig.expression.type.key.period',
            brackets: 'Twig.expression.type.key.brackets'
        },
        filter:     'Twig.expression.type.filter',
        _function:  'Twig.expression.type._function',
        variable:   'Twig.expression.type.variable',
        number:     'Twig.expression.type.number',
        _null:     'Twig.expression.type.null',
        context:    'Twig.expression.type.context',
        test:       'Twig.expression.type.test'
    };

    Twig.expression.set = {
        // What can follow an expression (in general)
        operations: [
            Twig.expression.type.filter,
            Twig.expression.type.operator.unary,
            Twig.expression.type.operator.binary,
            Twig.expression.type.array.end,
            Twig.expression.type.object.end,
            Twig.expression.type.parameter.end,
            Twig.expression.type.comma,
            Twig.expression.type.test
        ],
        expressions: [
            Twig.expression.type._function,
            Twig.expression.type.bool,
            Twig.expression.type.string,
            Twig.expression.type.variable,
            Twig.expression.type.number,
            Twig.expression.type._null,
            Twig.expression.type.context,
            Twig.expression.type.parameter.start,
            Twig.expression.type.array.start,
            Twig.expression.type.object.start
        ]
    };

    // Most expressions allow a '.' or '[' after them, so we provide a convenience set
    Twig.expression.set.operations_extended = Twig.expression.set.operations.concat([
                    Twig.expression.type.key.period,
                    Twig.expression.type.key.brackets]);

    // Some commonly used compile and parse functions.
    Twig.expression.fn = {
        compile: {
            push: function(token, stack, output) {
                output.push(token);
            },
            push_both: function(token, stack, output) {
                output.push(token);
                stack.push(token);
            }
        },
        parse: {
            push: function(token, stack, context) {
                stack.push(token);
            },
            push_value: function(token, stack, context) {
                stack.push(token.value);
            }
        }
    };

    // The regular expressions and compile/parse logic used to match tokens in expressions.
    //
    // Properties:
    //
    //      type:  The type of expression this matches
    //
    //      regex: One or more regular expressions that matche the format of the token.
    //
    //      next:  Valid tokens that can occur next in the expression.
    //
    // Functions:
    //
    //      compile: A function that compiles the raw regular expression match into a token.
    //
    //      parse:   A function that parses the compiled token into output.
    //
    Twig.expression.definitions = [
        {
            type: Twig.expression.type.test,
            regex: /^is\s+(not)?\s*([a-zA-Z_][a-zA-Z0-9_]*)/,
            next: Twig.expression.set.operations.concat([Twig.expression.type.parameter.start]),
            compile: function(token, stack, output) {
                token.filter   = token.match[2];
                token.modifier = token.match[1];
                delete token.match;
                delete token.value;
                output.push(token);
            },
            parse: function(token, stack, context) {
                var value = stack.pop(),
                    params = token.params && Twig.expression.parse.apply(this, [token.params, context]),
                    result = Twig.test(token.filter, value, params);

                if (token.modifier == 'not') {
                    stack.push(!result);
                } else {
                    stack.push(result);
                }
            }
        },
        {
            type: Twig.expression.type.comma,
            // Match a comma
            regex: /^,/,
            next: Twig.expression.set.expressions.concat([Twig.expression.type.array.end, Twig.expression.type.object.end]),
            compile: function(token, stack, output) {
                var i = stack.length - 1,
                    stack_token;

                delete token.match;
                delete token.value;

                // pop tokens off the stack until the start of the object
                for(;i >= 0; i--) {
                    stack_token = stack.pop();
                    if (stack_token.type === Twig.expression.type.object.start
                            || stack_token.type === Twig.expression.type.parameter.start
                            || stack_token.type === Twig.expression.type.array.start) {
                        stack.push(stack_token);
                        break;
                    }
                    output.push(stack_token);
                }
                output.push(token);
            }
        },
        {
            type: Twig.expression.type.operator.binary,
            // Match any of +, *, /, -, %, ~, <, <=, >, >=, !=, ==, **, ?, :, and, or, not
            regex: /(^[\+\-~%\?\:]|^[!=]==?|^[!<>]=?|^\*\*?|^\/\/?|^and\s+|^or\s+|^in\s+|^not in\s+|^\.\.)/,
            next: Twig.expression.set.expressions.concat([Twig.expression.type.operator.unary]),
            compile: function(token, stack, output) {
                delete token.match;

                token.value = token.value.trim();
                var value = token.value,
                    operator = Twig.expression.operator.lookup(value, token);

                Twig.log.trace("Twig.expression.compile: ", "Operator: ", operator, " from ", value);

                while (stack.length > 0 &&
                       (stack[stack.length-1].type == Twig.expression.type.operator.unary || stack[stack.length-1].type == Twig.expression.type.operator.binary) &&
                            (
                                (operator.associativity === Twig.expression.operator.leftToRight &&
                                 operator.precidence    >= stack[stack.length-1].precidence) ||

                                (operator.associativity === Twig.expression.operator.rightToLeft &&
                                 operator.precidence    >  stack[stack.length-1].precidence)
                            )
                       ) {
                     var temp = stack.pop();
                     output.push(temp);
                }

                if (value === ":") {
                    // Check if this is a ternary or object key being set
                    if (stack[stack.length - 1] && stack[stack.length-1].value === "?") {
                        // Continue as normal for a ternary
                    } else {
                        // This is not a ternary so we push the token to the output where it can be handled
                        //   when the assocated object is closed.
                        var key_token = output.pop();

                        if (key_token.type === Twig.expression.type.string ||
                                key_token.type === Twig.expression.type.variable ||
                                key_token.type === Twig.expression.type.number) {
                            token.key = key_token.value;

                        } else {
                            throw new Twig.Error("Unexpected value before ':' of " + key_token.type + " = " + key_token.value);
                        }

                        output.push(token);
                        return;
                    }
                } else {
                    stack.push(operator);
                }
            },
            parse: function(token, stack, context) {
                if (token.key) {
                    // handle ternary ':' operator
                    stack.push(token);
                } else {
                    Twig.expression.operator.parse(token.value, stack);
                }
            }
        },
        {
            type: Twig.expression.type.operator.unary,
            // Match any of not
            regex: /(^not\s+)/,
            next: Twig.expression.set.expressions,
            compile: function(token, stack, output) {
                delete token.match;

                token.value = token.value.trim();
                var value = token.value,
                    operator = Twig.expression.operator.lookup(value, token);

                Twig.log.trace("Twig.expression.compile: ", "Operator: ", operator, " from ", value);

                while (stack.length > 0 &&
                       (stack[stack.length-1].type == Twig.expression.type.operator.unary || stack[stack.length-1].type == Twig.expression.type.operator.binary) &&
                            (
                                (operator.associativity === Twig.expression.operator.leftToRight &&
                                 operator.precidence    >= stack[stack.length-1].precidence) ||

                                (operator.associativity === Twig.expression.operator.rightToLeft &&
                                 operator.precidence    >  stack[stack.length-1].precidence)
                            )
                       ) {
                     var temp = stack.pop();
                     output.push(temp);
                }

                stack.push(operator);
            },
            parse: function(token, stack, context) {
                Twig.expression.operator.parse(token.value, stack);
            }
        },
        {
            /**
             * Match a string. This is anything between a pair of single or double quotes.
             */
            type: Twig.expression.type.string,
            // See: http://blog.stevenlevithan.com/archives/match-quoted-string
            regex: /^(["'])(?:(?=(\\?))\2.)*?\1/,
            next: Twig.expression.set.operations,
            compile: function(token, stack, output) {
                var value = token.value;
                delete token.match

                // Remove the quotes from the string
                if (value.substring(0, 1) === '"') {
                    value = value.replace('\\"', '"');
                } else {
                    value = value.replace("\\'", "'");
                }
                token.value = value.substring(1, value.length-1).replace( /\\n/g, "\n" ).replace( /\\r/g, "\r" );
                Twig.log.trace("Twig.expression.compile: ", "String value: ", token.value);
                output.push(token);
            },
            parse: Twig.expression.fn.parse.push_value
        },
        {
            /**
             * Match a parameter set start.
             */
            type: Twig.expression.type.parameter.start,
            regex: /^\(/,
            next: Twig.expression.set.expressions.concat([Twig.expression.type.parameter.end]),
            compile: Twig.expression.fn.compile.push_both,
            parse: Twig.expression.fn.parse.push
        },
        {
            /**
             * Match a parameter set end.
             */
            type: Twig.expression.type.parameter.end,
            regex: /^\)/,
            next: Twig.expression.set.operations_extended,
            compile: function(token, stack, output) {
                var stack_token,
                    end_token = token;

                stack_token = stack.pop();
                while(stack.length > 0 && stack_token.type != Twig.expression.type.parameter.start) {
                    output.push(stack_token);
                    stack_token = stack.pop();
                }

                // Move contents of parens into preceding filter
                var param_stack = [];
                while(token.type !== Twig.expression.type.parameter.start) {
                    // Add token to arguments stack
                    param_stack.unshift(token);
                    token = output.pop();
                }
                param_stack.unshift(token);

                var is_expression = false;

                // Get the token preceding the parameters
                token = output[output.length-1];

                if (token === undefined ||
                    (token.type !== Twig.expression.type._function &&
                    token.type !== Twig.expression.type.filter &&
                    token.type !== Twig.expression.type.test &&
                    token.type !== Twig.expression.type.key.brackets &&
                    token.type !== Twig.expression.type.key.period)) {

                    end_token.expression = true;

                    // remove start and end token from stack
                    param_stack.pop();
                    param_stack.shift();

                    end_token.params = param_stack;

                    output.push(end_token);

                } else {
                    end_token.expression = false;
                    token.params = param_stack;
                }
            },
            parse: function(token, stack, context) {
                var new_array = [],
                    array_ended = false,
                    value = null;

                if (token.expression) {
                    value = Twig.expression.parse.apply(this, [token.params, context])
                    stack.push(value);

                } else {

                    while (stack.length > 0) {
                        value = stack.pop();
                        // Push values into the array until the start of the array
                        if (value && value.type && value.type == Twig.expression.type.parameter.start) {
                            array_ended = true;
                            break;
                        }
                        new_array.unshift(value);
                    }

                    if (!array_ended) {
                        throw new Twig.Error("Expected end of parameter set.");
                    }

                    stack.push(new_array);
                }
            }
        },
        {
            /**
             * Match an array start.
             */
            type: Twig.expression.type.array.start,
            regex: /^\[/,
            next: Twig.expression.set.expressions.concat([Twig.expression.type.array.end]),
            compile: Twig.expression.fn.compile.push_both,
            parse: Twig.expression.fn.parse.push
        },
        {
            /**
             * Match an array end.
             */
            type: Twig.expression.type.array.end,
            regex: /^\]/,
            next: Twig.expression.set.operations_extended,
            compile: function(token, stack, output) {
                var i = stack.length - 1,
                    stack_token;
                // pop tokens off the stack until the start of the object
                for(;i >= 0; i--) {
                    stack_token = stack.pop();
                    if (stack_token.type === Twig.expression.type.array.start) {
                        break;
                    }
                    output.push(stack_token);
                }
                output.push(token);
            },
            parse: function(token, stack, context) {
                var new_array = [],
                    array_ended = false,
                    value = null;

                while (stack.length > 0) {
                    value = stack.pop();
                    // Push values into the array until the start of the array
                    if (value.type && value.type == Twig.expression.type.array.start) {
                        array_ended = true;
                        break;
                    }
                    new_array.unshift(value);
                }
                if (!array_ended) {
                    throw new Twig.Error("Expected end of array.");
                }

                stack.push(new_array);
            }
        },
        // Token that represents the start of a hash map '}'
        //
        // Hash maps take the form:
        //    { "key": 'value', "another_key": item }
        //
        // Keys must be quoted (either single or double) and values can be any expression.
        {
            type: Twig.expression.type.object.start,
            regex: /^\{/,
            next: Twig.expression.set.expressions.concat([Twig.expression.type.object.end]),
            compile: Twig.expression.fn.compile.push_both,
            parse: Twig.expression.fn.parse.push
        },

        // Token that represents the end of a Hash Map '}'
        //
        // This is where the logic for building the internal
        // representation of a hash map is defined.
        {
            type: Twig.expression.type.object.end,
            regex: /^\}/,
            next: Twig.expression.set.operations_extended,
            compile: function(token, stack, output) {
                var i = stack.length-1,
                    stack_token;

                // pop tokens off the stack until the start of the object
                for(;i >= 0; i--) {
                    stack_token = stack.pop();
                    if (stack_token && stack_token.type === Twig.expression.type.object.start) {
                        break;
                    }
                    output.push(stack_token);
                }
                output.push(token);
            },
            parse: function(end_token, stack, context) {
                var new_object = {},
                    object_ended = false,
                    token = null,
                    token_key = null,
                    has_value = false,
                    value = null;

                while (stack.length > 0) {
                    token = stack.pop();
                    // Push values into the array until the start of the object
                    if (token && token.type && token.type === Twig.expression.type.object.start) {
                        object_ended = true;
                        break;
                    }
                    if (token && token.type && (token.type === Twig.expression.type.operator.binary || token.type === Twig.expression.type.operator.unary) && token.key) {
                        if (!has_value) {
                            throw new Twig.Error("Missing value for key '" + token.key + "' in object definition.");
                        }
                        new_object[token.key] = value;

                        // Preserve the order that elements are added to the map
                        // This is necessary since JavaScript objects don't
                        // guarantee the order of keys
                        if (new_object._keys === undefined) new_object._keys = [];
                        new_object._keys.unshift(token.key);

                        // reset value check
                        value = null;
                        has_value = false;

                    } else {
                        has_value = true;
                        value = token;
                    }
                }
                if (!object_ended) {
                    throw new Twig.Error("Unexpected end of object.");
                }

                stack.push(new_object);
            }
        },

        // Token representing a filter
        //
        // Filters can follow any expression and take the form:
        //    expression|filter(optional, args)
        //
        // Filter parsing is done in the Twig.filters namespace.
        {
            type: Twig.expression.type.filter,
            // match a | then a letter or _, then any number of letters, numbers, _ or -
            regex: /^\|\s?([a-zA-Z_][a-zA-Z0-9_\-]*)/,
            next: Twig.expression.set.operations_extended.concat([
                    Twig.expression.type.parameter.start]),
            compile: function(token, stack, output) {
                token.value = token.match[1];
                output.push(token);
            },
            parse: function(token, stack, context) {
                var input = stack.pop(),
                    params = token.params && Twig.expression.parse.apply(this, [token.params, context]);

                stack.push(Twig.filter.apply(this, [token.value, input, params]));
            }
        },
        {
            type: Twig.expression.type._function,
            // match any letter or _, then any number of letters, numbers, _ or - followed by (
            regex: /^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/,
            next: Twig.expression.type.parameter.start,
            transform: function(match, tokens) {
                return '(';
            },
            compile: function(token, stack, output) {
                var fn = token.match[1];
                token.fn = fn;
                // cleanup token
                delete token.match;
                delete token.value;

                output.push(token);
            },
            parse: function(token, stack, context) {
                var params = token.params && Twig.expression.parse.apply(this, [token.params, context]),
                    fn     = token.fn,
                    value;

                if (Twig.functions[fn]) {
                    // Get the function from the built-in functions
                    value = Twig.functions[fn].apply(this, params);

                } else if (typeof context[fn] == 'function') {
                    // Get the function from the user/context defined functions
                    value = context[fn].apply(context, params);

                } else {
                    throw new Twig.Error(fn + ' function does not exist and is not defined in the context');
                }

                stack.push(value);
            }
        },

        // Token representing a variable.
        //
        // Variables can contain letters, numbers, underscores and
        // dashes, but must start with a letter or underscore.
        //
        // Variables are retrieved from the render context and take
        // the value of 'undefined' if the given variable doesn't
        // exist in the context.
        {
            type: Twig.expression.type.variable,
            // match any letter or _, then any number of letters, numbers, _ or -
            regex: /^[a-zA-Z_][a-zA-Z0-9_]*/,
            next: Twig.expression.set.operations_extended.concat([
                    Twig.expression.type.parameter.start]),
            compile: Twig.expression.fn.compile.push,
            validate: function(match, tokens) {
                return (Twig.indexOf(Twig.expression.reservedWords, match[0]) < 0);
            },
            parse: function(token, stack, context) {
                // Get the variable from the context
                var value = Twig.expression.resolve(context[token.value], context);
                stack.push(value);
            }
        },
        {
            type: Twig.expression.type.key.period,
            regex: /^\.([a-zA-Z0-9_]+)/,
            next: Twig.expression.set.operations_extended.concat([
                    Twig.expression.type.parameter.start]),
            compile: function(token, stack, output) {
                token.key = token.match[1];
                delete token.match;
                delete token.value;

                output.push(token);
            },
            parse: function(token, stack, context) {
                var params = token.params && Twig.expression.parse.apply(this, [token.params, context]),
                    key = token.key,
                    object = stack.pop(),
                    value;

                if (object === null || object === undefined) {
                    if (this.options.strict_variables) {
                        throw new Twig.Error("Can't access a key " + key + " on an null or undefined object.");
                    } else {
                        return null;
                    }
                }

                var capitalize = function(value) {return value.substr(0, 1).toUpperCase() + value.substr(1);};

                // Get the variable from the context
                if (typeof object === 'object' && key in object) {
                    value = object[key];
                } else if (object["get"+capitalize(key)] !== undefined) {
                    value = object["get"+capitalize(key)];
                } else if (object["is"+capitalize(key)] !== undefined) {
                    value = object["is"+capitalize(key)];
                } else {
                    value = null;
                }
                stack.push(Twig.expression.resolve(value, object, params));
            }
        },
        {
            type: Twig.expression.type.key.brackets,
            regex: /^\[([^\]]*)\]/,
            next: Twig.expression.set.operations_extended.concat([
                    Twig.expression.type.parameter.start]),
            compile: function(token, stack, output) {
                var match = token.match[1];
                delete token.value;
                delete token.match;

                // The expression stack for the key
                token.stack = Twig.expression.compile({
                    value: match
                }).stack;

                output.push(token);
            },
            parse: function(token, stack, context) {
                // Evaluate key
                var params = token.params && Twig.expression.parse.apply(this, [token.params, context]),
                    key = Twig.expression.parse.apply(this, [token.stack, context]),
                    object = stack.pop(),
                    value;

                if (object === null || object === undefined) {
                    if (this.options.strict_variables) {
                        throw new Twig.Error("Can't access a key " + key + " on an null or undefined object.");
                    } else {
                        return null;
                    }
                }

                // Get the variable from the context
                if (typeof object === 'object' && key in object) {
                    value = object[key];
                } else {
                    value = null;
                }
                stack.push(Twig.expression.resolve(value, object, params));
            }
        },
        {
            /**
             * Match a null value.
             */
            type: Twig.expression.type._null,
            // match a number
            regex: /^null/,
            next: Twig.expression.set.operations,
            compile: function(token, stack, output) {
                delete token.match;
                token.value = null;
                output.push(token);
            },
            parse: Twig.expression.fn.parse.push_value
        },
        {
            /**
             * Match the context
             */
            type: Twig.expression.type.context,
            regex: /^_context/,
            next: Twig.expression.set.operations_extended.concat([
                    Twig.expression.type.parameter.start]),
            compile: Twig.expression.fn.compile.push,
            parse: function(token, stack, context) {
                stack.push(context);
            }
        },
        {
            /**
             * Match a number (integer or decimal)
             */
            type: Twig.expression.type.number,
            // match a number
            regex: /^\-?\d+(\.\d+)?/,
            next: Twig.expression.set.operations,
            compile: function(token, stack, output) {
                token.value = Number(token.value);
                output.push(token);
            },
            parse: Twig.expression.fn.parse.push_value
        },
        {
            /**
             * Match a boolean
             */
            type: Twig.expression.type.bool,
            regex: /^(true|false)/,
            next: Twig.expression.set.operations,
            compile: function(token, stack, output) {
                token.value = (token.match[0] == "true");
                delete token.match;
                output.push(token);
            },
            parse: Twig.expression.fn.parse.push_value
        }
    ];

    /**
     * Resolve a context value.
     *
     * If the value is a function, it is executed with a context parameter.
     *
     * @param {string} key The context object key.
     * @param {Object} context The render context.
     */
    Twig.expression.resolve = function(value, context, params) {
        if (typeof value == 'function') {
            return value.apply(context, params || []);
        } else {
            return value;
        }
    };

    /**
     * Registry for logic handlers.
     */
    Twig.expression.handler = {};

    /**
     * Define a new expression type, available at Twig.logic.type.{type}
     *
     * @param {string} type The name of the new type.
     */
    Twig.expression.extendType = function (type) {
        Twig.expression.type[type] = "Twig.expression.type." + type;
    };

    /**
     * Extend the expression parsing functionality with a new definition.
     *
     * Token definitions follow this format:
     *  {
     *      type:     One of Twig.expression.type.[type], either pre-defined or added using
     *                    Twig.expression.extendType
     *
     *      next:     Array of types from Twig.expression.type that can follow this token,
     *
     *      regex:    A regex or array of regex's that should match the token.
     *
     *      compile: function(token, stack, output) called when this token is being compiled.
     *                   Should return an object with stack and output set.
     *
     *      parse:   function(token, stack, context) called when this token is being parsed.
     *                   Should return an object with stack and context set.
     *  }
     *
     * @param {Object} definition A token definition.
     */
    Twig.expression.extend = function (definition) {
        if (!definition.type) {
            throw new Twig.Error("Unable to extend logic definition. No type provided for " + definition);
        }
        Twig.expression.handler[definition.type] = definition;
    };

    // Extend with built-in expressions
    while (Twig.expression.definitions.length > 0) {
        Twig.expression.extend(Twig.expression.definitions.shift());
    }

    /**
     * Break an expression into tokens defined in Twig.expression.definitions.
     *
     * @param {string} expression The string to tokenize.
     *
     * @return {Array} An array of tokens.
     */
    Twig.expression.tokenize = function (expression) {
        var tokens = [],
            // Keep an offset of the location in the expression for error messages.
            exp_offset = 0,
            // The valid next tokens of the previous token
            next = null,
            // Match information
            type, regex, regex_array,
            // The possible next token for the match
            token_next,
            // Has a match been found from the definitions
            match_found, invalid_matches = [], match_function;

        match_function = function () {
            var match = Array.prototype.slice.apply(arguments),
                string = match.pop(),
                offset = match.pop();

            Twig.log.trace("Twig.expression.tokenize",
                           "Matched a ", type, " regular expression of ", match);

            if (next && Twig.indexOf(next, type) < 0) {
                invalid_matches.push(
                    type + " cannot follow a " + tokens[tokens.length - 1].type +
                           " at template:" + exp_offset + " near '" + match[0].substring(0, 20) +
                           "...'"
                );
                // Not a match, don't change the expression
                return match[0];
            }

            // Validate the token if a validation function is provided
            if (Twig.expression.handler[type].validate &&
                    !Twig.expression.handler[type].validate(match, tokens)) {
                return match[0];
            }

            invalid_matches = [];

            tokens.push({
                type:  type,
                value: match[0],
                match: match
            });

            match_found = true;
            next = token_next;
            exp_offset += match[0].length;

            // Does the token need to return output back to the expression string
            // e.g. a function match of cycle( might return the '(' back to the expression
            // This allows look-ahead to differentiate between token types (e.g. functions and variable names)
            if (Twig.expression.handler[type].transform) {
                return Twig.expression.handler[type].transform(match, tokens);
            }
            return '';
        };

        Twig.log.debug("Twig.expression.tokenize", "Tokenizing expression ", expression);

        while (expression.length > 0) {
            expression = expression.trim();
            for (type in Twig.expression.handler) {
                if (Twig.expression.handler.hasOwnProperty(type)) {
                    token_next = Twig.expression.handler[type].next;
                    regex = Twig.expression.handler[type].regex;
                    // Twig.log.trace("Checking type ", type, " on ", expression);
                    if (regex instanceof Array) {
                        regex_array = regex;
                    } else {
                        regex_array = [regex];
                    }

                    match_found = false;
                    while (regex_array.length > 0) {
                        regex = regex_array.pop();
                        expression = expression.replace(regex, match_function);
                    }
                    // An expression token has been matched. Break the for loop and start trying to
                    //  match the next template (if expression isn't empty.)
                    if (match_found) {
                        break;
                    }
                }
            }
            if (!match_found) {
                if (invalid_matches.length > 0) {
                    throw new Twig.Error(invalid_matches.join(" OR "));
                } else {
                    throw new Twig.Error("Unable to parse '" + expression + "' at template position" + exp_offset);
                }
            }
        }

        Twig.log.trace("Twig.expression.tokenize", "Tokenized to ", tokens);
        return tokens;
    };

    /**
     * Compile an expression token.
     *
     * @param {Object} raw_token The uncompiled token.
     *
     * @return {Object} The compiled token.
     */
    Twig.expression.compile = function (raw_token) {
        var expression = raw_token.value,
            // Tokenize expression
            tokens = Twig.expression.tokenize(expression),
            token = null,
            output = [],
            stack = [],
            token_template = null;

        Twig.log.trace("Twig.expression.compile: ", "Compiling ", expression);

        // Push tokens into RPN stack using the Sunting-yard algorithm
        // See http://en.wikipedia.org/wiki/Shunting_yard_algorithm

        while (tokens.length > 0) {
            token = tokens.shift();
            token_template = Twig.expression.handler[token.type];

            Twig.log.trace("Twig.expression.compile: ", "Compiling ", token);

            // Compile the template
            token_template.compile && token_template.compile(token, stack, output);

            Twig.log.trace("Twig.expression.compile: ", "Stack is", stack);
            Twig.log.trace("Twig.expression.compile: ", "Output is", output);
        }

        while(stack.length > 0) {
            output.push(stack.pop());
        }

        Twig.log.trace("Twig.expression.compile: ", "Final output is", output);

        raw_token.stack = output;
        delete raw_token.value;

        return raw_token;
    };


    /**
     * Parse an RPN expression stack within a context.
     *
     * @param {Array} tokens An array of compiled expression tokens.
     * @param {Object} context The render context to parse the tokens with.
     *
     * @return {Object} The result of parsing all the tokens. The result
     *                  can be anything, String, Array, Object, etc... based on
     *                  the given expression.
     */
    Twig.expression.parse = function (tokens, context) {
        var that = this;

        // If the token isn't an array, make it one.
        if (!(tokens instanceof Array)) {
            tokens = [tokens];
        }

        // The output stack
        var stack = [],
            token_template = null;

        Twig.forEach(tokens, function (token) {
            token_template = Twig.expression.handler[token.type];

            token_template.parse && token_template.parse.apply(that, [token, stack, context]);
        });

        // Pop the final value off the stack
        return stack.pop();
    };

    return Twig;

})( Twig || { } );
//     Twig.js
//     Copyright (c) 2011-2013 John Roepke
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.expression.operator.js
//
// This file handles operator lookups and parsing.
var Twig = (function (Twig) {
    "use strict";

    /**
     * Operator associativity constants.
     */
    Twig.expression.operator = {
        leftToRight: 'leftToRight',
        rightToLeft: 'rightToLeft'
    };

    var containment = function(a, b) {
        if (b.indexOf !== undefined) {
            // String
            return a === b || a !== '' && b.indexOf(a) > -1;

        } else {
            var el;
            for (el in b) {
                if (b.hasOwnProperty(el) && b[el] === a) {
                    return true;
                }
            }
            return false;
        }
    };

    /**
     * Get the precidence and associativity of an operator. These follow the order that C/C++ use.
     * See http://en.wikipedia.org/wiki/Operators_in_C_and_C++ for the table of values.
     */
    Twig.expression.operator.lookup = function (operator, token) {
        switch (operator) {
            case "..":
            case 'not in':
            case 'in':
                token.precidence = 20;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case ',':
                token.precidence = 18;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            // Ternary
            case '?':
            case ':':
                token.precidence = 16;
                token.associativity = Twig.expression.operator.rightToLeft;
                break;

            case 'or':
                token.precidence = 14;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case 'and':
                token.precidence = 13;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '==':
            case '!=':
                token.precidence = 9;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '<':
            case '<=':
            case '>':
            case '>=':
                token.precidence = 8;
                token.associativity = Twig.expression.operator.leftToRight;
                break;


            case '~': // String concatination
            case '+':
            case '-':
                token.precidence = 6;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '//':
            case '**':
            case '*':
            case '/':
            case '%':
                token.precidence = 5;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case 'not':
                token.precidence = 3;
                token.associativity = Twig.expression.operator.rightToLeft;
                break;

            default:
                throw new Twig.Error(operator + " is an unknown operator.");
        }
        token.operator = operator;
        return token;
    };

    /**
     * Handle operations on the RPN stack.
     *
     * Returns the updated stack.
     */
    Twig.expression.operator.parse = function (operator, stack) {
        Twig.log.trace("Twig.expression.operator.parse: ", "Handling ", operator);
        var a, b, c;
        switch (operator) {
            case ':':
                // Ignore
                break;

            case '?':
                c = stack.pop(); // false expr
                b = stack.pop(); // true expr
                a = stack.pop(); // conditional
                if (a) {
                    stack.push(b);
                } else {
                    stack.push(c);
                }
                break;

            case '+':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(a + b);
                break;

            case '-':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(a - b);
                break;

            case '*':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(a * b);
                break;

            case '/':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(a / b);
                break;

            case '//':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(parseInt(a / b));
                break;

            case '%':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(a % b);
                break;

            case '~':
                b = stack.pop();
                a = stack.pop();
                stack.push( (a !== undefined ? a.toString() : "")
                          + (b !== undefined ? b.toString() : "") );
                break;

            case 'not':
            case '!':
                stack.push(!stack.pop());
                break;

            case '<':
                b = stack.pop();
                a = stack.pop();
                stack.push(a < b);
                break;

            case '<=':
                b = stack.pop();
                a = stack.pop();
                stack.push(a <= b);
                break;

            case '>':
                b = stack.pop();
                a = stack.pop();
                stack.push(a > b);
                break;

            case '>=':
                b = stack.pop();
                a = stack.pop();
                stack.push(a >= b);
                break;

            case '===':
                b = stack.pop();
                a = stack.pop();
                stack.push(a === b);
                break;

            case '==':
                b = stack.pop();
                a = stack.pop();
                stack.push(a == b);
                break;

            case '!==':
                b = stack.pop();
                a = stack.pop();
                stack.push(a !== b);
                break;

            case '!=':
                b = stack.pop();
                a = stack.pop();
                stack.push(a != b);
                break;

            case 'or':
                b = stack.pop();
                a = stack.pop();
                stack.push(a || b);
                break;

            case 'and':
                b = stack.pop();
                a = stack.pop();
                stack.push(a && b);
                break;

            case '**':
                b = stack.pop();
                a = stack.pop();
                stack.push(Math.pow(a, b));
                break;


            case 'not in':
                b = stack.pop();
                a = stack.pop();
                stack.push( !containment(a, b) );
                break;

            case 'in':
                b = stack.pop();
                a = stack.pop();
                stack.push( containment(a, b) );
                break;

            case '..':
                b = stack.pop();
                a = stack.pop();
                stack.push( Twig.functions.range(a, b) );
                break;

            default:
                throw new Twig.Error(operator + " is an unknown operator.");
        }
    };

    return Twig;

})( Twig || { } );
//     Twig.js
//     Copyright (c) 2011-2013 John Roepke
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.filters.js
//
// This file handles parsing filters.
var Twig = (function (Twig) {

    // Determine object type
    function is(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }

    Twig.filters = {
        // String Filters
        upper:  function(value) {
            if ( typeof value !== "string" ) {
               return value;
            }

            return value.toUpperCase();
        },
        lower: function(value) {
            if ( typeof value !== "string" ) {
               return value;
            }

            return value.toLowerCase();
        },
        capitalize: function(value) {
            if ( typeof value !== "string" ) {
                 return value;
            }

            return value.substr(0, 1).toUpperCase() + value.substr(1);
        },
        title: function(value) {
            if ( typeof value !== "string" ) {
               return value;
            }

            return value.replace( /(^|\s)([a-z])/g , function(m, p1, p2){
                return p1 + p2.toUpperCase();
            });
        },
        length: function(value) {
            if (value instanceof Array || typeof value === "string") {
                return value.length;
            } else if (value instanceof Object) {
                if (value._keys === undefined) {
                    return Object.keys(value).length;
                } else {
                    return value._keys.length;
                }
            } else {
                return 0;
            }
        },

        // Array/Object Filters
        reverse: function(value) {
            if (is("Array", value)) {
                return value.reverse();
            } else if (is("String", value)) {
                return value.split("").reverse().join("");
            } else if (value instanceof Object) {
                var keys = value._keys || Object.keys(value).reverse();
                value._keys = keys;
                return value;
            }
        },
        sort: function(value) {
            if (is("Array", value)) {
                return value.sort();
            } else if (value instanceof Object) {
                // Sorting objects isn't obvious since the order of
                // returned keys isn't guaranteedin JavaScript.
                // Because of this we use a "hidden" key called _keys to
                // store the keys in the order we want to return them.

                delete value._keys;
                var keys = Object.keys(value),
                    sorted_keys = keys.sort(function(a, b) {
                        return value[a] > value[b];
                    });
                value._keys = sorted_keys;
                return value;
            }
        },
        keys: function(value) {
            if (value === undefined || value === null){
                return;
           }

            var keyset = value._keys || Object.keys(value),
                output = [];

            Twig.forEach(keyset, function(key) {
                if (key === "_keys") return; // Ignore the _keys property
                if (value.hasOwnProperty(key)) {
                    output.push(key);
                }
            });
            return output;
        },
        url_encode: function(value) {
            if (value === undefined || value === null){
                return;
            }

            return encodeURIComponent(value);
        },
        join: function(value, params) {
            if (value === undefined || value === null){
                return;
            }

            var join_str = "",
                output = [],
                keyset = null;

            if (params && params[0]) {
                join_str = params[0];
            }
            if (value instanceof Array) {
                output = value;
            } else {
                keyset = value._keys || Object.keys(value);
                Twig.forEach(keyset, function(key) {
                    if (key === "_keys") return; // Ignore the _keys property
                    if (value.hasOwnProperty(key)) {
                        output.push(value[key]);
                    }
                });
            }
            return output.join(join_str);
        },
        "default": function(value, params) {
            if (params === undefined || params.length !== 1) {
                throw new Twig.Error("default filter expects one argument");
            }
            if (value === undefined || value === null || value === '' ) {
                return params[0];
            } else {
                return value;
            }
        },
        json_encode: function(value) {
            if (value && value.hasOwnProperty( "_keys" ) ) {
                delete value._keys;
            }
            if(value === undefined || value === null) {
                return "null";
            }
            return JSON.stringify(value);
        },
        merge: function(value, params) {
            var obj = [],
                arr_index = 0,
                keyset = [];

            // Check to see if all the objects being merged are arrays
            if (!(value instanceof Array)) {
                // Create obj as an Object
                obj = { };
            } else {
                Twig.forEach(params, function(param) {
                    if (!(param instanceof Array)) {
                        obj = { };
                    }
                });
            }
            if (!(obj instanceof Array)) {
                obj._keys = [];
            }

            if (value instanceof Array) {
                Twig.forEach(value, function(val) {
                    if (obj._keys) obj._keys.push(arr_index);
                    obj[arr_index] = val;
                    arr_index++;
                });
            } else {
                keyset = value._keys || Object.keys(value);
                Twig.forEach(keyset, function(key) {
                    obj[key] = value[key];
                    obj._keys.push(key);

                    // Handle edge case where a number index in an object is greater than
                    //   the array counter. In such a case, the array counter is increased
                    //   one past the index.
                    //
                    // Example {{ ["a", "b"]|merge({"4":"value"}, ["c", "d"])
                    // Without this, d would have an index of "4" and overwrite the value
                    //   of "value"
                    var int_key = parseInt(key, 10);
                    if (!isNaN(int_key) && int_key >= arr_index) {
                        arr_index = int_key + 1;
                    }
                });
            }

            // mixin the merge arrays
            Twig.forEach(params, function(param) {
                if (param instanceof Array) {
                    Twig.forEach(param, function(val) {
                        if (obj._keys) obj._keys.push(arr_index);
                        obj[arr_index] = val;
                        arr_index++;
                    });
                } else {
                    keyset = param._keys || Object.keys(param);
                    Twig.forEach(keyset, function(key) {
                        if (!obj[key]) obj._keys.push(key);
                        obj[key] = param[key];

                        var int_key = parseInt(key, 10);
                        if (!isNaN(int_key) && int_key >= arr_index) {
                            arr_index = int_key + 1;
                        }
                    });
                }
            });
            if (params.length === 0) {
                throw new Twig.Error("Filter merge expects at least one parameter");
            }

            return obj;
        },
        date: function(value, params) {
            if (value === undefined||value === null){
                return;
            }

            var date = Twig.functions.date(value);
            return Twig.lib.formatDate(date, params[0]);
        },

        date_modify: function(value, params) {
            if (value === undefined || value === null) {
                return;
            }
            if (params === undefined || params.length !== 1) {
                throw new Twig.Error("date_modify filter expects 1 argument");
            }

            var modifyText = params[0], time;

            if (Twig.lib.is("Date", value)) {
                time = Twig.lib.strtotime(modifyText, value.getTime() / 1000);
            }
            if (Twig.lib.is("String", value)) {
                time = Twig.lib.strtotime(modifyText, Twig.lib.strtotime(value));
            }
            if (Twig.lib.is("Number", value)) {
                time = Twig.lib.strtotime(modifyText, value);
            }

            return new Date(time * 1000);
        },

        replace: function(value, params) {
            if (value === undefined||value === null){
                return;
            }

            var pairs = params[0],
                tag;
            for (tag in pairs) {
                if (pairs.hasOwnProperty(tag) && tag !== "_keys") {
                    value = Twig.lib.replaceAll(value, tag, pairs[tag]);
                }
            }
            return value;
        },

        format: function(value, params) {
            if (value === undefined || value === null){
                return;
            }

            return Twig.lib.vsprintf(value, params);
        },

        striptags: function(value) {
            if (value === undefined || value === null){
                return;
            }

            return Twig.lib.strip_tags(value);
        },

        escape: function(value) {
            if (value === undefined|| value === null){
                return;
            }
            return value.toString().replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#039;");
        },

        /* Alias of escape */
        "e": function(value) {
            return Twig.filters.escape(value);
        },

        nl2br: function(value) {
            if (value === undefined || value === null){
                return;
            }
            var linebreak_tag = "BACKSLASH_n_replace",
                br = "<br />" + linebreak_tag;

            value = Twig.filters.escape(value)
                        .replace(/\r\n/g, br)
                        .replace(/\r/g, br)
                        .replace(/\n/g, br);

            return Twig.lib.replaceAll(value, linebreak_tag, "\n");
        },

        /**
         * Adapted from: http://phpjs.org/functions/number_format:481
         */
        number_format: function(value, params) {
            var number = value,
                decimals = (params && params[0]) ? params[0] : undefined,
                dec      = (params && params[1] !== undefined) ? params[1] : ".",
                sep      = (params && params[2] !== undefined) ? params[2] : ",";

            number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
            var n = !isFinite(+number) ? 0 : +number,
                prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
                s = '',
                toFixedFix = function (n, prec) {
                    var k = Math.pow(10, prec);
                    return '' + Math.round(n * k) / k;
                };
            // Fix for IE parseFloat(0.55).toFixed(0) = 0;
            s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
            if (s[0].length > 3) {
                s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
            }
            if ((s[1] || '').length < prec) {
                s[1] = s[1] || '';
                s[1] += new Array(prec - s[1].length + 1).join('0');
            }
            return s.join(dec);
        },

        trim: function(value, params) {
            if (value === undefined|| value === null){
                return;
            }

            var str = Twig.filters.escape( '' + value ),
                whitespace;
            if ( params && params[0] ) {
                whitespace = '' + params[0];
            } else {
                whitespace = ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
            }
            for (var i = 0; i < str.length; i++) {
                if (whitespace.indexOf(str.charAt(i)) === -1) {
                    str = str.substring(i);
                    break;
                }
            }
            for (i = str.length - 1; i >= 0; i--) {
                if (whitespace.indexOf(str.charAt(i)) === -1) {
                    str = str.substring(0, i + 1);
                    break;
                }
            }
            return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
        },

        slice: function(value, params) {
            if (value === undefined || value === null) {
                return;
            }
            if (params === undefined || params.length < 1) {
                throw new Twig.Error("slice filter expects at least 1 argument");
            }

            // default to start of string
            var start = params[0] || 0;
            // default to length of string
            var length = params.length > 1 ? params[1] : value.length;
            // handle negative start values
            var startIndex = start >= 0 ? start : Math.max( value.length + start, 0 );

            if (Twig.lib.is("Array", value)) {
                var output = [];
                for (var i = startIndex; i < startIndex + length && i < value.length; i++) {
                    output.push(value[i]);
                }
                return output;
            } else if (Twig.lib.is("String", value)) {
                return value.substr(startIndex, length);
            } else {
                throw new Twig.Error("slice filter expects value to be an array or string");
            }
        },

        abs: function(value) {
            if (value === undefined || value === null) {
                return;
            }

            return Math.abs(value);
        },

        first: function(value) {
            if (value instanceof Array) {
                return value[0];
            } else if (value instanceof Object) {
                if ('_keys' in value) {
                    return value[value._keys[0]];
                }
            } else if ( typeof value === "string" ) {
                return value.substr(0, 1);
            }

            return;
        },

        split: function(value, params) {
            if (value === undefined || value === null) {
                return;
            }
            if (params === undefined || params.length < 1 || params.length > 2) {
                throw new Twig.Error("split filter expects 1 or 2 argument");
            }
            if (Twig.lib.is("String", value)) {
                var delimiter = params[0],
                    limit = params[1],
                    split = value.split(delimiter);

                if (limit === undefined) {

                    return split;

                } else if (limit < 0) {

                    return value.split(delimiter, split.length + limit);

                } else {

                    var limitedSplit = [];

                    if (delimiter == '') {
                        // empty delimiter
                        // "aabbcc"|split('', 2)
                        //     -> ['aa', 'bb', 'cc']

                        while(split.length > 0) {
                            var temp = "";
                            for (var i=0; i<limit && split.length > 0; i++) {
                                temp += split.shift();
                            }
                            limitedSplit.push(temp);
                        }

                    } else {
                        // non-empty delimiter
                        // "one,two,three,four,five"|split(',', 3)
                        //     -> ['one', 'two', 'three,four,five']

                        for (var i=0; i<limit-1 && split.length > 0; i++) {
                            limitedSplit.push(split.shift());
                        }

                        if (split.length > 0) {
                            limitedSplit.push(split.join(delimiter));
                        }
                    }

                    return limitedSplit;
                }

            } else {
                throw new Twig.Error("split filter expects value to be a string");
            }
        },
        last: function(value) {
            if (Twig.lib.is('Object', value)) {
                var keys;

                if (value._keys === undefined) {
                    keys = Object.keys(value);
                } else {
                    keys = value._keys;
                }

                return value[keys[keys.length - 1]];
            }

            // string|array
            return value[value.length - 1];
        }
    };

    Twig.filter = function(filter, value, params) {
        if (!Twig.filters[filter]) {
            throw "Unable to find filter " + filter;
        }
        return Twig.filters[filter].apply(this, [value, params]);
    };

    Twig.filter.extend = function(filter, definition) {
        Twig.filters[filter] = definition;
    };

    return Twig;

})(Twig || { });
//     Twig.js
//     Copyright (c) 2011-2013 John Roepke
//                   2012 Hadrien Lanneau
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.functions.js
//
// This file handles parsing filters.
var Twig = (function (Twig) {

    // Determine object type
    function is(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }

    Twig.functions = {
        //  attribute, block, constant, date, dump, parent, random,.

        // Range function from http://phpjs.org/functions/range:499
        // Used under an MIT License
        range: function (low, high, step) {
            // http://kevin.vanzonneveld.net
            // +   original by: Waldo Malqui Silva
            // *     example 1: range ( 0, 12 );
            // *     returns 1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
            // *     example 2: range( 0, 100, 10 );
            // *     returns 2: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
            // *     example 3: range( 'a', 'i' );
            // *     returns 3: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
            // *     example 4: range( 'c', 'a' );
            // *     returns 4: ['c', 'b', 'a']
            var matrix = [];
            var inival, endval, plus;
            var walker = step || 1;
            var chars = false;

            if (!isNaN(low) && !isNaN(high)) {
                inival = parseInt(low, 10);
                endval = parseInt(high, 10);
            } else if (isNaN(low) && isNaN(high)) {
                chars = true;
                inival = low.charCodeAt(0);
                endval = high.charCodeAt(0);
            } else {
                inival = (isNaN(low) ? 0 : low);
                endval = (isNaN(high) ? 0 : high);
            }

            plus = ((inival > endval) ? false : true);
            if (plus) {
                while (inival <= endval) {
                    matrix.push(((chars) ? String.fromCharCode(inival) : inival));
                    inival += walker;
                }
            } else {
                while (inival >= endval) {
                    matrix.push(((chars) ? String.fromCharCode(inival) : inival));
                    inival -= walker;
                }
            }

            return matrix;
        },
        cycle: function(arr, i) {
            var pos = i % arr.length;
            return arr[pos];
        },
        dump: function() {
            var EOL = '\n',
            	indentChar = '  ',
            	indentTimes = 0,
            	out = '',
				args = Array.prototype.slice.call(arguments),
				indent = function(times) {
                	var ind	 = '';
                    while (times > 0) {
                        times--;
                        ind += indentChar;
                    }
                    return ind;
                },
				displayVar = function(variable) {
                    out += indent(indentTimes);
                    if (typeof(variable) === 'object') {
                        dumpVar(variable);
                    } else if (typeof(variable) === 'function') {
                        out += 'function()' + EOL;
                    } else if (typeof(variable) === 'string') {
                        out += 'string(' + variable.length + ') "' + variable + '"' + EOL;
                    } else if (typeof(variable) === 'number') {
                        out += 'number(' + variable + ')' + EOL;
                    } else if (typeof(variable) === 'boolean') {
                        out += 'bool(' + variable + ')' + EOL;
                    }
                },
             	dumpVar = function(variable) {
					var	i;
	                if (variable === null) {
	                    out += 'NULL' + EOL;
	                } else if (variable === undefined) {
	                    out += 'undefined' + EOL;
	                } else if (typeof variable === 'object') {
	                    out += indent(indentTimes) + typeof(variable);
	                    indentTimes++;
	                    out += '(' + (function(obj) {
	                        var size = 0, key;
	                        for (key in obj) {
	                            if (obj.hasOwnProperty(key)) {
	                                size++;
	                            }
	                        }
	                        return size;
	                    })(variable) + ') {' + EOL;
	                    for (i in variable) {
	                        out += indent(indentTimes) + '[' + i + ']=> ' + EOL;
	                        displayVar(variable[i]);
	                    }
	                    indentTimes--;
	                    out += indent(indentTimes) + '}' + EOL;
	                } else {
	                    displayVar(variable);
	                }
	            };

			// handle no argument case by dumping the entire render context
			if (args.length == 0) args.push(this.context);

			Twig.forEach(args, function(variable) {
				dumpVar(variable);
			});

            return out;
        },
        date: function(date, time) {
            var dateObj;
            if (date === undefined) {
                dateObj = new Date();
            } else if (Twig.lib.is("Date", date)) {
                dateObj = date;
            } else if (Twig.lib.is("String", date)) {
                dateObj = new Date(Twig.lib.strtotime(date) * 1000);
            } else if (Twig.lib.is("Number", date)) {
                // timestamp
                dateObj = new Date(date * 1000);
            } else {
                throw new Twig.Error("Unable to parse date " + date);
            }
            return dateObj;
        },
        block: function(block) {
            return this.blocks[block];
        },
        parent: function() {
            // Add a placeholder
            return Twig.placeholders.parent;
        },
        attribute: function(object, method, params) {
            if (object instanceof Object) {
                if (object.hasOwnProperty(method)) {
                    if (typeof object[method] === "function") {
                        return object[method].apply(undefined, params);
                    }
                    else {
                        return object[method];
                    }
                }
            }
            // Array will return element 0-index
            return object[method] || undefined;
        }
    };

    Twig._function = function(_function, value, params) {
        if (!Twig.functions[_function]) {
            throw "Unable to find function " + _function;
        }
        return Twig.functions[_function](value, params);
    };

    Twig._function.extend = function(_function, definition) {
        Twig.functions[_function] = definition;
    };

    return Twig;

})(Twig || { });
//     Twig.js
//     Copyright (c) 2011-2013 John Roepke
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.tests.js
//
// This file handles expression tests. (is empty, is not defined, etc...)
var Twig = (function (Twig) {
    "use strict";
    Twig.tests = {
        empty: function(value) {
            if (value === null || value === undefined) return true;
            // Handler numbers
            if (typeof value === "number") return false; // numbers are never "empty"
            // Handle strings and arrays
            if (value.length && value.length > 0) return false;
            // Handle objects
            for (var key in value) {
                if (value.hasOwnProperty(key)) return false;
            }
            return true;
        },
        odd: function(value) {
            return value % 2 === 1;
        },
        even: function(value) {
            return value % 2 === 0;
        },
        divisibleby: function(value, params) {
            return value % params[0] === 0;
        },
        defined: function(value) {
            return value !== undefined;
        },
        none: function(value) {
            return value === null;
        },
        'null': function(value) {
            return this.none(value); // Alias of none
        },
        sameas: function(value, params) {
            return value === params[0];
        }
        /*
        constant ?
         */
    };

    Twig.test = function(test, value, params) {
        if (!Twig.tests[test]) {
            throw "Test " + test + " is not defined.";
        }
        return Twig.tests[test](value, params);
    };

    Twig.test.extend = function(test, definition) {
        Twig.tests[test] = definition;
    };

    return Twig;
})( Twig || { } );
//     Twig.js
//     Copyright (c) 2011-2013 John Roepke
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.exports.js
//
// This file provides extension points and other hooks into the twig functionality.

var Twig = (function (Twig) {
    "use strict";
    Twig.exports = {
        VERSION: Twig.VERSION
    };

    /**
     * Create and compile a twig.js template.
     *
     * @param {Object} param Paramteres for creating a Twig template.
     *
     * @return {Twig.Template} A Twig template ready for rendering.
     */
    Twig.exports.twig = function twig(params) {
        'use strict';
        var id = params.id,
            options = {
                strict_variables: params.strict_variables || false,
                allowInlineIncludes: params.allowInlineIncludes || false,
                rethrow: params.rethrow || false
            };

        if (id) {
            Twig.validateId(id);
        }

        if (params.debug !== undefined) {
            Twig.debug = params.debug;
        }
        if (params.trace !== undefined) {
            Twig.trace = params.trace;
        }

        if (params.data !== undefined) {
            return new Twig.Template({
                data: params.data,
                module: params.module,
                id:   id,
                options: options
            });

        } else if (params.ref !== undefined) {
            if (params.id !== undefined) {
                throw new Twig.Error("Both ref and id cannot be set on a twig.js template.");
            }
            return Twig.Templates.load(params.ref);

        } else if (params.href !== undefined) {
            return Twig.Templates.loadRemote(params.href, {
                id: id,
                method: 'ajax',
                base: params.base,
                module: params.module,
                precompiled: params.precompiled,
                async: params.async,
                options: options

            }, params.load, params.error);

        } else if (params.path !== undefined) {
            return Twig.Templates.loadRemote(params.path, {
                id: id,
                method: 'fs',
                base: params.base,
                module: params.module,
                precompiled: params.precompiled,
                async: params.async,
                options: options

            }, params.load, params.error);
        }
    };

    // Extend Twig with a new filter.
    Twig.exports.extendFilter = function(filter, definition) {
        Twig.filter.extend(filter, definition);
    };

    // Extend Twig with a new function.
    Twig.exports.extendFunction = function(fn, definition) {
        Twig._function.extend(fn, definition);
    };

    // Extend Twig with a new test.
    Twig.exports.extendTest = function(test, definition) {
        Twig.test.extend(test, definition);
    };

    // Extend Twig with a new definition.
    Twig.exports.extendTag = function(definition) {
        Twig.logic.extend(definition);
    };

    // Provide an environment for extending Twig core.
    // Calls fn with the internal Twig object.
    Twig.exports.extend = function(fn) {
        fn(Twig);
    };


    /**
     * Provide an extension for use with express 2.
     *
     * @param {string} markup The template markup.
     * @param {array} options The express options.
     *
     * @return {string} The rendered template.
     */
    Twig.exports.compile = function(markup, options) {
        var id = options.filename,
            path = options.filename,
            template;

        // Try to load the template from the cache
        template = new Twig.Template({
            data: markup,
            path: path,
            id: id,
            options: options.settings['twig options']
        }); // Twig.Templates.load(id) ||

        return function(context) {
            return template.render(context);
        };
    };

    /**
     * Provide an extension for use with express 3.
     *
     * @param {string} path The location of the template file on disk.
     * @param {Object|Function} The options or callback.
     * @param {Function} fn callback.
     */

    Twig.exports.renderFile = function(path, options, fn) {
        // handle callback in options
        if ('function' == typeof options) {
            fn = options;
            options = {};
        }

        options = options || {};

        var params = {
                path: path,
                base: options.settings['views'],
                load: function(template) {
                    // render and return template
                    fn(null, template.render(options));
                }
            };

        // mixin any options provided to the express app.
        var view_options = options.settings['twig options'];

        if (view_options) {
            for (var option in view_options) if (view_options.hasOwnProperty(option)) {
                params[option] = view_options[option];
            }
        }

        Twig.exports.twig(params);
    };

    // Express 3 handler
    Twig.exports.__express = Twig.exports.renderFile;

    /**
     * Shoud Twig.js cache templates.
     * Disable during development to see changes to templates without
     * reloading, and disable in production to improve performance.
     *
     * @param {boolean} cache
     */
    Twig.exports.cache = function(cache) {
        Twig.cache = cache;
    }

    return Twig;
}) (Twig || { });

//     Twig.js
//     Copyright (c) 2011-2013 John Roepke
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.compiler.js
//
// This file handles compiling templates into JS
var Twig = (function (Twig) {
    /**
     * Namespace for compilation.
     */
    Twig.compiler = {
        module: {}
    };

    // Compile a Twig Template to output.
    Twig.compiler.compile = function(template, options) {
        // Get tokens
        var tokens = JSON.stringify(template.tokens)
            , id = template.id
            , output;

        if (options.module) {
            if (Twig.compiler.module[options.module] === undefined) {
                throw new Twig.Error("Unable to find module type " + options.module);
            }
            output = Twig.compiler.module[options.module](id, tokens, options.twig);
        } else {
            output = Twig.compiler.wrap(id, tokens);
        }
        return output;
    };

    Twig.compiler.module = {
        amd: function(id, tokens, pathToTwig) {
            return 'define(["' + pathToTwig + '"], function (Twig) {\n\tvar twig, templates;\ntwig = Twig.twig;\ntemplates = ' + Twig.compiler.wrap(id, tokens) + '\n\treturn templates;\n});';
        }
        , node: function(id, tokens) {
            return 'var twig = require("twig").twig;\n'
                + 'exports.template = ' + Twig.compiler.wrap(id, tokens)
        }
        , cjs2: function(id, tokens, pathToTwig) {
            return 'module.declare([{ twig: "' + pathToTwig + '" }], function (require, exports, module) {\n'
                        + '\tvar twig = require("twig").twig;\n'
                        + '\texports.template = ' + Twig.compiler.wrap(id, tokens)
                    + '\n});'
        }
    };

    Twig.compiler.wrap = function(id, tokens) {
        return 'twig({id:"'+id.replace('"', '\\"')+'", data:'+tokens+', precompiled: true});\n';
    };

    return Twig;
})(Twig || {});
//     Twig.js
//     Copyright (c) 2011-2013 John Roepke
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.module.js
// Provide a CommonJS/AMD/Node module export.

if (typeof module !== 'undefined' && module.declare) {
    // Provide a CommonJS Modules/2.0 draft 8 module
    module.declare([], function(require, exports, module) {
        // Add exports from the Twig exports
        for (key in Twig.exports) {
            if (Twig.exports.hasOwnProperty(key)) {
                exports[key] = Twig.exports[key];
            }
        }
    });
} else if (typeof define == 'function' && define.amd) {
    define(function() {
        return Twig.exports;
    });
} else if (typeof module !== 'undefined' && module.exports) {
    // Provide a CommonJS Modules/1.1 module
    module.exports = Twig.exports;
} else {
    // Export for browser use
    window.twig = Twig.exports.twig;
    window.Twig = Twig.exports;
}

/*
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

stage.register("autoload", function(){

	var genarateId = function(){
		return new Date().getTime();
	};


	var loader = function(){
		
		var AJAX = {
			css : {
				mineType :	"text/css",
				tag:		"style",
				media:		"screen",
				type:		"stylesheet",
				position:	"HEAD"
			},
			js:{
				mineType :	"text/javascript",
				tag:		"script",
				position:	"BODY"
			}
		};

		var SCRIPT = {
			css : {
				mineType :	"text/css",
				tag:		"link",
				media:		"screen",
				type:		"stylesheet",
				position:	"HEAD"
			},
			js:{
				mineType :	"text/javascript",
				tag:		"script",
				position:	"BODY"
			}
		};

		var insert = function(position, script){
			switch(position){
				case "HEAD" :
					var head = document.getElementsByTagName('head')[0];
					head.appendChild(script);
				break;
				case "BODY" :
					var body = document.getElementsByTagName('body')[0]
					body.appendChild(script);
				break;
			}
		};


		return function(src, tag , id, transport, callback){
			//if (tag == "js") transport = "ajax";
			//if (tag == "css") transport = "ajax";
			switch (tag){
				case "js":
					/*var def = AJAX[tag];
					var script = document.createElement(def.tag);
					script.setAttribute('type', def.mineType);
					script.setAttribute('id', id + '_'+tag);
					if ( tag === "css" ){
						script.setAttribute('media', def.media);
					}
					$.ajax(src, {
						async:false,
						//cache:true,
						dataType:"text",
						success:function(data, status, xhr){
							this.cache[id] = script ;
							insert(def.position, script);
							$(script).text(data);
							this.logger("LOAD FILE :" + src,"DEBUG");
							callback(null, xhr);
						}.bind(this),
						error:function(xhr, status, message){
							this.logger(src+" :" +message,"ERROR");
							callback(message, xhr);
						}.bind(this)
					});*/
					 
					return $.ajax({
						url: src,
					        async:false,
						dataType: "script",
						success: function(data, status, xhr){
							//this.logger("LOAD FILE :" + src,"DEBUG");
							callback(null, xhr);	
						}.bind(this),
						error:function(xhr, status, message){
							this.logger(src+" :" +message,"ERROR");
							callback(message, xhr);
						}.bind(this)
					});
					



				break;
				case "css":
					var def = SCRIPT[tag];
					var script = document.createElement(def.tag);
					script.setAttribute('type', def.mineType);
					script.setAttribute('id', id + '_'+tag);
					if ( tag === "css" ){
						script.setAttribute('media', def.media);
						script.href = src;/*+ '?time=' + id;*/
						script.rel = def.type;
						script.async = false;
					}
					if (tag === "js"){
						script.src = src;/*+ '?time=' + id;*/
						script.async = false;
					}
					script.onload = function(){
						this.cache[id] = script;
						this.logger("LOAD FILE :" + src,"DEBUG");
						callback(null, script);
					}.bind(this);
					script.onerror = function(error){
						this.logger(src ,"ERROR");
						callback(error, script);
					}.bind(this);
					insert(def.position, script);
				break;
				default:
					this.logger( new Error ("autoload  type transport error "), "ERROR" );
					return null;
			}
			return script ;
		}
	}();
	

	var defaultSetting = {
		transport:"script",
		prefix:null
	};

	var autoload = function(kernel, settings){
		this.settings = jQuery.extend({}, defaultSetting, settings)
		this.cache = {};
		this.prefix = this.settings.prefix  ;
		this.syslog = kernel.syslog || null ;
		this.transport = this.settings.transport ;
	};

	var regType = /(.*)\.(js)$|(.*)\.(css)$/;
	autoload.prototype.load = function(file, callback){
		var id = genarateId();
		var res = regType.exec(file);
		if ( ! res) {
			this.logger("autoload error type file  ","ERROR")
			return null;
		}
		var script = loader.call(this, file, res[2] || res[4] , id, this.transport, callback)
		return id 
	};

	autoload.prototype.logger = function(pci, severity, msgid,  msg){
		if (this.syslog){
			if (! msgid) msgid = "AUTOLOADER  ";
			return this.syslog.logger(pci, severity , msgid,  msg);
		}else{
			console.log(pci);
		}
	};

	autoload.prototype.unLoad = function(id, callback){
		if (id in this.cache){
			var tag = this.cache[id]
			tag.parentNode.removeChild(tag);
			delete tag;
			delete 	this.cache[id] ;	
			return callback(id);
		}else{
			this.logger("Autoload unLoad no tag find :" +id ,"ERROR")
		}
	};

	return autoload ; 

});
/*
 *
 *
 *
 *	KERNEL stage JS
 *
 *
 *
 */

stage.register("kernel",function(){

	var settingsSyslog = {
		//rateLimit:100,
		//burstLimit:10,
		moduleName:"KERNEL",
		defaultSeverity:"INFO"
	};

	var defaultSettings = {
		debug:false,
		location:{
			html5Mode:false,
			hashPrefix:"/"
		}
	};

	var Kernel = function(environment, settings){
		this.container = null; 
		this.modules = {};
		this.settings = stage.extend(true, {}, defaultSettings , settings );
		this.environment = environment;
		this.debug = this.settings.debug ;
		this.booted = false;
		this.container = new stage.Container();
		this.container.set("kernel", this);
		this.isDomReady = false;
		this.uiContainer = null;

		// syslog
		this.syslog = this.initializeLog(settingsSyslog);
		this.container.set("syslog", this.syslog);

		// autoloader
		this.autoloader = new stage.autoload(this, {
			transport:"script"
		});
		this.container.set("autoloader", this.autoloader);

		// notificationsCenter
		this.notificationsCenter =  stage.notificationsCenter.create();
		this.container.set("notificationsCenter", this.notificationsCenter);
		
		// location
		this.initLocation();

		// Router
		this.initRouter();

		// template
		this.initTwig();

		// translation i18n
		this.initTranslation();

		// Service REST
		this.initRest()

		// EVENT NATIF
		$(document).ready(this.listen(this, "onDomReady", this.domReady));
		$(window).resize(this.listen(this,"onResize"));
		$(window).unload(this.listen(this,"onUnLoad"));	
		$(window).load(this.listen(this,"onLoad"));	

		//BOOT	
		this.listen(this, "onBoot" , this.boot)
		//READY
		this.listen(this, "onReady" , this.ready)

		this.notificationsCenter.settingsToListen(this.settings, this);
	};


	Kernel.prototype.set = function(name, value){
		return this.container.set(name, value);	
	};

	Kernel.prototype.get = function(name, value){
		return this.container.get(name, value);	
	};
		
	Kernel.prototype.setParameters =function(name, value){
		return this.container.setParameters(name, value);	
	};

	Kernel.prototype.getParameters = function(name){
		return this.container.getParameters(name);	
	};

	Kernel.prototype.initRouter = function(){
		this.router = new stage.router(this, this.container);
		this.container.set("router", this.router);
	};


	Kernel.prototype.initLocation = function(){
		this.locationService = new stage.location(this, this.settings.location) ;
		this.container.set("location", this.locationService);
	};


	Kernel.prototype.initRest = function(){
		if (stage.Rest) {
			this.restService = new stage.Rest(this.container);
			this.set("rest", this.restService);
		}
	};

	Kernel.prototype.initTranslation = function(){
		if ( ! stage.i18n ){
 		       	this.logger("you must load transation i18n services js file !!!!!", "ERROR")
			return
		}
		this.i18n = new stage.i18n(this, this.container);

		this.container.set("i18n", this.i18n);
	};

	/*
 	 *	OVERRIDE TWIG IMPORT TEMPLATE
 	 */
	var loadRemoteTwig = function(Twig, location, params, callback, error_callback){
		var id  = params.id,
		method      = params.method,
		async       = params.async,
		precompiled = params.precompiled,
		template    = null;

		// Default to async
		if (async === undefined) async = true;

		// Default to the URL so the template is cached.
		if (id === undefined) {
			id = location;
		}
		params.id = id;

		// Check for existing template
		if (Twig.cache && Twig.Templates.registry.hasOwnProperty(id)) {
			// A template is already saved with the given id.
			if (callback) {
				callback(Twig.Templates.registry[id]);
			}
			return Twig.Templates.registry[id];
		}
		//console.log(params.async)
		$.ajax({
			url:location,
			async:async,
			success:function(mydata, status, xhr){
				var moduleName = this.getModuleName( location )
			        if (precompiled === true) {
					mydata = JSON.parse(mydata);
				}
				params.url = location;
				params.data = mydata;
				template = new Twig.Template(params);
				if (this.modules[moduleName]){
					var module = this.modules[moduleName] ;
					var name = module.getTemplateName(location)
					module.registerTemplate(name, template, "template")
				}
				if (callback) {
					callback(template);
				}
			}.bind(this),
			error: function(xrh, status, message){
				error_callback(xrh, status, message)
			}.bind(this)
		})
		if (async === false) {
			return template;
		} else {
			// placeholder for now, should eventually return a deferred object.
			return true;
		}	
	};
	
	Kernel.prototype.initTwig = function(){
		this.logger("INITIALIZE TWIG SERVICE", "DEBUG");
		if (this.environment === "dev"){
			window.Twig.cache = false ;	
		}
		this.templateEngine = window.Twig.twig  ; 
		//extended log error traf
		window.Twig.extend(function(Twig){
			Twig.log.error = function(message){
				this.logger(message, "ERROR");
			}.bind(this)
		}.bind(this));

		window.Twig.extend(function(Twig){
			Twig.Templates.loadRemote = loadRemoteTwig.bind(this, Twig) 
		}.bind(this));

		//extended FUNCTION
		window.Twig.extendFunction("controller", function() {
			var pattern = Array.prototype.shift.call(arguments);
			var sp = pattern.split(":");
			var module = this.getModule(sp[0]);
			if (module){
				var controller = module.getController(sp[1]);
				if (controller){
					var action = sp[2];
					if ( controller[action] ){
						return controller[action].apply(controller, arguments);	
					}
				}
			}
		}.bind(this));
		this.container.set("twig", this.templateEngine);
		return this.templateEngine ;

	};

	Kernel.prototype.domReady = function(){
		if ( ! this.booted ) return ; 
		this.logger("domReady", "DEBUG");
		this.fire("onDomLoad", this);
		var element = this.uiContainer ? $(this.uiContainer) : $("body");
		try {
			if ( this.modules["app"] ){
				this.modules["app"].initialize(element);	
			}		
			for (var module in this.modules){
				if (module === "app") continue;
				this.modules[module].initialize(element);
			}	
			this.fire("onReady", this);
			this.isDomReady = true;
		}catch(e){
			this.logger(e,"ERROR");
		}
	};

	
	Kernel.prototype.listen = function(){
		return this.notificationsCenter.listen.apply(this.notificationsCenter, arguments);
	}

	Kernel.prototype.fire = function(event){
		this.logger("EVENT : " + event,"DEBUG");
		return this.notificationsCenter.fire.apply(this.notificationsCenter, arguments);
	};

	Kernel.prototype.getModule = function(name){
		return this.modules[name] ;
	};
	
	Kernel.prototype.logger = function(pci, severity, msgid,  msg){
		if (! msgid) msgid = "KERNEL "
		return this.syslog.logger(pci, severity, msgid,  msg);
	};

	Kernel.prototype.initializeLog = function(settings){
		
		var syslog =  new stage.syslog(settings);
		if (this.environment === "dev"){
		// CRITIC ERROR
			syslog.listenWithConditions(this,{
				severity:{
					data:"CRITIC,ERROR"
				}		
			},function(pdu){
					console.log(pdu.payload)
				if (pdu.payload.stack ){
						console.error( "SYSLOG " + pdu.severityName +" " + pdu.msgid + " "+new Date(pdu.timeStamp) + " " + pdu.msg+" : "+  pdu.payload.stack);
				}else{
					console.error( "SYSLOG " + pdu.severityName +" " + pdu.msgid + " "+new Date(pdu.timeStamp) + " " + pdu.msg+" : "+  pdu.payload);	
				}
				/*if (pdu.typePayload === "Error" ){
					if (pdu.payload.stack ){
						console.error( "SYSLOG " + pdu.severityName +" " + pdu.msgid + " "+new Date(pdu.timeStamp) + " " + pdu.msg+" : "+  pdu.payload.stack);
					}
					return;
				}
				console.error( "SYSLOG " + pdu.severityName +" " + pdu.msgid + " "+new Date(pdu.timeStamp) + " " + pdu.msg+" : "+  pdu.payload);*/	
			});
			// INFO DEBUG
			var data ;
			this.debug ? data = "INFO,DEBUG" : data = "INFO" ;
			syslog.listenWithConditions(this,{
				severity:{
					data:data
				}		
			},function(pdu){
				console.info( "SYSLOG " + pdu.severityName +" " + pdu.msgid + " "+new Date(pdu.timeStamp) + " " + pdu.msg+" : "+ pdu.payload);
			});
			syslog.listenWithConditions(this,{
				severity:{
					data:"WARNING"
				}		
			},function(pdu){
				console.warn( "SYSLOG " + pdu.severityName +" " + pdu.msgid + " "+new Date(pdu.timeStamp) + " " + pdu.msg+" : "+ pdu.payload);
			});
		}
		return syslog;
	};

	Kernel.prototype.boot = function(){
		this.booted = true;
	};

	Kernel.prototype.ready = function(){
		//this.fire("onUrlChange", this.router.url() )
	};

	Kernel.prototype.loadModule = function(url, settings){
		var res = stage.io.urlToOject(url);
		var moduleName = res.basename ;
				
		return $.ajax(url,stage.extend( {
			cache:false,
			method:"GET",
			//async:false,
			dataType:"xml",
			success:function(data, status, xhr){
				try {
					//FIXME try to parse with url
					var res = stage.xml.parseXml(data);
					var moduleName = res.module["@id"];
					var type = res.module["@type"];
					var moduleSrc = res.module["@src"];
				 
					switch ( type ){
						case "application/javascript" :
							if ( moduleSrc ){
								if (moduleName in this.modules) {
									this.modules[moduleName].initialize();
									this.modules[moduleName].fire("onInitialize", moduleName);	
									this.fire("onInitializeModule", moduleName);	
								} else {							
									this.autoloader.load(moduleSrc, function(error, transport){
										if (error){
											this.fire("onError", error);
											throw error;
										}
										this.registerModule(moduleName, res);
										if (moduleName === "app")
											this.fire("onBoot", this);
									}.bind(this));
								}
							}
						break;
					}
				}catch(e){
					this.logger(e, "ERROR");
					this.fire("onError", e);
					throw e ;
				}
			}.bind(this),
			error:function(xhr, status, message){
				this.fire("onGetConfigError", moduleName);
				this.fire("onError", message);	
			}.bind(this)
		}, settings))
	};

	Kernel.prototype.registerModule = function(name, xml){
		if (name in stage.modules){
			var kernelcontext = this;
			var Class = stage.modules[name].herite(stage.Module);
			this.container.addScope(name);
			Class.prototype.name = name;
			try {
				if (this.isDomReady){
						this.modules[name] = new Class(this, xml,{
							onReady:function(){
								if (this.initialize){
									try {
										this.initialize();
										this.fire("onInitialize", name);	
										kernelcontext.fire("onInitializeModule", name);
									}catch(e){
										this.logger("INITIALIZE MODULE : "+name +" "+e, "ERRROR");
										throw e;
									}
										
								}
							}});	
					
					
				}else{
					this.modules[name] = new Class(this, xml);
				}
				this.container.set(name, this.modules[name]);
			}catch(e){
				this.logger("INSTANCE MODULE : "+name +" "+e, "ERRROR")
				throw e;
			}
		}
	};

	Kernel.prototype.getModuleName = function(url){
		var module = stage.dirname(url);
		var tab = module.split("/")
		return tab[tab.indexOf("Resources")-1];
	};

	return  Kernel;
});
/*
 *
 *
 *
 *
 */
stage.register("appKernel",function(){

	var appKernel = function(url, environnement, settings){

		switch (arguments.length){
			case 0 :
				url = null ;
				environnement = "prod" ;
				settings = {} ;
			break;
			case 1 :
				environnement = url ;
				settings = {} ;
			break;
			case 2:
				settings = environnement;
				environnement = url;
				url = null ;
			break
		}
		var kernel = this.$super ;
		kernel.constructor(environnement, settings);
		if ( url ){
			this.loadModule(url,{
				async:false
			});
		}else{
			this.fire("onBoot", this);
		}
			
	}.herite(stage.kernel);

	return appKernel;
});

/*
 *
 *
 *
 *
 *
 */

stage.register("Container", function(){


	



	/*
 	 *
 	 *	CONTAINER CLASS
 	 *
 	 */
	var ISDefined = function(ele){
		if (ele !== null && ele !== undefined )
			return true
		return false;
	}

	var parseParameterString = function(str, value){
		switch( stage.typeOf(str) ){
			case "string" :
				return arguments.callee.call(this,str.split(".") , value);
			break;
			case "array" :
				switch(str.length){
					case 1 :
						var ns = Array.prototype.shift.call(str);
						if ( ! this[ns] ){
							this[ns] = value;
						}else{
							if ( ISDefined(value) ){
								this[ns] = value;
							}else{
								return this[ns];
							}
						}
						return value ;
					break;
					default :
						var ns = Array.prototype.shift.call(str);
						if ( ! this[ns] && ISDefined(value) ){
							this[ns] = {};
						}
						return arguments.callee.call(this[ns], str, value);	
				}
			break;
			default:
				return false;
		}
	};

	var Container = function(){
		this.protoService = function(){};
		this.protoParameters = function(){};
		this.scope = {};
		this.services = new this.protoService();
		this.parameters = new this.protoParameters();
	};
	

	Container.prototype.logger = function(pci, severity, msgid,  msg){
		var syslog = this.get("syslog");
		if (! msgid) msgid = "CONTAINER SERVICES ";
		return syslog.logger(pci, severity, msgid,  msg);
	};

	Container.prototype.set = function(name, object){
		return this.protoService.prototype[name] = object;
	};

	Container.prototype.get = function(name){
		if (name in this.services){
			return this.services[name];
		}
		return null;
		//this.logger("GET : " + name+" don't exist", "WARNING");	
	};

	Container.prototype.has = function(name){
		return this.services[name];
	};

	Container.prototype.addScope = function(name){
		return  this.scope[name] = [];
	}

	Container.prototype.enterScope = function(name){
		var sc = new Scope(name, this)
		var index = this.scope[name].push( sc );
		sc.index = index;
		return sc;
	}

	Container.prototype.leaveScope = function(scope){
    		var sc = this.scope[scope.name].splice(scope.index-1, 1);
    		//delete scope;
		return sc[0].parent;
	};


	Container.prototype.setParameters = function(name, str){
		if (typeof name !== "string"){
			this.logger(new Error("setParameters : container parameter name must be a string"));
			return false;
		}
		if ( ! ISDefined(str) ){
			this.logger(new Error("setParameters : "+name+" container parameter value must be define"));
			return false;
		}
		if ( parseParameterString.call(this.protoParameters.prototype, name, str) === str ){
			return str;
		}else{
			this.logger(new Error("container parameter "+ name+" parse error"));
			return false;
		}
	};

	Container.prototype.getParameters = function(name){
		if (typeof name !== "string"){
			this.logger(new Error("container parameter name must be a string"));
			return false;
		}
		//return parseParameterString.call(this.protoParameters.prototype, name, null);  
		return parseParameterString.call(this.parameters, name, null);  
	};



	/*
 	 *
 	 *	SCOPE CLASS
 	 *
 	 */

	var Scope = function(name, parent){
    		this.name = name;
		this.parent = parent;
    		this.mother = this.$super;
    		this.mother.constructor();
    		this.services = new parent.protoService();
    		this.parameters = new parent.protoParameters();
    		this.scope = parent.scope;
	}.herite(Container);

	Scope.prototype.set = function(name, obj){
    		this.services[name] = obj ;
    		return this.mother.set(name, obj);
	};

	Scope.prototype.setParameters = function(name, str){
		if ( parseParameterString.call(this.parameters, name, str) === str ){
			return this.mother.setParameters(name, str);
		}else{
			this.logger(new Error("container parameter "+ name+" parse error"));
			return false;
		}
	};

	Scope.prototype.leaveScope = function(name){
    		this.mother.leaveScope(this)
	};


	return Container;
});
stage.register("router",function(){
		
		

	var decode = function(str) {
		try {
			return decodeURIComponent(str);
		} catch(err) {
			return str;
		}
	};


	var Route = function(id, path, defaultParams){
		this.id = id ;
		this.path = path;
		this.template = null;	
		this.controller =null;
		this.defaults =  defaultParams;
		this.variables = [];
		this.pattern = this.compile();
	};

	Route.prototype.compile = function(){
		var pattern = this.path.replace(/(\/)?(\.)?\{([^}]+)\}(?:\(([^)]*)\))?(\?)?/g, function(match, slash, dot, key, capture, opt, offset) {
			var incl = (this.path[match.length+offset] || '/') === '/';
			this.variables.push(key);
			return (incl ? '(?:' : '')+(slash || '')+(incl ? '' : '(?:')+(dot || '')+'('+(capture || '[^/]+')+'))'+(opt || '');
		}.bind(this));
		pattern = pattern.replace(/([\/.])/g, '\\$1').replace(/\*/g, '(.+)');
		this.pattern = new RegExp('^'+pattern+'[\\/]?$', 'i');
		return this.pattern ;	
	};

	Route.prototype.match = function(url){
		var res = url.match(this.pattern);
		//console.log(res)
		if (!res) {
			return res;
		}
		var map = [];
		var tab = res.slice(1) ;
		for (var i = 0 ; i<tab.length; i++){
			var k = this.variables[i] || 'wildcard';
			var param = tab[i] && decode(tab[i]);
			//var index = map.push( map[k] ? [].concat(map[k]).concat(param) : param );
			var index = map.push( param )
			map[k] = map[index-1] ;

		}
		/*res.slice(1).forEach(function(param, i) {
			var k = this.variables[i] || 'wildcard';
			param = param && decode(param);
			//var index = map.push( map[k] ? [].concat(map[k]).concat(param) : param );
			var index = map.push( param )
			map[k] = map[index-1] ;
		}.bind(this));*/
		if ( map && map.wildcard) {
			map['*'] = map.wildcard;
		}
		return map;
	};


	var Resolver = function(container){
		this.container = container;
		this.resolve = false;
		this.kernel = this.container.get("kernel");
		this.defaultAction = null;
		this.defaultView = null;
		this.variables = new Array();
		this.router = this.container.get("router")
		this.browser = this.container.get("browser")
		//this.notificationsCenter = this.container.get("notificationsCenter") ;
	
	};

	Resolver.prototype.match = function(route, url){
		var match = route.match(url); 
		if ( match ){
			this.variables = match;
			this.url = url;
			this.route = route;
			this.parsePathernController(route.defaults.controller)
		}		
		return match;
	};


	var regModuleName = /^(.*)Module[\.js]{0,3}$/;
	Resolver.prototype.getModuleName = function(str){
		var ret = regModuleName.exec(str);
		if (ret)
			return  ret[1] ;
		else
			throw "BAD MODULE PATTERN ";
	};

	Resolver.prototype.getController = function(name){
		return this.module.controllers[name+"Controller"];
	};

	Resolver.prototype.getAction = function(name){
		var ele = name+"Action" ;
		if ( ele in this.controller ){
			return this.controller[ele]
		}
		return null;
	};

	Resolver.prototype.getDefaultView = function(controller, action){
		var res = this.module.name+"Module"+":"+controller+":"+action+".html.twig";
		return res ; 
	};


	Resolver.prototype.parsePathernController = function(pattern){
		if (typeof pattern !== "string"){
			throw new Error("Resolver : pattern : "+pattern +" MUST be a string");	
		}
		this.route = this.router.getRouteByPattern(pattern);
		var tab = pattern.split(":")
		try {
			this.module = this.kernel.getModule( this.getModuleName(tab[0]) );
		}catch(e){
			throw new Error("Resolver pattern error module :  " + pattern + " : " +e );
		}
		if ( this.module ){
			this.controller = this.getController(tab[1]);
			if ( this.controller ){
				if (tab[2]){
					this.action = this.getAction(tab[2]);
					if (! this.action ){
						throw new Error("Resolver :In CONTROLLER: "+ tab[1] +" ACTION  :"+tab[2] + " not exist");
					}
				}else{
					this.action = null;	
				}
			}else{
				throw new Error("Resolver :controller not exist :"+tab[1] );
			}
			this.defaultView = this.getDefaultView(tab[1], tab[2] );
			this.resolve = true;
		}else{
			//this.logger("Resolver : not exist :"+tab[0] , "ERROR")
			throw new Error("Resolver : module not exist :"+tab[0] );
		}
	};
	
	Resolver.prototype.callController = function(arg){
		try{
			var ret = this.action.apply(this.controller, arg || [])	
		}catch(e){
			this.controller.logger.call(this.controller, e, "ERROR");	
			throw e;
		}
		return ret;
	};



	/*
	 *	ROUTER
	 */

	var cacheState = function(){
		var cacheState = window.history.state === undefined ? null : window.history.state;	
		return cacheState ;
	}

	var nativeHistory = !!(window.history && window.history.pushState );

	var service = function(kernel, container){
		this.kernel = kernel ;
		this.container = container ;
		this.notificationsCenter = this.container.get("notificationsCenter");
		this.syslog = kernel.syslog ;	
		this.routes = {};
		this.routePattern = {};
		this.location = this.get("location");
		this.browser = this.get("browser");

		/*
 		 * Extend Twig js	
 		 */
		window.Twig.extendFunction("path", function(name, variables, host){
			try {
				if (host){
					return  this.generateUrl.apply(this, arguments);	
				}else{
					var generatedPath = this.generateUrl.apply(this, arguments);
					return generatedPath?"#"+generatedPath:"";
				}
			}catch(e){
				this.logger(e.error)
				throw e.error
			}
		}.bind(this));

		this.notificationsCenter.listen(this,"onUrlChange" , function(url, lastUrl, absUrl ,cache){
			try{
				var res = this.resolve(url);
				if(! res.resolve ){
					this.forward("appModule:app:404");
					return ;
				}
				var last = this.resolveRoute(lastUrl) 
				if (last){
					this.notificationsCenter.fire("onRouteChange",{id:res.route.id, route:res.route, args:res.variables} ,{id:last.route.id, route:last.route, args:last.variables});
				}
			}catch (e){
				this.logger(e, "ERROR");
			}
		});
	};

	service.prototype.createRoute = function(id, path, defaultParams){
		if (id in this.routes ){
			this.logger("CREATE ROUTE : "+ id + "Already exist ", "ERROR");	
		}
		var route  = new Route(id, path, defaultParams);
		this.routes[id] = route;
		this.routePattern[this.routes[id].defaults.controller] = {
			route:this.routes[id],
 		        path:path	
		}
		this.logger("CREATE ROUTE : "+ id, "DEBUG");
		return route ;
	};

	service.prototype.getRoute = function(name){
		if (this.routes[name])
			return this.routes[name];
		return null;
	};



	service.prototype.resolveRoute = function(url){
		var resolver = new Resolver(this.container);
		var res = [];
		for (var routes in this.routes){
			var route = this.routes[routes];
			try {
				res = resolver.match(route, url);
				if (res){
					return resolver ; 
				}
			}catch(e){
				continue ;
			}
		}
		return null;
	};
	
	var regSerch = /(.*)\?.*$/;
	service.prototype.resolve = function(url){
		//console.log("RESOLVE " +url)
		//console.log(regSerch.exec(url) );
		var test = regSerch.exec(url) ;
		if ( test )
			url = test[1] ;
		var resolver = new Resolver(this.container);
		var res = [];
		for (var routes in this.routes){
			var route = this.routes[routes];
			try {
				res = resolver.match(route, url);
				if (res){
					this.notificationsCenter.fire("onBeforeAction", url, resolver );
					var ret = resolver.callController( res)
					this.notificationsCenter.fire("onAfterAction", url, resolver, ret );
					break;
				}
			}catch(e){
				this.logger("RESOLVE URL : "+ url + " " + e,"ERROR")
				this.forward("appModule:app:500", [e]);
			}
		}
		return resolver;
	};

	service.prototype.getRouteByPattern = function(pattern, args){
		//console.log(pattern)
		//console.log(this.routePattern)
		if (pattern in this.routePattern){
			//console.log("FIND")
			var route = this.routePattern[pattern].route ;
			return route;
		}
			//console.log("NOT FIND")
		return null;
	};

	service.prototype.resolvePattern = function(pattern){
		var resolver = new Resolver(this.container);	
		var route = resolver.parsePathernController(pattern);
		return resolver;
	};

	service.prototype.forward = function(pattern, args){
		var resolver = this.resolvePattern(pattern);
		if (resolver.resolve){
			try {
				if (resolver.route){
					this.logger("FORWARD PATTERN : "+ pattern + "  FIND ROUTE ==> REDIRECT ","DEBUG")
					this.redirect(resolver.route.path);
					//this.location.url(resolver.route.path);
					//this.logger("FORWARD PATTERN : "+ pattern + " find ROUTE : "+resolver.route.path +" redirect to URL :" + this.location.absUrl(),"DEBUG")
					//this.browser.url(this.location.absUrl(), true);
				}else{
					this.logger("FORWARD PATTERN : "+ pattern + "  NO ROUTE FIND  ==> CALL CONTROLLER"  , "DEBUG")
					var ret = resolver.callController(args);	
				}
			}catch(e){
				this.logger("FORWARD "+ pattern +" CALL CONTROLER  "+ resolver.controller.name +" : "+e,"ERROR")
				this.forward("appModule:app:500", [e]);
			}
		}else{
			this.logger("Router Can't resolve : "+pattern ,"ERROR");
		}
		return false;	
	};
	
	service.prototype.redirect = function(url){
		this.location.url(url);
		this.logger("REDIRECT URL : "+ url  +" BROWSER  URL :" + this.location.absUrl(),"DEBUG")
		this.browser.url(this.location.absUrl() , true);
	};
		
	service.prototype.generateUrl = function(name, variables, host){
		var route =  this.getRoute(name) ;
		if (! route ){
			this.logger("no route to host  :"+ name, "WARNING")
			//throw {error:"no route to host  "+ name};
			return null ; 
		}
		var path = route.path;
		if ( route.variables.length ){
			if (! variables  ){
				var txt = "";
				for (var i= 0 ; i < route.variables.length ;i++ ){
					txt += "{"+route.variables[i]+"} ";
				}
				this.logger("router generate path route '"+ name + "' must have variable "+ txt, "ERROR")
				return null;
			}
			for (var ele in variables ){
				if (ele === "_keys") continue ;
				var index = route.variables.indexOf(ele);
				if ( index >= 0 ){
					path = path.replace("{"+ele+"}",  variables[ele]);
				}else{
					this.logger("router generate path route '"+ name + "' don't  have variable "+ ele, "WARNING")
					return null;
				}	
			}	
		}
		if (host)
			return host+"#"+path ;
		return path ;
	};


	service.prototype.logger = function(pci, severity, msgid,  msg){
		if (! msgid) msgid = "ROUTER "
		return this.syslog.logger(pci, severity, msgid,  msg);
	};

	service.prototype.listen = function(){
		return this.notificationsCenter.listen.apply(this.notificationsCenter, arguments);
	};

	service.prototype.fire = function(){
		return this.notificationsCenter.fire.apply(this.notificationsCenter, arguments);
	
	};

	
	service.prototype.set = function(name, value){
		return this.container.set(name, value);	
	};

	service.prototype.get = function(name, value){
		return this.container.get(name, value);	
	};

		
	service.prototype.setParameters =function(name, value){
		return this.container.setParameters(name, value);	
	};

	service.prototype.getParameters = function(name){
		return this.container.getParameters
	};

	return service;		
		
});
/*
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

stage.register("Controller",function(){


	var Controller = function(container, module){

		this.notificationsCenter = this.get("notificationsCenter");
		this.kernel = this.get("kernel");	
		this.i18n = this.kernel.i18n;
		this.router = this.kernel.router;
	};

	Controller.prototype.redirect = function(url){
		return this.router.redirect.apply(this.router, arguments)
	};

	/*
	 *
	 *
	 */
	Controller.prototype.forward = function(pattern, args){
		return this.router.forward(pattern, args)
	};

	/*
	 *
	 *
	 */
	Controller.prototype.generateUrl = function(name, variables, absolute){
		if (absolute === true){
			var url = this.router.url().split("#");
			absolute = this.router.url[0];
		}
		return this.router.generateUrl.apply(this.router, arguments);
	};

	Controller.prototype.evalInContext = function(js, context){
		var func = function(context) { 
			var $controller = context;
			return function(js){
				"use strict";
				return eval(js);
			}
		}(this);
		try {
			return func.call( context || this , jQuery.trim( js ));
		}catch(e){
			this.logger("DOM PARSER TWIG ERROR " + e, "ERROR");	
		}
	};


	var tabFxEvent = ["stage-click", "stage-dblclick", "stage-focus", "stage-blur", "stage-mouseover", "stage-mouseout", "stage-mouseenter", "stage-mouseleave", "stage-change"];
	Controller.prototype.domParser = function(domElement){
		var controller = this ;
		domElement.find('[' + tabFxEvent.join('],[') + ']').each(function(index, ele){
			
			var attributes = ele.attributes;
			var jElement = $(ele);
			var ctrl = jElement.closest('[stage-ctrl]');
			if(ctrl.length){
				var pattern = $(ctrl).attr("stage-ctrl") ;
				try {
					var scope = controller.router.resolvePattern(pattern).controller;
				}catch (e){
					controller.logger("DOM PARSER ERROR : " + e , "ERROR")
					return ;
				}
			} else {
				var scope = controller;
			}
			for(var i = 0; i < attributes.length; i++){
				var attribute = attributes[i];
				if(tabFxEvent.indexOf(attribute.name) > -1){
					var ff = function(){
						var content = attribute.value;
						jElement.on(attribute.name.replace('stage-', ''), function(){
							scope.evalInContext(content, this);
						});
					}();
				}
			}
		});
		
	};



	/*
	 *
	 *
	 */
	Controller.prototype.render = function(element, partial, type){
		var ele = $(element);
		try {
			switch (type){
				case "append":
					ele.append(partial) ;
				break;
				case "prepend":
					ele.prepend(partial) ;
				break;
				default:
					ele.empty();
					ele.html(partial);

			}
			return this.domParser(ele);
		}catch(e){
			this.logger("DOM PARSER TWIG ERROR : "+e, "ERROR") ;
		}

	};


	Controller.prototype.renderPartial = function(pattern, obj){
		try {
			var template = this.module.getTemplatePattern(pattern);
			return template.render(obj);
		}catch(e){
			this.logger(e, "ERROR")
		}
	};

	Controller.prototype.set = function(name, value){
		return this.container.set(name, value);	
	};

	Controller.prototype.get = function(name, value){
		return this.container.get(name, value);	
	};

		
	Controller.prototype.setParameters =function(name, value){
		return this.container.setParameters(name, value);	
	};

	Controller.prototype.getParameters = function(name){
		return this.container.getParameters(name);	
	};


	Controller.prototype.logger = function(pci, severity, msgid,  msg){
		var syslog = this.get("syslog");
		if (! msgid) msgid = "MODULE: " +this.module.name +" CONTROLLER: "+this.name ;
		return syslog.logger(pci, severity, msgid,  msg);
	};


	Controller.prototype.listen = function(){
		return this.notificationsCenter.listen.apply(this.notificationsCenter, arguments);
	}

	Controller.prototype.fire = function(event){
		return this.notificationsCenter.fire.apply(this.notificationsCenter, arguments);
	};



	return Controller

});



/*
 *
 *
 */

stage.register("Module" , function(){

	var modelModule = function(config){
		this.rootName = "module";
		var documentXml = this.parser(config);		
		//this.name = this.config.name["@short"];
		this.name = documentXml.module['@id'];
	};

	modelModule.prototype.parser = function(ele){
		switch ( stage.typeOf(ele) ){
			case "document" :
				var res  = stage.xml.parseXml(ele) ; 
			break;
			case "object" :	
				res = ele ;
			break;
		}
		if ( !  res[ this.rootName ])
			throw new Error ("BAD MODULE CONFIG ");
		this.config = res[ this.rootName ] ; 
		return res;
	};

	modelModule.prototype.registerScript = function( src){
		this.autoloader.load( src, function(error, transport){
			if (error){
				this.logger(error, "ERROR");
 			       	return ;
			}
			this.logger("LOAD SCRIPT : "+src ,"DEBUG");
		}.bind(this));
	};

	modelModule.prototype.registerStyle = function( src){
		//this.kernel.autoloader.load( src, function(error, transport){
		this.autoloader.load( src, function(error, transport){
			if (error){
				this.logger(error, "ERROR");
 			       	return ;
			}
			this.logger("LOAD STYLE : "+src ,"DEBUG");
		}.bind(this));
	};
	
	modelModule.prototype.cacheFont = function( src){
		$.ajax({
			async: false,
			cache: true,
			url: src,
			beforeSend: function ( xhr ) {
				xhr.overrideMimeType("application/octet-stream");
			},
			success: function(){
				this.logger("LOAD FONT : " + src, "DEBUG");
			}.bind(this),
			error: function(){
				this.logger(src + " : " + message, "ERROR");
			}.bind(this)
		})
	};

	var urlParser = function(container, url, name, template, obj){
  		var index = url.indexOf("views") ;
  		if (index < 0 ){
    			var text = "URL TEMPLATE BAD PATH :" + url ;
    			this.logger(text ,"ERROR")
    			throw new Error(text) ;
  		}
  		var res = url.slice(index+"views".length+1).split("/");
  		res.pop();
  		if (res.length){
    			var obj = container ;
    			for (var i = 0; i<res.length;i++){
      				if ( obj[res[i]] ){
        				if (i !== res.length-1){	
        					obj = obj[res[i]] ;
        				}else{
          					obj[res[i]][name] = template;
        				}
      				}else{
        				if (i !== res.length-1){
        					obj[res[i]] = {};	
        					obj = obj[res[i]] ;
        				}else{
          					obj[res[i]] = {};
          					obj[res[i]][name] = template;
        				}
      				}
    			}
  		}else{
    			container[name] = template ;
  		}
	};

	modelModule.prototype.registerTemplate = function(name, src, type){
		//console.log("NAME :" + name)
		switch(type){
			case "application/twig":
				//var obj = urlParser.call(this, this.templates, src, name);
				this.twig({
					id: this.name+":"+name,
					href: src,
					async: false,
					//debug:true,
					load:function(template){
						urlParser.call(this, this.templates, src, name , template )
						this.logger("LOAD TEMPLATE : "+name +" ==>"+src ,"DEBUG");
						//console.log(this.templates)
						//obj[name] = template;
						//console.log(template.extend)
						//this.templateEngine
					}.bind(this),
					error:function(xrh, status, message){
						this.logger("TEMPLATE :" + src + " : "+ message, "ERROR")
					}.bind(this)
				});
			break;
			case "text/html":
			break;
			case "application/xml":
			case "text/xml":
			break;
			case "template":
				var obj = urlParser.call(this, this.templates, src.url, name, src);
				//obj[name] = src;
				this.logger("LOAD IMPORT TEMPLATE : "+name +" ==>"+src.url ,"DEBUG");
			break;
			default :
				arguments.callee.call(this, name, src, "application/twig" );
			break
		}
	};

	modelModule.prototype.registerView = function(name, src, type){
		switch(type){
			case "text/javascript":
			case "application/javascript":
				this.autoloader.load( src, function(error, transport){
					if (error){
						this.logger(error, "ERROR");
						return ;
					}
					//this.views[name] = new ;
					var Class = stage.views[name];
					this.views[name] = new Class(this.container, this);
					this.logger("LOAD VIEW : "+src ,"DEBUG");
				}.bind(this));
			break;
			default:
		}
	};

	modelModule.prototype.registerController = function(name, src){
		this.autoloader.load( src, function(error, transport){
			if (error){
				this.logger(error, "ERROR")
				throw error;
			}
			this.logger("LOAD CONTROLLER : "+name +" ==>"+src ,"DEBUG");
			var Class = stage.controllers[name].herite(stage.Controller);
			Class.prototype.container = this.container ;
			Class.prototype.name = name ;
			Class.prototype.module = this ;
			this.controllers[name] = new Class(this.container, this);
		}.bind(this))	
	};
	
	modelModule.prototype.initialiseRest = function(name, url, optionsGlobal){
		var rest = this.kernel.restService ;
		var ele = rest.addApi(name, url, optionsGlobal);
		this.kernel.set(name, ele);
	};

	var regI18n = new RegExp("^(.*)\.(.._..)\.(.*)$");
	modelModule.prototype.registerTranslation = function(src, type){
		var service = this.get("i18n");
		if (! service){
			this.logger("SERVICE I18N not loaded abort load Translation : "+src,"WARNING");
			return ;
		}
		$.ajax({
			url:src,
			async:false,
			success:function(data, status, xhr){
				var name = stage.basename(src) ;
				this.logger("LOAD TRANSLATION "+ type +" : "+name +" URL = "+src ,"DEBUG");
				var res = regI18n.exec(name);	
				if ( ! res ){
					this.logger("SERVICE I18N  abort load Translation : "+src+ " Bad File name format","WARNING");
					return;
				}
				var domain = res[1];
				var locale = res[2];
				service.registerI18n(name, locale, domain, data);
			}.bind(this),
			dataType: type || "json",
			error:function(xhr, status, err){
				this.logger(err, "ERROR")
			}.bind(this)	
		})	
	};

	modelModule.prototype.reader = function(){
		
		var root = this.config;
		for (var node in this.config){
			
			switch ( node ){
				case "content" :
				break;
				case "controllers":
					
					var controllers = root[node].controller;
					if(controllers){
						var tab = stage.typeOf(controllers) === "object" ? [controllers] : controllers ;
						for (var i = 0 ; i < tab.length ; i++){
							var name = tab[i]["@name"];
							var src = tab[i]["@src"];
							this.registerController(name, src)
						}
					}
					
				break;
				case "views":
					var views = root[node].view;
					if(views){
						var tab = stage.typeOf(views) === "object" ? [views] : views ;
						for (var i = 0 ; i < tab.length ; i++){
							var name = tab[i]["@name"];
							var src = tab[i]["@src"];
							var type = tab[i]["@type"];
							this.registerView(name, src, type);
						}
					}
					
				break;
				case "modules":
					var modules = root[node].module;
					if(modules){
						var tab = stage.typeOf(modules) === "object" ? [modules] : modules ;
						for (var i = 0 ; i < tab.length ; i++){
							//var name = tab[i]["@name"];
							var url = tab[i]["@href"];
							if ( ! this.isDomReady){
								this.kernel.listen(this,"onBoot",function(url){
									this.kernel.loadModule(url, {
										async:false
									});
								}.bind(this, url))
							}else{
								this.kernel.loadModule(url);
							}
						}
					}
					
				break;
				case "templates":
					var templates = root[node].template;
					if(templates){
						var tab = stage.typeOf(templates) === "object" ? [templates] : templates ;
						for (var i = 0 ; i < tab.length ; i++){
							var name = tab[i]["@name"];
							
							var src = tab[i]["@src"];
							var type = tab[i]["@type"];
							if ( ! name){
								name = this.getTemplateName(src)	
							}
							this.registerTemplate(name, src, type);
						}
					}
						
				break;
				case "styles":
					var styles = root[node].style;
					if(styles){
						var tab = stage.typeOf(styles) === "object" ? [styles] : styles ;
						for (var i = 0 ; i < tab.length ; i++){
							var src = tab[i]["@src"];
							this.registerStyle(src);
						}
					}
					
				break;
				case "scripts":
					var scripts = root[node].script;
					if(scripts){
						var tab = stage.typeOf(scripts) === "object" ? [scripts] : scripts ;
						for (var i = 0 ; i < tab.length ; i++){
							var src = tab[i]["@src"];
							this.registerScript(src);
						}
					}
					
				break;
				case "fonts":
					var fonts = root[node].font;
					if(fonts){
						var tab = stage.typeOf(fonts) === "object" ? [fonts] : fonts ;
						for (var i = 0 ; i < tab.length ; i++){
							var src = tab[i]["@src"];
							this.cacheFont(src);
						}
					}
					
				break;
				case "translations":
					var translations = root[node].translation;
					if(translations){
						var tab = stage.typeOf(translations) === "object" ? [translations] : translations ;
						for (var i = 0 ; i < tab.length ; i++){
							var src = tab[i]["@src"];
							var type = tab[i]["@type"];
							this.registerTranslation(src, type );
						}
					}
					
				break;
				case "icon" :
					this.icon = root[node]["@src"];
				break;
				/*case "name" :
					console.log(root[node])
					this.name = root[node]["@short"];
				break;*/
				case "preference":
				break;
				case "author":
					var author = root[node];
					this.author = author["#text"];
					this.emailAuthor = author["@email"];
					this.authorLink = author["@href"];
				break;
				case "description":
					this.description = root[node];
					break;
				case "api":
					//console.log(root[node]);
					for(var ele in root[node]){
						var mvc = root[node][ele];
						var tab = stage.typeOf(mvc) === "object" ? [mvc] : mvc;
						for(var i = 0; i < tab.length; i++){
							if(ele === "rest"){
								if( this.kernel.restService )
									this.initialiseRest(tab[i]["@name"], tab[i]["@url"]);
								else
									this.logger("Api " + ele + " SERVICE REST NOT FOUND" ,"ERROR")
							} else {
								this.logger("Api " + ele + " not exist for modules" ,"ERROR");
							}
						}
					}
					break;
				break;
				case "routes":
					var routes = root[node].route;
					switch(stage.typeOf( routes)){
						case "array":
							for (var i = 0 ;i<routes.length; i++){
								var id = routes[i]["@id"];
								var path = routes[i]["@path"];
								var defaultParam = {};
								switch(stage.typeOf( routes[i]["default"])){
									case "array":
										for (var j=0 ;j<routes[i]["default"].length;j++){
											defaultParam[routes[i]["default"][j]["@key"]] =  routes[i]["default"][j]["#text"];
											//console.log(defaultParam)
										}
									break;
									case "object":
										if (routes[i]["default"]["@key"])
											defaultParam[routes[i]["default"]["@key"]] = routes[i]["default"]["#text"];
									break;
								}
								this.routes[id] = this.router.createRoute(id, path, defaultParam);	

							}
						break;
						case "object":
							for (var route in routes){
								switch (route){
									case "@id":
										var id = routes[route];
									break;
									case "@path":
										var path = routes[route];
									break;
									case "default":
										var defaultParam = {};
										switch(stage.typeOf( routes[route] )){
											case "array":
												for (var j=0 ;j<routes[route].length;j++){
													defaultParam[routes[route][j]["@key"]] =  routes[route][j]["#text"];
												}
											break;
											case "object":
												defaultParam[routes[route]["@key"]] = routes[route]["#text"]
											break;
										}
									break;
								}
							}
							this.routes[id] = this.router.createRoute(id, path, defaultParam);
						break
					}
				break;
			}
		}
	};

	var Module = function(kernel, config, settings){

		this.kernel = kernel;
		this.container = kernel.container;
		this.syslog = this.get("syslog");
		this.logger("REGISTER MODULE "+this.name, "DEBUG");
		this.autoloader = new stage.autoload(this, {
			transport:"script"
		});
		this.views = {};
		this.controllers = {};
		this.templates = {};
		this.routes = {};

		this.twig = this.get("twig");
		
		this.model = this.$super ;
		this.model.constructor(config);
		this.setParameters("module."+this.name, this.config);
		this.set(this.name, this);
		this.boot(settings);

	}.herite(modelModule);

	Module.prototype.getController = function(name){
		return this.controllers[name];
	};

	Module.prototype.getTemplate = function(name){
		return this.templates[name];
	};

	Module.prototype.getTemplateName = function(url){
		var name = stage.basename(url);
		var index = name.indexOf(".");
		if (index < 0)
			return url;
		return name.slice(0, name.indexOf(".") );
	};

	var regPattern = /(.*)Module:(.*):(.*)$/;
	Module.prototype.getTemplatePattern = function(pattern){
		var res  = regPattern.exec(pattern);
		if ( ! res ){
			var txt = "IN PATTERN :" + pattern +" BAD FORMAT " ;
			this.logger(txt,"ERROR")
			throw new Error(txt);
		}
		var moduleName = res[1];
		var pathName = res[2];
		var templateName = res[3];	
		var module = this.kernel.getModule(moduleName);
		if ( ! module ){
			var txt = "IN PATTERN :" + pattern +" MODULE :"+ moduleName +" not defined" ;
			this.logger(txt,"ERROR")
			throw new Error(txt);
		}
		var obj = module.templates ;
		if (pathName !== ""){
			var tab = pathName.split("/");
			for (var i = 0 ; i<tab.length ; i++){
				if (tab[i]){
					if (tab[i] in obj){
						obj = obj[tab[i]];
					}else{
						var txt = "IN PATTERN :" + pattern +" pathName :"+ pathName +" not defined" ;
						this.logger(txt,"ERROR")
						throw new Error(txt);
					}
				}
			}
		}
		if (templateName !== "" ){
			var name = this.getTemplateName(templateName);
			if (obj[name]){
				return obj[name];
			}else{
				var txt = "IN PATTERN :" + pattern +" MODULE :"+ moduleName +"  template : "+ templateName +" not defined" ;
				this.logger(txt,"ERROR")
				throw new Error(txt);	
			}
		}else{
			if (obj["index"]){
				return obj["index"];
			}else{
				var txt = "IN PATTERN :" + pattern +" MODULE :"+ moduleName +" default template not defined" ;
				this.logger(txt,"ERROR")
				throw new Error(txt);	
			}
		}
	};

	Module.prototype.getView = function(name){
		return this.views[name];
	};

	Module.prototype.boot = function(settings){
		this.logger("BOOT "+ this.name , "DEBUG");
		this.container = this.kernel.container.enterScope(this.name);
		this.notificationsCenter = stage.notificationsCenter.create(settings,this);
		this.set("notificationsCenter", this.notificationsCenter);
		this.router = this.kernel.router ;

		try {
			this.fire("onBoot", this);	
			this.reader();
			this.fire("onReady",this);
		}catch (e){
			this.logger("MODULE : "+ this.name +"  "+e, "ERROR");
			throw e;
		}
	};

	Module.prototype.listen = function(){
		return this.notificationsCenter.listen.apply(this.notificationsCenter, arguments);
	};

	Module.prototype.fire = function(event){
		this.logger(event+" : "+ this.name , "DEBUG", "EVENT MODULE")
		return this.notificationsCenter.fire.apply(this.notificationsCenter, arguments);
	};

	Module.prototype.logger = function(pci, severity, msgid,  msg){
		if (! msgid) msgid = "MODULE  "+this.name;
			return this.syslog.logger(pci, severity, msgid,  msg);	
	};

	/**
	 *	@method get
	 *	@param {String} name of service
         */
	Module.prototype.get = function(name){
		return this.container.get(name);
	};

	/**
	 *	@method set
	 *	@param {String} name of service
	 *	@param {Object} instance of service
         */
	Module.prototype.set = function(name, obj){
		return this.container.set(name, obj);
	};

	Module.prototype.setParameters =function(name, value){
		return this.container.setParameters(name, value);	
	};

	Module.prototype.getParameters = function(name){
		return this.container.getParameters(name);	
	};


	return Module;	
		
})
stage.register("i18n",function(){

	var translate = {};


	var translateDispo = {
		fr_FR:"français",
		en_EN:"english"
	};

	var regNavLang = /(..)-?.*/;

	var service = function(kernel, container){
		this.container = container;	
		this.syslog = this.container.get("syslog");
		this.logger("INITIALIZE I18N SERVICE", "DEBUG");
		this.kernel = kernel ;

		this.container.setParameters("translate", translate);
		this.defaultDomain = this.trans_default_domain();
		var locale = navigator.language || navigator.userLanguage ;
		var res = regNavLang.exec(locale);
		if (res){
			locale = res[1]
			this.defaultLocale  = locale+"_"+locale.toUpperCase();
			translate[this.defaultLocale] = {};
		}else{
			this.defaultLocale = "fr_FR";	
		}

		this.kernel.listen(this, "onBoot",function(){
			this.boot();
		}.bind(this))	
	};

	service.prototype.logger = function(pci, severity, msgid,  msg){
		if (! msgid) msgid = "SERVICE I18N "
		return this.syslog.logger(pci, severity, msgid,  msg);
	};


	

	service.prototype.boot = function(){
		//GET APP locale
		if ( this.container.getParameters("module.app") )
			this.defaultLocale = this.container.getParameters("module.app").locale;

		if  ( ! translate[this.defaultLocale])
			translate[this.defaultLocale] = {};

		this.logger("DEFAULT LOCALE APPLICATION ==> " + this.defaultLocale ,"DEBUG");
		//this.logger("//FIXME LOCALE getLang in controller etc ..." ,"WARNING");
		if (window.Twig){
			window.Twig.extendFunction("getLangs", this.getLangs.bind(this));
			window.Twig.extendFunction("trans_default_domain", this.trans_default_domain.bind(this));
			window.Twig.extendFilter("trans", this.translation.bind(this));
			window.Twig.extendFunction("trans", this.translation.bind(this));
			window.Twig.extendFilter("getLangs", this.getLangs.bind(this));
		}
	};

	service.prototype.getLangs = function(locale, data){
		var obj = [];
		for ( var ele in translateDispo){
			obj.push({
				name:translateDispo[ele],
				value:ele
			})	
		}
		return obj;
	};


	service.prototype.registerI18n = function(name, locale, domain, data){
		if ( locale ){
			if( !translate[locale] )
				translate[locale] = stage.extend(true, {}, translate[this.defaultLocale]);	
		}
		if ( domain ){
			if( !translate[locale][domain] )
				translate[locale][domain] = stage.extend(true, {}, translate[this.defaultLocale][domain]);
			stage.extend(true, translate[locale][domain], data);		
		}else{
			stage.extend(true, translate[locale], data);	
		} 
	};




	service.prototype.trans_default_domain = function(domain){
		if ( ! domain ){
			return this.defaultDomain = "messages" ; 
		}
		return this.defaultDomain = domain ;
	};

	/*
 	 *
 	 *
 	 *
 	 *
 	 */
	service.prototype.translation = function(value, args){
		
		var defaulDomain = ( args && args[1] ) ? args[1] : this.defaultDomain ;
		var str = this.container.getParameters("translate."+this.defaultLocale+"."+defaulDomain+"."+value) || value;
		if (args){
			if (args[0]){
				for (var ele in args[0]){
					str = str.replace(ele, args[0][ele])
				}
			}
		}
		return str;
	};

	return service;


});
stage.register("location",function(){


	var nativeHistory = !!(window.history && window.history.pushState );
	var PATH_MATCH = /^([^\?#]*)(\?([^#]*))?(#(.*))?$/;
	var DEFAULT_PORTS = {'http': 80, 'https': 443};



	var changeUrl = function(event){
		var cache = null ;
		var location = this.kernel.locationService ;
		var url = this.url();

		if ( ( url === this.lastUrl && url === this.location.href ) && this.lastUrl !== location.initialUrl){ 
			//console.log(" changeUrl PASS SAME")
			return;
		}

		if ( ! event ){
			this.kernel.logger(" FORCE URL CHANGE BROWER EVENT NOT FIRE" , "WARNING" );
			//console.log(location.url())
			var newUrl = location.url() ;
			this.kernel.notificationsCenter.fire("onUrlChange", newUrl , this.lastHash, url ,cache)
			this.lastUrlr= url;
			this.lastHash = newUrl ;
			return ;
		}
		//console.log("change URL :" + url +" IINIT "+location.initialUrl)
		//console.log("change LAST URL :" + this.lastUrl)
		var parse = location.parse(url);
		//console.log(location)
		if ( ! parse ){
			this.kernel.notificationsCenter.fire("onUrlChange", "", this.lastHash, url,  cache)
			this.lastUrl = "";
			this.lastHash = "";
			return ;
		}

		var newUrl = location.url() ;
		
		this.kernel.notificationsCenter.fire("onUrlChange", newUrl, this.lastHash , url ,cache)
		this.lastUrl = url;
		this.lastHash = newUrl ;
	};

	var browser = function(kernel, settings){
		this.location = window.location;
		this.history = window.History;
		this.lastUrl = this.url();
		this.kernel = 	kernel ;
		$(window).bind('hashchange', changeUrl.bind(this)); 
		//if (nativeHistory){
		//	$(window).bind('popstate', changeUrl.bind(this))
		//}
	};

	browser.prototype.url = function(options){
		if (nativeHistory && options.html5Mode){
			return function(url, replace, state){
				//TODO
				/*if (this.location !== window.location) this.location = window.location;
				if (this.history !== window.History) this.history = window.History;

				if (url){
					this.kernel.logger(replace ? "REPLACE URL : " + url : "CHANGE URL : " + url,"WARNING")
						this.history[replace ? 'replaceState' : 'pushState'](state, '', url);
				}else{
					return this.location.href.replace(/%27/g,"'");	
				}*/
			}
		}else{
			return function(url, replace, state){
				
				if (url){
				if (this.kernel && this.kernel.get("location") )

					if (this.location !== window.location) this.location = window.location;
					var same = ( url === this.lastUrl && url === this.location.href ? true : false );
					if (this.history !== window.history) this.history = window.history;
					this.kernel.logger(replace ? "REPLACE URL : " + url : "CHANGE URL : " + url,"WARNING");
					if ( same ){
						if  (  url === this.kernel.locationService.initialUrl ){
								//FORCE changeUrl 
								changeUrl.call(this)
						}
						return url ;
					}
					//console.log(url)
					if ( replace ){
						this.location.replace(url);	
						return url ;
					}
					return this.location.href = url;				
				}else{
					return this.location.href.replace(/%27/g,"'");	
				}			
			}
		}
	};


	/*
 	 *	CLASS LOCATION
 	 *
 	 */


	var serverBase = function (url) {
		return url.substring(0, url.indexOf('/', url.indexOf('//') + 2));
	};

	var beginsWith = function(begin, whole) {
  		if (whole.indexOf(begin) === 0) {
    			return whole.substr(begin.length);
  		}
	}

	var Location = function(browser, base, kernel, settings){
		this.settings = settings
		this.kernel = kernel;
		this.browser = browser ;
		this.container = this.kernel.container ;
		this.replace = false ;
		
		this.initialUrl = this.browser.url();
		this.base = base
		this.hashPrefix = "#"+this.settings.hashPrefix ;
		this.proto = this.stripFile(this.base);
		this.parseAbsoluteUrl(this.initialUrl);
		this.parse(this.initialUrl);


		// rewrite hashbang url <> html5 url
		//var abs = this.absUrl();
		//if ( abs != this.initialUrl) {
		//	this.browser.url(abs, true);
		//}
	};
	
	Location.prototype.logger = function(pci, severity, msgid,  msg){
		if (! msgid) msgid = "SERVICE LOCATION "
		return this.kernel.syslog.logger(pci, severity, msgid,  msg);
	};

	Location.prototype.listen = function(){
		return this.kernel.notificationsCenter.listen.apply(this.kernel.notificationsCenter, arguments);
	};

	Location.prototype.fire = function(){
		return this.kernel.notificationsCenter.fire.apply(this.kernel.notificationsCenter, arguments);
	
	};

	Location.prototype.set = function(name, value){
		return this.container.set(name, value);	
	};

	Location.prototype.get = function(name, value){
		return this.container.get(name, value);	
	};

	Location.prototype.absUrl = function(){
		return this._absUrl ;
	};

	Location.prototype.url = function(url){
		if (typeof url === "undefined")
			return this._url;
		var match = PATH_MATCH.exec(url);
		if (match[1]) this.path(decodeURIComponent(match[1]));
		if (match[2] || match[1]) this.search(match[3] || '');
		this.hash(match[5] || '');
	};

	Location.prototype.protocol = function(){
		return this._protocol;	
	};


	Location.prototype.host = function(){
		return this._host;	
	};

	Location.prototype.port = function(){
		return this._port ;	
	};

	Location.prototype.path = function(path){
		if (typeof path === "undefined"){
			return this._path ;
		}
		this._path = path ;
		try {
			this.change();
		}catch(e){
			this.logger(e,"ERROR");
			throw e
		}
		return this._path;
	};

	Location.prototype.search = function(search){
		if (typeof search === "undefined"){
			return this._search ;
		}
		this._search = search ;
		try {
			this.change();
		}catch(e){
			this.logger(e,"ERROR");
			throw e
		}
		return this._search;

		
	};
	
	Location.prototype.hash = function(hash){
		if (typeof hash === "undefined"){
			return this._hash ;
		}
		this._hash = hash ;
		try {
			this.change();
		}catch(e){
			this.logger(e,"ERROR");
			throw e
		}
		return this._hash;
	};	

	Location.prototype.state = function(){
	
	};

	Location.prototype.replace = function(value){
		if (value)
			return  this.replace = value ;	
		return this.replace ;
	};

	Location.prototype.encodePath = function(path) {
  		var segments = path.split('/');
      		var i = segments.length;

  		while (i--) {
    			segments[i] = stage.io.encodeUriSegment(segments[i]);
  		}

  		return segments.join('/');
	};


	Location.prototype.stripFile = function(url){
		return url.substr(0, stripHash(url).lastIndexOf('/') + 1);
	};


	var stripHash = function(url){
		var index = url.indexOf('#');
  		return index == -1 ? url : url.substr(0, index);
	};

	// parsing end URL ex : http://domain.com:port(/path)(?search)(#hash)
	Location.prototype.parseRelativeUrl = function(relativeUrl){
		//console.log("relative :" + relativeUrl)
		var prefixed = (relativeUrl.charAt(0) !== '/');
		if (prefixed) {
			relativeUrl = '/' + relativeUrl;
		}
		var resolve = stage.io.urlToOject(relativeUrl);
		//console.log(resolve)
		this._path = decodeURIComponent(prefixed && resolve.pathname.charAt(0) === '/' ?
			resolve.pathname.substring(1) : resolve.pathname);
		this._search = stage.io.parseKeyValue(resolve.search);
		this._hash = decodeURIComponent(resolve.hash);

		// make sure path starts with '/';
		if (typeof this._path !== "undefined" && this._path.charAt(0) != '/') {
			this._path = '/' + this._path;
		}
		//console.log("PATH:" + this._path)
	};

	// parsing begin URL ex : (http)://(domain.com):(port)
	Location.prototype.parseAbsoluteUrl = function(absoluteUrl){
		var resolve = stage.io.urlToOject(absoluteUrl);
  		this._protocol = resolve.protocol.replace(":", "");
  		this._host = resolve.hostname;
  		this._port = parseInt(resolve.port, 10) || DEFAULT_PORTS[this._protocol] ||null;
	};

	/**
 	 * LocationHashbangUrl represents url
 	 * This object is exposed as $location service when developer doesn't opt into html5 mode.
 	 * It also serves as the base class for html5 mode fallback on legacy browsers.
 	 *
 	 * @constructor
 	 * @param {string} appBase application base URL
 	 * @param {string} hashPrefix hashbang prefix
 	*/
	var LocationHashbangUrl= function(browser, base, kernel, settings) {
		this.mother = this.$super
		this.mother.constructor(browser, base, kernel, settings);
	}.herite(Location);

	LocationHashbangUrl.prototype.parse = function(url){
		//console.log("URL to parse LocationHashbangUrl  :" + url)
		//console.log("base : " + this.base)
		//console.log("beginsWith BASE : "+beginsWith(this.base, url))
		//console.log("beginsWith PROTO  :"+beginsWith(this.proto, url))
		var withoutBaseUrl = beginsWith(this.base, url) || beginsWith(this.proto, url);
		//console.log("withoutBaseUrl : " +withoutBaseUrl)
		var withoutHashUrl = withoutBaseUrl.charAt(0) == '#'
			? beginsWith(this.hashPrefix, withoutBaseUrl)
			: "";

    		if (typeof withoutHashUrl !== "string") {
			this.logger('Invalid url '+url+', missing hash prefix ' +this.hashPrefix , "ERROR");
      			return null; 
    		}
		//console.log("withoutHashUrl : " +withoutHashUrl)
    		this.parseRelativeUrl(withoutHashUrl);
		return this.change();
	};
	
	LocationHashbangUrl.prototype.change = function(){
		var search = stage.io.toKeyValue(this._search);
		//console.log(this._search)
		//var hash = this._hash ? '#' + stage.io.encodeUriSegment(this._hash) : '';

		var hash = this._hash ? '#' + this._hash : '';

		//console.log(this._path)
		this._url = this.encodePath(this._path) + (search ? '?' + search : '') + hash		
		//console.log(this._url)
		//var temp = (this._url ? this.hashPrefix + this._url : '').replace("//","/");
		//this._absUrl = this.base + temp;	
		//console.log( this.hashPrefix)
		//console.log( this._url)
		this._absUrl = this.base + (this._url ? "#" + this._url : '');	
		//console.log("URL :"+ this._url)
		//console.log("HASH :"+ this._hash)
		//console.log("ABSURL :"+ this._absUrl)
		//console.log("PATH :"+ this._path)
		return this;
	};


	/**
 	 * LocationHashbangInHtml5Url represents url
 	 * This object is exposed as location service when html5 history api is enabled but the browser
 	 * does not support it.
 	 *
 	 * @constructor
 	 * @param {string} appBase application base URL
 	 * @param {string} hashPrefix hashbang prefix
 	*/
	var LocationHashbangInHtml5Url = function(browser, base, kernel, settings){
	
		this.mother = this.$super
		this.mother.constructor(browser, base, kernel, settings);
	}.herite(LocationHashbangUrl);


	LocationHashbangInHtml5Url.prototype.parse = function(url){
		return this.change();
	};
	
	LocationHashbangInHtml5Url.prototype.change = function(){
		return this;
	};

	/**
 	 * LocationHtml5Url represents an url
 	 * This object is exposed as location service when HTML5 mode is enabled and supported
 	 *
 	 * @constructor
 	 * @param {string} appBase application base URL
 	 * @param {string} basePrefix url path prefix
 	*/
	var LocationHtml5Url= function(browser, base, kernel, settings) {
		this.mother = this.$super
		this.mother.constructor(browser, base, kernel, settings);
	}.herite(Location);


	LocationHtml5Url.prototype.parse = function(url){
		var pathUrl = beginsWith(this.proto, url);
		if (pathUrl){
			this.parseRelativeUrl(pathUrl);
		}
		if (! this._path)
			this._path = "/"
		return this.change();
	};
	
	LocationHtml5Url.prototype.change = function(){
		var search = stage.io.toKeyValue(this._search);
		var hash = this._hash ? '#' + stage.io.encodeUriSegment(this._hash) : '';
		this._url = this.encodePath(this._path) + (search ? '?' + search : '') + hash;
		this._absUrl = this.proto + this._url.substr(1);
		return this
	};

	/*
 	 *	SERVICE LOCATION
 	 */

	var defaultSettings = {
		html5Mode:true,
		hashPrefix:"/"
	};

	var service = function(kernel, settings){
	
		var options = $.extend(defaultSettings, settings)
			
		browser.prototype.url = browser.prototype.url(options);
		var browserService = new browser(kernel, options);
		kernel.set("browser", browserService);
		var initialUrl = browserService.url();
		var baseHref = options.base || "" ;

		if (options.html5Mode) {
			var mode = nativeHistory ? LocationHtml5Url : LocationHashbangInHtml5Url;
			var base = serverBase(initialUrl) + (baseHref || '/');
		}else{
			var mode = LocationHashbangUrl ;
			var base = stripHash(initialUrl);
		}
		
		return new mode(browserService, base, kernel, options);
	}; 
	
	return service;

});





