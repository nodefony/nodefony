/*
 *   MODEFONY FRAMEWORK UNIT TEST
 *
 *   MOCHA STYLE
 *
 *   In the global context you can find :
 *
 *	nodefony : namespace to get library
 *	kernel :   instance of kernel who launch the test
 *
 */
const assert = require("assert");

describe("NODEFONY CLI", () => {
  beforeEach(() => {});

  describe("SIMPLE", () => {
    it("CREATE", (done) => {
      const project = new nodefony.cli("project", {
        version: nodefony.version,
        pid: true,
        color: clc.red.bold
      });
      assert.strictEqual(project.name, "project");
      assert.strictEqual(project.commander.version(), nodefony.version);
      const options = {
        processName: "nodefony",
        autostart: true,
        asciify: true,
        clear: true,
        prompt: "default",
        commander: true,
        color: clc.red.bold,
        signals: true,
        autoLogger: true,
        resize: false,
        version: nodefony.version,
        warning: false,
        pid: true,
        promiseRejection: true
      };
      assert.deepStrictEqual(options, project.options);

      const banner = `          Version : ${clc.blueBright.bold(nodefony.version)}   Platform : ${clc.green(process.platform)}   Process : ${clc.green("project")}   Pid : ${project.pid}`;
      let res = null;
      project.start()
        .then((cli) => {
          res = cli.showBanner();
          assert.strictEqual(banner, res);
          res = cli.terminate(0, true);
          assert.strictEqual(res, 0);
          done();
        })
        .catch((e) => {
          throw e;
        });
    });
  });
});
