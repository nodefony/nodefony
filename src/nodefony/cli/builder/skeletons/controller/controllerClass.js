{% if addons.binding %}
const binding = require('../build/Release/{{shortName}}.node');
{% endif %}

{% if addons.annotations and command != "project" %}
/**
 *	@class {{controllerName}}
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 *  @Route ("/{{name}}")
 */
{% else %}
/**
 *	@class {{controllerName}}
 *	@constructor
 *	@param {class} container
 *	@param {class} context
 */
{% endif %}
class {{controllerName}} extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    // start session
    this.startSession();
  }

{% if addons.annotations %}
{% if command == "project" %}
/**
 *    @Route ("/",
 *      name="home")
 */
{% else %}
{% if  front == "react" or front == "vue"%}
/**
 *    @Route ("*",
 *      name="route-{{bundleName}}-{{name}}")
 */
{% else %}
/**
 *    @Route ("",
 *      name="route-{{bundleName}}-{{name}}")
 */
{% endif %}
{% endif %}
{% else %}
/**
 *  @see Route home in routing.js
 */
{% endif %}
  indexAction() {
{% if  front == "react" %}
      return this.renderHtmlFile(path.resolve(this.bundle.publicPath, "dist","index.html"));
{% else %}
{% if bundleName == "app" %}
    return this.render("{{bundleName}}:{{directory}}:index.html.twig", {
      name: this.kernel.projectName,
			description: this.kernel.package.description{% if addons.binding %},
      binding: binding.{{shortName}}(){% endif %}
    });
{% else %}
    return this.render("{{bundleName}}:{{directory}}:index.html.twig", {
			name: this.bundle.name,
			description: this.bundle.package.description{% if addons.binding %},
      binding: binding.{{shortName}}(){% endif %}
    });
{% endif %}

{% endif %}
  }
}

module.exports = {{controllerName}};
