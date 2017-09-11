
module.exports = nodefony.register("templates", function(){

  const Template = class Template extends nodefony.Service {

    constructor (container, engine, options){
      super("TEMPLATE", container , container.get("notificationsCenter") );
      this.settings = options;
      this.engine = engine;
    }

    getEngine (){
      return this.engine;
    }

    extendFunction (){
      this.logger("extendFunction You must redefine this function in engine templating");
    }

    extendFilter (){
      this.logger("extendFilter You must redefine this function in engine templating");
    }
  };
  return Template;
});
