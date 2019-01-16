//const stage = require("@nodefony/stage");

require('bootstrap');
require('../../scss/custom.scss');

module.exports = function () {

  //window["stage"] = stage;
  /*
   *
   *    Class Bundle App client side
   *
   *
   */
  var Documentation = class Documentation {

    constructor() {

      let selectorLang = global.document.getElementById("language");
      if (selectorLang) {
        selectorLang.addEventListener("change", (e) => {
          this.changeLang();
          e.preventDefault();
        });
      }

      $("#version").change(function () {
        console.log(this.value)
        window.location = "/documentation/" + this.value;
        e.preventDefault();
      });

      $.get("/api/git/getCurrentBranch", function (data) {
        var ele = $(".branch");
        ele.text(data.branch);
      }).fail(function (error) {
        throw error;
      });

      $.get("/api/git/versions", function (data) {
        let ele = $("#version");
        for (let version in data) {
          switch (version) {
          case "latest":
            let option = `<option value="${data[version]}" selected="">${data[version]}</option>`;
            ele.append(option);
            break;
          case "all":
            for (let i = 0; i < data[version].length; i++) {
              let option = `<option value="${data[version][i]}" selected="">${data[version][i]}</option>`;
              ele.append(option);
            }
            break;
          }

        }
      }).fail(function (error) {
        throw error;
      });

      var search = $("#inputSearh");
      search.bind("keypress", function (event) {
        if (event.keyCode === 13) {
          event.stopPropagation();
          event.preventDefault();
          $("#buttonSearh").trigger("click");
          return false;
        }
      });
      $("#buttonSearh").click(function (event) {
        var ele = $("#search");
        var mysearch = search.val();
        var spinner = $("#spinner");
        if (mysearch) {
          $.ajax({
            url: "/documentation/search",
            data: {
              search: mysearch
            },
            beforeSend: function () {
              ele.empty();
              spinner.show();
            },
            success: function (data) {
              var text = null;
              for (var link in data) {
                var reg = new RegExp(mysearch, 'gi');
                var res = reg.exec(data[link].text);
                if (res) {
                  text = data[link].text.replace(res[0], "<span style='background-color:yellow' >" + res[0] + "</span>");
                } else {
                  continue;
                }
                let li = "<li class='list-group-item'>";
                li += "<a href='" + link + "'><span style=''>" + data[link].title + "</span></a>";
                li += "<div>  " + text + " </div>";
                li += "</li>";
                ele.append(li);
              }
              if (!text) {
                let li = "<li class='list-group-item'>";
                li += "<div>  No result </div>";
                li += "</li>";
                ele.append(li);
              }
            },
            complete: function () {
              spinner.hide();
            }
          }).fail(function () {
            spinner.hide();
          });
        } else {
          event.stopPropagation();
          event.preventDefault();
          return false;
        }
      });
    }

    changeLang(query) {
      if (query) {
        return window.location.href = "?language=" + query;
      }
      let form = global.document.getElementById("formLang");
      if (form) {
        form.submit();
      }
    }

    index(bundle, section, url) {
      if (!url) {
        url = "https://github.com/nodefony/nodefony-core/commit/";
      }
      if (bundle === "nodefony" && section === null) {
        $.get("/api/git/getMostRecentCommit", function (data) {
          var ele = $("#commits");
          for (var i = 0; i < data.length; i++) {
            //var dt = new Date( data[i].date ) ;
            //var date = dt.toLocaleDateString() + " " + dt.toLocaleTimeString() ;
            var sha = data[i].sha.substr(0, 7);
            var shaLink = url + sha;
            var date = new Date(data[i].date).toDateString();
            var li = "<li class='list-group-item'>";
            li += "<span class='badge badge-primary'>" + data[i].author + "</span>";
            li += "<a href='" + shaLink + "' target='_blank' ><span style=''>" + data[i].msg + "</span></a>";
            li += "<div> commit on " + date + " by " + data[i].author + " </div>";
            li += "</li>";
            ele.append(li);

          }
        }).fail(function () {
          console.log("ERROR");
        });

        $.get("https://api.github.com/repos/nodefony/nodefony/issues?state=open", function (data) {
          var ele = $("#issues");
          for (var i = 0; i < data.length; i++) {
            var date = new Date(data[i].created_at).toDateString();
            var li = "<li class='list-group-item'>";
            li += "<span class='badge badge-primary'>#" + data[i].number + "</span>";
            li += "<a href='https://github.com/nodefony/nodefony/issues/" + data[i].number + "'><span style=''>" + data[i].title + "</span></a>";
            li += "<div> opened on " + date + " by " + data[i].user.login + " </div>";
            li += "</li>";
            ele.append(li);
          }
        }).fail(function () {
          console.log("ERROR");
        });
      }
    }
  };

  return new Documentation();
}();