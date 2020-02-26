const menu = [{
  type: 'list',
  name: 'cci',
  message: 'cci CLI ',
  choices: ['Build cci', "Run cci",  "Run Tests"],
  filter: (val) => {
    switch (val) {
    case 'Build':
      return "build";
    case 'start':
      return "start";
    case 'Run Tests':
      return "tests";
    default:
      return val.toLowerCase();
    }
  }
}];

module.exports = menu;
