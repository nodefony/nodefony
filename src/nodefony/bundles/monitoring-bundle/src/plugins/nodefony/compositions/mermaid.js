import {
  nextTick,
  onBeforeMount,
  onMounted,
  reactive,
  ref
} from "vue";

import mermaidEngine from "mermaid";

const defaultConfig = {
  theme: "default",
  startOnLoad: false,
  securityLevel: "loose"
  // securityLevel: "strict"
};

const generateAttribute = (name, attr, propertie, required) => {
  const type = propertie.type ? propertie.type.toLowerCase() : "vitual";
  return `  ${required ? "+" : "-"} ${type}  ${name}
  `;
};

const parseAttributes = (name, properties = {}, attrs = {}, require = []) => {
  let dia = `class ${name}{
  `;
  if (attrs) {
    for (const attr in attrs) {
      if (attrs[attr].type) {
        const required = require.includes(attr);
        dia += generateAttribute(attr, attrs[attr], properties[attr], required);
      }
    }
  }
  return dia += "}";
};


const generateRelation = (name, entity) =>
  // console.log(name, entity)
  `${name} <|-- ${entity}
  `;
const parseRealations = (name, properties = {}) => {
  // relations
  let realtions = "";
  const entities = [];
  for (const prop in properties) {
    if (properties[prop].$ref) {
      const entity = properties[prop].$ref.replace(/#\/components\/schemas\//, "");
      entities.push(entity);
      realtions += generateRelation(name, entity);
    }
  }
  return realtions;
};

function mermaid () {
  onMounted(() => {
    nextTick(() => {
      // return mermaidEngine.init()
    });
  });

  onBeforeMount(() => mermaidEngine.initialize(defaultConfig));

  const parseEntitySchema = function (name, schema, attributes) {
    return `classDiagram
    ${parseAttributes(name, schema.properties, attributes, schema.required)}
    ${parseRealations(name, schema.properties)}
`;
  };
  const parseConnectorSchema = function (name, entities) {
    let dia = `classDiagram
`;
    entities.map((entity) => {
      dia += `  ${parseRealations(entity.name, entity.schema.properties)}
`;
    });
    entities.map((entity) => {
      dia += `  ${parseAttributes(entity.name, entity.schema.properties, entity.attributes, entity.schema.required)}
`;
    });

    return dia;
  };

  const init = function () {
    return mermaidEngine.init();
  };

  return {
    parseEntitySchema,
    parseConnectorSchema,
    init
  };
}

export default mermaid;
