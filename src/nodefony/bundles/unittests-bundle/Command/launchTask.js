class launchTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);

    this.serviceUnitTest = this.get("unitTest");
    this.serviceUnitTest.consoleMochaInit();
    this.tests = [];

  }

  showHelp(help = "") {
    help += `\t${this.cli.clc.green("unitest:launch:all")}\t\t Launch all tests Example : nodefony unitest:launch:all\n`;
    help += `\t${this.cli.clc.green("unitest:launch:bundle bundleName [testfile]")}\t\t Launch bundle tests Example: nodefony unitest:launch:bundle demoBundle responseTest.js`;
    console.log(help);
    return help;
  }

  all() {
    this.serviceUnitTest.getNodefonyTestFiles(null, this.tests);
    for (let bundle in this.kernel.bundles) {
      this.serviceUnitTest.getBundlesTestFiles(bundle, null, this.tests);
    }
    return this.onReady();
  }

  bundle(bundleName, testName) {
    bundleName = bundleName.replace('[-]?[Bb]undle', '');
    if (bundleName === "nodefony") {
      this.serviceUnitTest.getNodefonyTestFiles(testName, this.tests);
    } else {
      this.serviceUnitTest.getBundlesTestFiles(bundleName, testName, this.tests);
    }
    return this.onReady();
  }


  onReady() {
    this.kernel.listen(this, 'onReady', ( /*kernel*/ ) => {
      this.serviceUnitTest.mochaAddTest(this.tests);
      this.serviceUnitTest.mochaRunTest((failures) => {
        this.cli.terminate(failures);
      });
    });
  }

}


module.exports = launchTask;