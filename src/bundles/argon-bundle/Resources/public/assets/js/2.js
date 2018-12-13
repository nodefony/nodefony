(window["webpackJsonp_name_"] = window["webpackJsonp_name_"] || []).push([[2],{

/***/ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./src/views/components/JavascriptComponents/Tooltips.vue?vue&type=script&lang=js&":
/*!**************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--12-0!./node_modules/vue-loader/lib??vue-loader-options!./src/views/components/JavascriptComponents/Tooltips.vue?vue&type=script&lang=js& ***!
  \**************************************************************************************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var bootstrap_vue_es_directives_tooltip_tooltip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bootstrap-vue/es/directives/tooltip/tooltip */ "./node_modules/bootstrap-vue/es/directives/tooltip/tooltip.js");
/* harmony import */ var bootstrap_vue_es_directives_popover_popover__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! bootstrap-vue/es/directives/popover/popover */ "./node_modules/bootstrap-vue/es/directives/popover/popover.js");
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/* harmony default export */ __webpack_exports__["default"] = ({
  directives: {
    BTooltip: bootstrap_vue_es_directives_tooltip_tooltip__WEBPACK_IMPORTED_MODULE_0__["default"],
    BPopover: bootstrap_vue_es_directives_popover_popover__WEBPACK_IMPORTED_MODULE_1__["default"]
  }
});

/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./src/views/components/JavascriptComponents/Tooltips.vue?vue&type=template&id=bb48af46&":
/*!*****************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib??vue-loader-options!./src/views/components/JavascriptComponents/Tooltips.vue?vue&type=template&id=bb48af46& ***!
  \*****************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "row" }, [
    _c(
      "div",
      { staticClass: "col-lg-6" },
      [
        _c(
          "small",
          { staticClass: "d-block text-uppercase font-weight-bold mb-3" },
          [_vm._v("Tooltips")]
        ),
        _c(
          "base-button",
          {
            directives: [
              {
                name: "b-tooltip",
                rawName: "v-b-tooltip.hover.left",
                modifiers: { hover: true, left: true }
              }
            ],
            staticClass: "btn-tooltip",
            attrs: { size: "sm", type: "primary", title: "Tooltip on left" }
          },
          [_vm._v("On left\n        ")]
        ),
        _c(
          "base-button",
          {
            directives: [
              {
                name: "b-tooltip",
                rawName: "v-b-tooltip.hover.top",
                modifiers: { hover: true, top: true }
              }
            ],
            staticClass: "btn-tooltip",
            attrs: { size: "sm", type: "primary", title: "Tooltip on top" }
          },
          [_vm._v("On top\n        ")]
        ),
        _c(
          "base-button",
          {
            directives: [
              {
                name: "b-tooltip",
                rawName: "v-b-tooltip.hover.bottom",
                modifiers: { hover: true, bottom: true }
              }
            ],
            staticClass: "btn-tooltip",
            attrs: { size: "sm", type: "primary", title: "Tooltip on bottom" }
          },
          [_vm._v("On bottom\n        ")]
        ),
        _c(
          "base-button",
          {
            directives: [
              {
                name: "b-tooltip",
                rawName: "v-b-tooltip.hover.right",
                modifiers: { hover: true, right: true }
              }
            ],
            staticClass: "btn-tooltip",
            attrs: { size: "sm", type: "primary", title: "Tooltip on right" }
          },
          [_vm._v("On right\n        ")]
        )
      ],
      1
    ),
    _c(
      "div",
      { staticClass: "col-lg-6 mt-4 mt-lg-0" },
      [
        _c(
          "small",
          { staticClass: "d-block text-uppercase font-weight-bold mb-3" },
          [_vm._v("Popovers")]
        ),
        _c(
          "base-button",
          {
            directives: [
              {
                name: "b-popover",
                rawName: "v-b-popover.hover.left",
                value:
                  "Vivamus sagittis lacus vel augue laoreet rutrum faucibus.",
                expression:
                  "'Vivamus sagittis lacus vel augue laoreet rutrum faucibus.'",
                modifiers: { hover: true, left: true }
              }
            ],
            attrs: { size: "sm", type: "default", title: "Popover On Left" }
          },
          [_vm._v("On left\n        ")]
        ),
        _c(
          "base-button",
          {
            directives: [
              {
                name: "b-popover",
                rawName: "v-b-popover.hover.left",
                value:
                  "Vivamus sagittis lacus vel augue laoreet rutrum faucibus.",
                expression:
                  "'Vivamus sagittis lacus vel augue laoreet rutrum faucibus.'",
                modifiers: { hover: true, left: true }
              }
            ],
            attrs: { size: "sm", type: "default", title: "Popover On Left" }
          },
          [_vm._v("On left\n        ")]
        ),
        _c(
          "base-button",
          {
            directives: [
              {
                name: "b-popover",
                rawName: "v-b-popover.hover.top",
                value:
                  "Vivamus sagittis lacus vel augue laoreet rutrum faucibus.",
                expression:
                  "'Vivamus sagittis lacus vel augue laoreet rutrum faucibus.'",
                modifiers: { hover: true, top: true }
              }
            ],
            attrs: { size: "sm", type: "default", title: "Popover On Top" }
          },
          [_vm._v("On top\n        ")]
        ),
        _c(
          "base-button",
          {
            directives: [
              {
                name: "b-popover",
                rawName: "v-b-popover.hover.right",
                value:
                  "Vivamus sagittis lacus vel augue laoreet rutrum faucibus.",
                expression:
                  "'Vivamus sagittis lacus vel augue laoreet rutrum faucibus.'",
                modifiers: { hover: true, right: true }
              }
            ],
            attrs: { size: "sm", type: "default", title: "Popover On right" }
          },
          [_vm._v("On right\n        ")]
        ),
        _c(
          "base-button",
          {
            directives: [
              {
                name: "b-popover",
                rawName: "v-b-popover.hover.bottom",
                value:
                  "Vivamus sagittis lacus vel augue laoreet rutrum faucibus.",
                expression:
                  "'Vivamus sagittis lacus vel augue laoreet rutrum faucibus.'",
                modifiers: { hover: true, bottom: true }
              }
            ],
            attrs: { size: "sm", type: "default", title: "Popover On bottom" }
          },
          [_vm._v("On bottom\n        ")]
        )
      ],
      1
    )
  ])
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./src/views/components/JavascriptComponents/Tooltips.vue":
/*!****************************************************************!*\
  !*** ./src/views/components/JavascriptComponents/Tooltips.vue ***!
  \****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Tooltips_vue_vue_type_template_id_bb48af46___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Tooltips.vue?vue&type=template&id=bb48af46& */ "./src/views/components/JavascriptComponents/Tooltips.vue?vue&type=template&id=bb48af46&");
