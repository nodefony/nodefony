class listTask extends nodefony.Task {
  constructor (name, command) {
    super(name, command);
    this.serviceUnitTest = this.get("unitTest");
    this.serviceUnitTest.consoleMochaInit();

    this.tests = [];
  }

  showHelp () {
    this.setHelp(
      "unitest:list:all",
      "List all unit tests"
    );
    this.setHelp(
      "unitest:list:bundle bundleName",
      "List all bundle unit tests"
    );
  }


  all () {
    this.serviceUnitTest.getNodefonyTestFiles(null, this.tests);
    for (const bundle in this.kernel.bundles) {
      this.serviceUnitTest.getBundlesTestFiles(bundle, null, this.tests);
    }
    return this.onReady();
  }

  bundle (bundleName, testName) {
    bundleName = bundleName.replace("[-][Bb]undle", "");
    if (bundleName === "nodefony") {
      this.serviceUnitTest.getNodefonyTestFiles(testName, this.tests);
    } else {
      this.serviceUnitTest.getBundlesTestFiles(bundleName, testName, this.tests);
    }
    return this.onReady();
  }

  onReady () {
    return new Promise((resolve, reject) => {
      try {
        let bundleName = "";
        for (let i = 0; i < this.tests.length; i++) {
          if (bundleName !== this.tests[i].bundle) {
            bundleName = this.tests[i].bundle;
            this.log(`★★★ BUNDLE : ${bundleName} ★★★\n`, "INFO");
          }
          this.log(`       ‣ ${this.tests[i].name}`, "INFO");
        }
        // this.log("\x1b[0m\x1b[0m", "INFO");
        this.log(` To run test
nodefony unitest:launch:all                                Launch all tests Example : nodefony unitest:launch:all
nodefony unitest:launch:bundle bundleName [testfile]       Launch bundle tests Example: nodefony unitest:launch:bundle demo responseTest.js `);
        return resolve(0);
      } catch (e) {
        return reject(e);
      }
    });
  }
}

module.exports = listTask;
