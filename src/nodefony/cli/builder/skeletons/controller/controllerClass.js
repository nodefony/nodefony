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
  {% if  front == "react" %}
      return this.renderHtmlFile(path.resolve(this.bundle.publicPath, "dist","index.html"));
  {% else %}
  {% if bundleName == "app" %}
    return this.render("{{bundleName}}:{{directory}}:index.html.twig", {
      name: this.kernel.projectName,
			description: this.kernel.package.description{% if addons.binding %},
      binding: binding.{{shortName}}()
    });
  {% endif %}
  {% else %}
    return this.render("{{bundleName}}:{{directory}}:index.html.twig", {
			name: this.bundle.name,
			description: this.bundle.package.description{% if addons.binding %},
      binding: binding.{{shortName}}()
    });
  {% endif %}
  {% endif %}
  {% endif %}
  }
};
