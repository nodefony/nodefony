const View = class View {
  constructor(cli, builder) {
    this.cli = cli;
    this.type = builder.type;
    this.bundleType = builder.bundleType;
    this.skeletonPath = builder.skeletonPath;
    this.directory = "views";
    this.skeletonView = path.resolve(this.skeletonPath, "bundleView.skeleton");
  }

  createBuilder(location, name) {
    nodefony.extend(this.cli.response, {
      CDN_stylesheet: '{{CDN("stylesheet")}}',
      CDN_javascript: '{{CDN("javascript")}}',
      CDN_image: '{{CDN("image")}}'
    });
    this.cli.response.myview = this.generateTwig();
    return {
      name: location,
      type: "directory",
      childs: [{
        name: name,
        type: "file",
        parse: true,
        skeleton: this.skeletonView,
        params: this.cli.response
      }]
    };
  }

  generateTwig() {
    return `{% extends '/app/Resources/views/base.html.twig' %}
{% block title %}Welcome {{name}}! {% endblock %}
{% block stylesheets %}
  {{ parent() }}
  <!-- WEBPACK BUNDLE -->
  <link rel='stylesheet' href="${this.cli.response.CDN_stylesheet}/${this.cli.response.bundleName}/assets/css/${this.cli.response.name}.css" />
{% endblock %}
{% block body %}
  {% block header %}
    {{ render( controller('app:app:header' )) }}
  {% endblock %}
  <div class='container' style='margin-top:100px'>
    <div class='row'>
      <div class='col text-center'>
        <img src="${this.cli.response.CDN_image}/app/images/app-logo.png">
        <a href='#'>
          <strong style='font-size:45px'>{{name}}</strong>
        </a>
        <p class='display-4 mt-5'>{{trans('welcome')}}</p>
        <p>{{binding}}</p>
        </div>
    </div>
  </div>
  {% block footer %}
    {{ render( controller('app:app:footer' )) }}
  {% endblock %}
{% endblock %}
{% block javascripts %}
  {{ parent() }}
  <!-- WEBPACK BUNDLE -->
  <script src="${this.cli.response.CDN_javascript}/${this.cli.response.bundleName}/assets/js/${this.cli.response.name}.js"></script>
{% endblock %}"
    `;
  }
};
module.exports = View;