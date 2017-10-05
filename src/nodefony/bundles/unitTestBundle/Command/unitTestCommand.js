module.exports = nodefony.registerCommand("unitTest", function () {

  const unitTest = class unitTest extends nodefony.cliKernel {

    constructor(container, command, options) {

      super("unitTest", container, container.get("notificationsCenter"), options);
      let cmd = command[0].split(":");
      //command.shift();
      let args = command[1];
      let bundles = this.kernel.bundles;
      this.serviceUnitTest = this.container.get("unitTest");
      this.serviceUnitTest.consoleMochaInit();
      let tests = [];
      if (cmd[2] === 'all') {
        this.serviceUnitTest.getNodefonyTestFiles(null, tests);
        for (var bundle in bundles) {
          this.serviceUnitTest.getBundlesTestFiles(bundle, null, tests);
        }
      } else if (cmd[2] === 'bundle') {
        let bundleName = args[0];
        let testName = args[1];
        bundleName = bundleName.replace('Bundle', '');
        if (bundleName === "nodefony") {
          this.serviceUnitTest.getNodefonyTestFiles(testName, tests);
        } else {
          this.serviceUnitTest.getBundlesTestFiles(bundleName, testName, tests);
        }
      }
      this.listen(this, 'onReady', ( /*kernel*/ ) => {
        switch (cmd[1]) {
        case "list":
          switch (cmd[2]) {
          case "all":
          case "bundle":
            let bundleName = '';
            for (let i = 0; i < tests.length; i++) {
              if (bundleName !== tests[i].bundle) {
                bundleName = tests[i].bundle;
                this.logger("★★★ BUNDLE : " + bundleName + " ★★★\n", "INFO");
              }
              this.logger("       ‣ " + tests[i].name, "INFO");
            }
            this.logger("\x1b[0m\x1b[0m", "INFO");
            break;
          }
          this.terminate(1);
          break;
        case "launch":
          switch (cmd[2]) {
          case "single":
          case "all":
          case "bundle":
            //console.log(tests)
            this.serviceUnitTest.mochaAddTest(tests);
            this.serviceUnitTest.mochaRunTest((failures) => {
              this.terminate(failures);
            });
            break;
          default:
            this.showHelp();
            this.terminate(1);
          }
          break;
        default:
          this.logger(new Error("unitTest   " + cmd[1] + " bad format"), "ERROR");
          this.showHelp();
          this.terminate(1);
        }
      });
    }
  };
  return {
    name: "unitTest",
    commands: {
      listAll: ["unitTest:list:all", "List all unit tests"],
      listBundle: ["unitTest:list:bundle bundleName", "List all bundle unit tests"],
      launchAll: ["unitTest:launch:all", "Launch all tests Example : nodefony unitTest:launch:all"],
      launchBundle: ["unitTest:launch:bundle bundleName { testfile }", "Launch bundle tests Example: nodefony unitTest:launch:bundle demoBundle responseTest.js"],
    },
    cli: unitTest
  };
});
