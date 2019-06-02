{% if addons.binding %}
const binding = require('../build/Release/{{shortName}}.node');
{% endif %}
/**
 *	@class {{controllerName}}
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *
 */
module.exports = class {{controllerName}} extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
  }

  /**
   *  @see Route home in routing.js
   */
  indexAction() {
    return this.render("{{bundleName}}:{{directory}}:index.html.twig", {
{% if bundleName == "app" %}
      name: this.kernel.projectName,
			description: this.kernel.package.description{% if addons.binding %},
      binding: binding.{{shortName}}()
{% endif %}
{% else %}
			name: this.bundle.name,
			description: this.bundle.package.description{% if addons.binding %},
      binding: binding.{{shortName}}()
{% endif %}

{% endif %}
    });
  }

};