/* harmony import */ var _Tooltips_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Tooltips.vue?vue&type=script&lang=js& */ "./src/views/components/JavascriptComponents/Tooltips.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport *//* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */

var component = Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
  _Tooltips_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _Tooltips_vue_vue_type_template_id_bb48af46___WEBPACK_IMPORTED_MODULE_0__["render"],
  _Tooltips_vue_vue_type_template_id_bb48af46___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/views/components/JavascriptComponents/Tooltips.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "./src/views/components/JavascriptComponents/Tooltips.vue?vue&type=script&lang=js&":
/*!*****************************************************************************************!*\
  !*** ./src/views/components/JavascriptComponents/Tooltips.vue?vue&type=script&lang=js& ***!
  \*****************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_babel_loader_lib_index_js_ref_12_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Tooltips_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/babel-loader/lib??ref--12-0!../../../../node_modules/vue-loader/lib??vue-loader-options!./Tooltips.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./src/views/components/JavascriptComponents/Tooltips.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport */ /* harmony default export */ __webpack_exports__["default"] = (_node_modules_babel_loader_lib_index_js_ref_12_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Tooltips_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__["default"]); 

/***/ }),

/***/ "./src/views/components/JavascriptComponents/Tooltips.vue?vue&type=template&id=bb48af46&":
/*!***********************************************************************************************!*\
  !*** ./src/views/components/JavascriptComponents/Tooltips.vue?vue&type=template&id=bb48af46& ***!
  \***********************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_Tooltips_vue_vue_type_template_id_bb48af46___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../node_modules/vue-loader/lib??vue-loader-options!./Tooltips.vue?vue&type=template&id=bb48af46& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./src/views/components/JavascriptComponents/Tooltips.vue?vue&type=template&id=bb48af46&");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_Tooltips_vue_vue_type_template_id_bb48af46___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_Tooltips_vue_vue_type_template_id_bb48af46___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ })

}]);
//# sourceMappingURL=2.js.map