import 'bootstrap';
import '../scss/custom.scss';
const semver = require("semver");

import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash';
import shell from 'highlight.js/lib/languages/shell';
import css from 'highlight.js/lib/languages/css';
import yaml from 'highlight.js/lib/languages/yaml';
import twig from 'highlight.js/lib/languages/twig';
import nginx from 'highlight.js/lib/languages/nginx';

import 'highlight.js/styles/atom-one-dark.css';
//import 'highlight.js/styles/atom-one-light.css';
//import 'highlight.js/styles/github.css';
//import 'highlight.js/styles/purebasic.css';

class Documentation {

  constructor() {
    $(document).ready(() => {
      //this.getVersions("nodefony");
      //this.getVersions(this.project);
      //this.initSearch();
      //this.getBranch();
      this.initLang();
      hljs.registerLanguage('javascript', javascript);
      hljs.registerLanguage('bash', bash);
      hljs.registerLanguage('shell', shell);
      hljs.registerLanguage('css', css);
      hljs.registerLanguage('yaml', yaml);
      hljs.registerLanguage('twig', twig);
      hljs.registerLanguage('nginx', nginx);
      hljs.initHighlighting();
    });
  }

  getBranch(){
    $.get("/nodefony/api/git/getCurrentBranch", function (data) {
      var ele = $(".branch");
      ele.text(data.branch);
    }).fail(function (error) {
      throw error;
    });
  }

  initLang() {
    let selectorLang = global.document.getElementById("language");
    if (selectorLang) {
      selectorLang.addEventListener("change", (e) => {
        this.changeLang();
        e.preventDefault();
      });
    }
  }

  initSearch() {
    const searchImput = $("#inputSearch");
    const search = $("#search");
    searchImput.bind("keypress", function (event) {
      if (event.keyCode === 13) {
        event.stopPropagation();
        event.preventDefault();
        $("#buttonSearch").trigger("click");
        return false;
      }
    });
    $("#buttonSearch").click(function (event) {
      var mysearch = searchImput.val();
      var spinner = $(".spinner");
      if (mysearch) {
        $.ajax({
          url: "/documentation/search",
          data: {
            search: mysearch
          },
          beforeSend: function () {
            searchImput.empty();
            spinner.show();
          },
          success: function (data) {
            var text = null;
            search.empty();
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
              search.append(li);
            }
            if (!text) {
              let li = "<li class='list-group-item'>";
              li += "<div>  No result </div>";
              li += "</li>";
              search.append(li);
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

  getVersions(project) {
    switch (project) {
    case "nodefony":
      return $.get("/nodefony/api/git/versions", (data) => {
          const select = $("#version");
          select.change(function (e) {
            //window.location = "/documentation/" + this.value;
            $("#formVersion").submit();
            e.preventDefault();
          });
          return this.buildSelect(data, select, project);
        })
        .fail(function (error) {
          throw error;
        });
    default:
      return $.get("/nodefony/api/git/getCurrentBranch/" + project, (data) => {
          const select = $("#project");
          select.change(function (e) {
            $("#formProject").submit();
            e.preventDefault();
          });
          select.append(`<option title="" value="" selected="selected">Select</option>`);
          let option = `<option title="${data.branch}" value="${data.branch}">${data.branch}</option>`;
          select.append(option);
        })
        .fail(function (error) {
          throw error;
        });
    }
  }

  buildSelect(data, ele) {
    let option = null;
    ele.append(`<option title="" value="" selected="selected">Select</option>`);
    option = `<option title="master" value="master">master</option>`;
    ele.append(option);
    for (let version in data) {
      let option = null;
      switch (version) {
      case "latest":
        option = `<option title="${data[version]}" value="${data[version]}">Latest</option>`;
        ele.append(option);
        break;
      case "all":
        for (let i = 0; i < data[version].length; i++) {
          let check = semver.satisfies(semver.clean(data[version][i]), ">=4.2.0-beta.1");
          if (check /*&& data[version][i] !== data.latest*/ ) {
            option = `<option value="${data[version][i]}">${data[version][i]}</option>`;
            ele.append(option);
          }
        }
        break;
      }
    }
    return data;
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

  index(bundle, section, url, version, project) {
    this.version = version;
    this.project = project;
    this.bundle = bundle;
    if (!url) {
      url = "https://github.com/nodefony/nodefony/commit/";
    }
    if ((bundle === "nodefony" || bundle === project) && section === null) {
      $.get("/nodefony/api/git/getMostRecentCommit/" + bundle, function (data) {
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
      }).fail(function (e) {
        console.error(e);
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
      }).fail(function (e) {
        console.error(e);
      });
    }
  }
}

export default new Documentation();
