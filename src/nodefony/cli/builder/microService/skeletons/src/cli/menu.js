const menu = [{
  type: 'list',
  name: 'cli',
  message: 'CLI',
  choices: ["Development", "Production", "Pm2", 'Tools', "Test", "Examples", "Quit"],
  filter: (val) => {
    switch (val) {
    case 'Development':
      return "development";
    case 'Production':
      return "production";
    case 'Pm2':
      return "pm2";
    case 'Test':
      return "test";
    case 'Examples':
      return "example";
    case 'Tools':
      return "tools";
    case 'Quit':
      return "exit";
    default:
      return val.toLowerCase();
    }
  }
}];

module.exports = menu;
