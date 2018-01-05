const View = class View {
  constructor(cli, builder) {
    this.cli = cli;
    this.type = builder.type;
    this.params = builder.params;
    this.bundleType = builder.bundleType;
    this.skeletonPath = builder.skeletonPath;
    this.directory = "views";
    this.skeletonView = path.resolve(this.skeletonPath, "bundleView.skeleton");
  }
  createBuilder(location, name) {
    nodefony.extend(this.params, {
      CDN_stylesheet: '{{CDN("stylesheet")}}',
      CDN_javascript: '{{CDN("javascript")}}',
      CDN_image: '{{CDN("image")}}'
    });
    this.params.myview = this.generateTwig();
    return {
      name: location,
      type: "directory",
      childs: [{
        name: name,
        type: "file",
        parse: true,
        skeleton: this.skeletonView,
        params: this.params
      }]
    };
  }

  generateTwig() {
    return "{% extends '/app/Resources/views/base.html.twig' %}\n\
\n\
{% block title %}Welcome {{name}}! {% endblock %}\n\
{% block stylesheets %}\n\
  {{ parent() }}\n\
  <!-- WEBPACK BUNDLE -->\n\
  <link rel='stylesheet' href='" + this.params.CDN_stylesheet + "/" + this.params.bundleName + "/assets/css/" + this.params.name + ".css' />\n\
{% endblock %}\n\
{% block body %}\n\
      <img class='displayed' src='" + this.params.CDN_image + "/frameworkBundle/images/nodefony-logo-white.png'>\n\
      <h1 class='success'>\n\
        <a href='{{url('documentation')}}'>\n\
          <strong style='font-size:45px'>NODEFONY</strong>\n\
        </a>\n\
        <p>{{trans('welcome')}} {{name}}</p>\n\
      </h1>\n\
{% endblock %}\n\
{% block javascripts %}\n\
  {{ parent() }}\n\
  <!-- WEBPACK BUNDLE -->\n\
  <script src='" + this.params.CDN_javascript + "/" + this.params.bundleName + "/assets/js/" + this.params.name + ".js'></script>\n\
{% endblock %}";
  }
};
module.exports = View;