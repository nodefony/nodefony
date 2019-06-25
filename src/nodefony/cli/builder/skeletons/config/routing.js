/**
 *
 * ===============================================================================
 *      ROUTING BUNDLE {{ bundleName }}
 *
 *  Copyright © {{ year }}/{{ projectYearNow }}    {{authorFullName}} | {{authorMail}}
 *
 * ===============================================================================
 *
 *        GENERATE BY {{projectName}} BUILDER
 *
 *        {{name}} ROUTING  {{ bundleName }}
 **/

{% if addons.annotations %}

  module.exports = {};

{% else %}

{% if command == "project" %}
module.exports = {
  home: {
    pattern: "/",
    defaults: {
      controller: "app:app:index"
    }
  }
};
{% else %}
module.exports = {
  {{name}}: {
    pattern: "/{{name}}",
    defaults: {
      controller: "{{ bundleName }}:default:index"
    }
  }
};
{% endif %}

{% endif %}
