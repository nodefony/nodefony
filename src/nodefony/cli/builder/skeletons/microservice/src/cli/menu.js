const menu = [{
  type: 'list',
  name: 'cli',
  message: 'CLI',
  choices: ["Development", "Production", "Pm2", 'Build', "Test", "Quit"],
  filter: (val) => {
    switch (val) {
    case 'Build':
      return "build";
    case 'Development':
      return "development";
    case 'Production':
      return "production";
    case 'Pm2':
      return "pm2";
    case 'Test':
      return "test";
    case 'Quit':
      return "exit";
    default:
      return val.toLowerCase();
    }
  }
}];

module.exports = menu;
