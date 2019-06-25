{% block body %}
const {{commandName}}Task = require(path.resolve(__dirname, "{{commandName}}Task.js"));

class {{commandName}}Command extends nodefony.Command {
  constructor(cli, bundle) {
    super("{{commandName}}", cli, bundle);
    this.setTask("task", {{commandName}}Task);
  }
}
module.exports = {{commandName}}Command;
{% endblock %}
