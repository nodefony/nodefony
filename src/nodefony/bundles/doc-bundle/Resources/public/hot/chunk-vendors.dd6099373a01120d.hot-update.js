"use strict";
self["webpackHotUpdatedoc_bundle"]("chunk-vendors",{

/***/ "./node_modules/vuetify/lib/components/VApp/VApp.mjs":
/*!***********************************************************!*\
  !*** ./node_modules/vuetify/lib/components/VApp/VApp.mjs ***!
  \***********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VApp": function() { return /* binding */ VApp; }
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _VApp_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./VApp.css */ "./node_modules/vuetify/lib/components/VApp/VApp.css");
/* harmony import */ var _composables_theme_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../composables/theme.mjs */ "./node_modules/vuetify/lib/composables/theme.mjs");
/* harmony import */ var _composables_layout_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../composables/layout.mjs */ "./node_modules/vuetify/lib/composables/layout.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../util/index.mjs */ "./node_modules/vuetify/lib/util/defineComponent.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../util/index.mjs */ "./node_modules/vuetify/lib/util/useRender.mjs");
/* harmony import */ var _composables_rtl_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../composables/rtl.mjs */ "./node_modules/vuetify/lib/composables/rtl.mjs");
 // Styles

 // Composables


 // Utilities



const VApp = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.defineComponent)({
  name: 'VApp',
  props: { ...(0,_composables_layout_mjs__WEBPACK_IMPORTED_MODULE_3__.makeLayoutProps)({
      fullHeight: true
    }),
    ...(0,_composables_theme_mjs__WEBPACK_IMPORTED_MODULE_4__.makeThemeProps)()
  },

  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const theme = (0,_composables_theme_mjs__WEBPACK_IMPORTED_MODULE_4__.provideTheme)(props);
    const {
      layoutClasses,
      layoutStyles,
      getLayoutItem,
      items,
      layoutRef
    } = (0,_composables_layout_mjs__WEBPACK_IMPORTED_MODULE_3__.createLayout)(props);
    const {
      rtlClasses
    } = (0,_composables_rtl_mjs__WEBPACK_IMPORTED_MODULE_5__.useRtl)();
    (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_6__.useRender)(() => {
      var _slots$default;

      return (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", {
        "ref": layoutRef,
        "class": ['v-application', theme.themeClasses.value, layoutClasses.value, rtlClasses.value],
        "style": layoutStyles.value,
        "data-app": "true"
      }, [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", {
        "class": "v-application__wrap"
      }, [(_slots$default = slots.default) == null ? void 0 : _slots$default.call(slots)])]);
    });
    return {
      getLayoutItem,
      items,
      theme
    };
  }

});

/***/ }),

/***/ "./node_modules/vuetify/lib/components/VAppBar/VAppBar.mjs":
/*!*****************************************************************!*\
  !*** ./node_modules/vuetify/lib/components/VAppBar/VAppBar.mjs ***!
  \*****************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VAppBar": function() { return /* binding */ VAppBar; }
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _VAppBar_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./VAppBar.css */ "./node_modules/vuetify/lib/components/VAppBar/VAppBar.css");
/* harmony import */ var _VImg_index_mjs__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../VImg/index.mjs */ "./node_modules/vuetify/lib/components/VImg/VImg.mjs");
/* harmony import */ var _composables_border_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../composables/border.mjs */ "./node_modules/vuetify/lib/composables/border.mjs");
/* harmony import */ var _composables_density_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../composables/density.mjs */ "./node_modules/vuetify/lib/composables/density.mjs");
/* harmony import */ var _composables_elevation_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../composables/elevation.mjs */ "./node_modules/vuetify/lib/composables/elevation.mjs");
/* harmony import */ var _composables_layout_mjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../composables/layout.mjs */ "./node_modules/vuetify/lib/composables/layout.mjs");
/* harmony import */ var _composables_rounded_mjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../composables/rounded.mjs */ "./node_modules/vuetify/lib/composables/rounded.mjs");
/* harmony import */ var _composables_tag_mjs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../composables/tag.mjs */ "./node_modules/vuetify/lib/composables/tag.mjs");
/* harmony import */ var _composables_color_mjs__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../composables/color.mjs */ "./node_modules/vuetify/lib/composables/color.mjs");
/* harmony import */ var _composables_proxiedModel_mjs__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../composables/proxiedModel.mjs */ "./node_modules/vuetify/lib/composables/proxiedModel.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../util/index.mjs */ "./node_modules/vuetify/lib/util/defineComponent.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../util/index.mjs */ "./node_modules/vuetify/lib/util/helpers.mjs");
 // Styles

 // Components

 // Composables








 // Utilities


 // Types

const VAppBar = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.defineComponent)({
  name: 'VAppBar',
  props: {
    // TODO: Implement scrolling techniques
    // hideOnScroll: Boolean
    // invertedScroll: Boolean
    // collapseOnScroll: Boolean
    // elevateOnScroll: Boolean
    // shrinkOnScroll: Boolean
    // fadeImageOnScroll: Boolean
    collapse: Boolean,
    color: String,
    flat: Boolean,
    height: {
      type: [Number, String],
      default: 64
    },
    extensionHeight: {
      type: [Number, String],
      default: 48
    },
    floating: Boolean,
    image: String,
    modelValue: {
      type: Boolean,
      default: true
    },
    prominent: Boolean,
    prominentHeight: {
      type: [Number, String],
      default: 128
    },
    position: {
      type: String,
      default: 'top',
      validator: value => ['top', 'bottom'].includes(value)
    },
    ...(0,_composables_border_mjs__WEBPACK_IMPORTED_MODULE_3__.makeBorderProps)(),
    ...(0,_composables_density_mjs__WEBPACK_IMPORTED_MODULE_4__.makeDensityProps)(),
    ...(0,_composables_elevation_mjs__WEBPACK_IMPORTED_MODULE_5__.makeElevationProps)(),
    ...(0,_composables_rounded_mjs__WEBPACK_IMPORTED_MODULE_6__.makeRoundedProps)(),
    ...(0,_composables_layout_mjs__WEBPACK_IMPORTED_MODULE_7__.makeLayoutItemProps)(),
    ...(0,_composables_tag_mjs__WEBPACK_IMPORTED_MODULE_8__.makeTagProps)({
      tag: 'header'
    })
  },
  emits: {
    'update:modelValue': value => true
  },

  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      borderClasses
    } = (0,_composables_border_mjs__WEBPACK_IMPORTED_MODULE_3__.useBorder)(props);
    const {
      densityClasses
    } = (0,_composables_density_mjs__WEBPACK_IMPORTED_MODULE_4__.useDensity)(props);
    const {
      elevationClasses
    } = (0,_composables_elevation_mjs__WEBPACK_IMPORTED_MODULE_5__.useElevation)(props);
    const {
      roundedClasses
    } = (0,_composables_rounded_mjs__WEBPACK_IMPORTED_MODULE_6__.useRounded)(props);
    const {
      backgroundColorClasses,
      backgroundColorStyles
    } = (0,_composables_color_mjs__WEBPACK_IMPORTED_MODULE_9__.useBackgroundColor)((0,vue__WEBPACK_IMPORTED_MODULE_0__.toRef)(props, 'color'));
    const isExtended = !!slots.extension;
    const contentHeight = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => Number(props.prominent ? props.prominentHeight : props.height) - (props.density === 'comfortable' ? 8 : 0) - (props.density === 'compact' ? 16 : 0));
    const height = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => contentHeight.value + Number(isExtended ? props.extensionHeight : 0));
    const isActive = (0,_composables_proxiedModel_mjs__WEBPACK_IMPORTED_MODULE_10__.useProxiedModel)(props, 'modelValue', props.modelValue);
    const {
      layoutItemStyles
    } = (0,_composables_layout_mjs__WEBPACK_IMPORTED_MODULE_7__.useLayoutItem)({
      id: props.name,
      priority: (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => parseInt(props.priority, 10)),
      position: (0,vue__WEBPACK_IMPORTED_MODULE_0__.toRef)(props, 'position'),
      layoutSize: height,
      elementSize: height,
      active: isActive,
      absolute: (0,vue__WEBPACK_IMPORTED_MODULE_0__.toRef)(props, 'absolute')
    });
    return () => {
      var _slots$img, _slots$default, _slots$extension;

      const hasImage = !!(slots.image || props.image);
      return (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(props.tag, {
        "class": ['v-app-bar', {
          'v-app-bar--bottom': props.position === 'bottom',
          'v-app-bar--collapsed': props.collapse,
          'v-app-bar--flat': props.flat,
          'v-app-bar--floating': props.floating,
          'v-app-bar--is-active': isActive.value,
          'v-app-bar--prominent': props.prominent
        }, backgroundColorClasses.value, borderClasses.value, densityClasses.value, elevationClasses.value, roundedClasses.value],
        "style": [backgroundColorStyles.value, layoutItemStyles.value]
      }, {
        default: () => [hasImage && (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", {
          "class": "v-app-bar__image"
        }, [slots.image ? (_slots$img = slots.img) == null ? void 0 : _slots$img.call(slots, {
          src: props.image
        }) : (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(_VImg_index_mjs__WEBPACK_IMPORTED_MODULE_11__.VImg, {
          "src": props.image,
          "cover": true
        }, null)]), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", {
          "class": "v-app-bar__content",
          "style": {
            height: (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_12__.convertToUnit)(contentHeight.value)
          }
        }, [slots.prepend && (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", {
          "class": "v-app-bar__prepend"
        }, [slots.prepend()]), (_slots$default = slots.default) == null ? void 0 : _slots$default.call(slots), slots.append && (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", {
          "class": "v-app-bar__append"
        }, [slots.append()])]), isExtended && (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", {
          "class": "v-app-bar__extension",
          "style": {
            height: (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_12__.convertToUnit)(props.extensionHeight)
          }
        }, [(_slots$extension = slots.extension) == null ? void 0 : _slots$extension.call(slots)])]
      });
    };
  }

});

/***/ }),

/***/ "./node_modules/vuetify/lib/components/VGrid/VContainer.mjs":
/*!******************************************************************!*\
  !*** ./node_modules/vuetify/lib/components/VGrid/VContainer.mjs ***!
  \******************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VContainer": function() { return /* binding */ VContainer; }
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _VGrid_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./VGrid.css */ "./node_modules/vuetify/lib/components/VGrid/VGrid.css");
/* harmony import */ var _composables_tag_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../composables/tag.mjs */ "./node_modules/vuetify/lib/composables/tag.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../util/index.mjs */ "./node_modules/vuetify/lib/util/defineComponent.mjs");
 // Styles

 // Composables

 // Utilities


const VContainer = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.defineComponent)({
  name: 'VContainer',
  props: {
    fluid: {
      type: Boolean,
      default: false
    },
    ...(0,_composables_tag_mjs__WEBPACK_IMPORTED_MODULE_3__.makeTagProps)()
  },

  setup(props, _ref) {
    let {
      slots
    } = _ref;
    return () => (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(props.tag, {
      "class": ['v-container', {
        'v-container--fluid': props.fluid
      }]
    }, slots);
  }

});

/***/ }),

/***/ "./node_modules/vuetify/lib/components/VImg/VImg.mjs":
/*!***********************************************************!*\
  !*** ./node_modules/vuetify/lib/components/VImg/VImg.mjs ***!
  \***********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VImg": function() { return /* binding */ VImg; }
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _VImg_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./VImg.css */ "./node_modules/vuetify/lib/components/VImg/VImg.css");
/* harmony import */ var _VResponsive_index_mjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../VResponsive/index.mjs */ "./node_modules/vuetify/lib/components/VResponsive/VResponsive.mjs");
/* harmony import */ var _directives_intersect_index_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../directives/intersect/index.mjs */ "./node_modules/vuetify/lib/directives/intersect/index.mjs");
/* harmony import */ var _composables_transition_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../composables/transition.mjs */ "./node_modules/vuetify/lib/composables/transition.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../util/index.mjs */ "./node_modules/vuetify/lib/util/defineComponent.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../util/index.mjs */ "./node_modules/vuetify/lib/util/globals.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../util/index.mjs */ "./node_modules/vuetify/lib/util/useRender.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../util/index.mjs */ "./node_modules/vuetify/lib/util/helpers.mjs");

 // Components

 // Directives

 // Composables

 // Utilities


 // Types

const VImg = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.defineComponent)({
  name: 'VImg',
  directives: {
    intersect: _directives_intersect_index_mjs__WEBPACK_IMPORTED_MODULE_3__["default"]
  },
  props: {
    aspectRatio: [String, Number],
    alt: String,
    cover: Boolean,
    eager: Boolean,
    gradient: String,
    lazySrc: String,
    options: {
      type: Object,
      // For more information on types, navigate to:
      // https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
      default: () => ({
        root: undefined,
        rootMargin: undefined,
        threshold: undefined
      })
    },
    sizes: String,
    src: {
      type: [String, Object],
      default: ''
    },
    srcset: String,
    width: [String, Number],
    ...(0,_composables_transition_mjs__WEBPACK_IMPORTED_MODULE_4__.makeTransitionProps)()
  },
  emits: ['loadstart', 'load', 'error'],

  setup(props, _ref) {
    let {
      emit,
      slots
    } = _ref;
    const currentSrc = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)(''); // Set from srcset

    const image = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)();
    const state = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)(props.eager ? 'loading' : 'idle');
    const naturalWidth = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)();
    const naturalHeight = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)();
    const normalisedSrc = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
      return props.src && typeof props.src === 'object' ? {
        src: props.src.src,
        srcset: props.srcset || props.src.srcset,
        lazySrc: props.lazySrc || props.src.lazySrc,
        aspect: Number(props.aspectRatio || props.src.aspect)
      } : {
        src: props.src,
        srcset: props.srcset,
        lazySrc: props.lazySrc,
        aspect: Number(props.aspectRatio || 0)
      };
    });
    const aspectRatio = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
      return normalisedSrc.value.aspect || naturalWidth.value / naturalHeight.value || 0;
    });
    (0,vue__WEBPACK_IMPORTED_MODULE_0__.watch)(() => props.src, () => {
      init(state.value !== 'idle');
    }); // TODO: getSrc when window width changes

    (0,vue__WEBPACK_IMPORTED_MODULE_0__.onBeforeMount)(() => init());

    function init(isIntersecting) {
      if (props.eager && isIntersecting) return;
      if (_util_index_mjs__WEBPACK_IMPORTED_MODULE_5__.SUPPORTS_INTERSECTION && !isIntersecting && !props.eager) return;
      state.value = 'loading';
      (0,vue__WEBPACK_IMPORTED_MODULE_0__.nextTick)(() => {
        var _image$value, _image$value2;

        emit('loadstart', ((_image$value = image.value) == null ? void 0 : _image$value.currentSrc) || normalisedSrc.value.src);

        if ((_image$value2 = image.value) != null && _image$value2.complete) {
          if (!image.value.naturalWidth) {
            onError();
          }

          if (state.value === 'error') return;
          if (!aspectRatio.value) pollForSize(image.value, null);
          onLoad();
        } else {
          if (!aspectRatio.value) pollForSize(image.value);
          getSrc();
        }
      });

      if (normalisedSrc.value.lazySrc) {
        const lazyImg = new Image();
        lazyImg.src = normalisedSrc.value.lazySrc;
        pollForSize(lazyImg, null);
      }
    }

    function onLoad() {
      var _image$value3;

      getSrc();
      state.value = 'loaded';
      emit('load', ((_image$value3 = image.value) == null ? void 0 : _image$value3.currentSrc) || normalisedSrc.value.src);
    }

    function onError() {
      var _image$value4;

      state.value = 'error';
      emit('error', ((_image$value4 = image.value) == null ? void 0 : _image$value4.currentSrc) || normalisedSrc.value.src);
    }

    function getSrc() {
      const img = image.value;
      if (img) currentSrc.value = img.currentSrc || img.src;
    }

    function pollForSize(img) {
      let timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

      const poll = () => {
        const {
          naturalHeight: imgHeight,
          naturalWidth: imgWidth
        } = img;

        if (imgHeight || imgWidth) {
          naturalWidth.value = imgWidth;
          naturalHeight.value = imgHeight;
        } else if (!img.complete && state.value === 'loading' && timeout != null) {
          setTimeout(poll, timeout);
        } else if (img.currentSrc.endsWith('.svg') || img.currentSrc.startsWith('data:image/svg+xml')) {
          naturalWidth.value = 1;
          naturalHeight.value = 1;
        }
      };

      poll();
    }

    const containClasses = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => ({
      'v-img__img--cover': props.cover,
      'v-img__img--contain': !props.cover
    }));

    const __image = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
      var _slots$sources;

      if (!normalisedSrc.value.src || state.value === 'idle') return;
      const img = (0,vue__WEBPACK_IMPORTED_MODULE_0__.h)('img', {
        class: ['v-img__img', containClasses.value],
        src: normalisedSrc.value.src,
        srcset: normalisedSrc.value.srcset,
        sizes: props.sizes,
        ref: image,
        onLoad,
        onError
      });
      const sources = (_slots$sources = slots.sources) == null ? void 0 : _slots$sources.call(slots);
      return (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(_composables_transition_mjs__WEBPACK_IMPORTED_MODULE_4__.MaybeTransition, {
        "transition": props.transition,
        "appear": true
      }, {
        default: () => [(0,vue__WEBPACK_IMPORTED_MODULE_0__.withDirectives)(sources ? (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("picture", {
          "class": "v-img__picture"
        }, [sources, img]) : img, [[vue__WEBPACK_IMPORTED_MODULE_0__.vShow, state.value === 'loaded']])]
      });
    });

    const __preloadImage = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(_composables_transition_mjs__WEBPACK_IMPORTED_MODULE_4__.MaybeTransition, {
      "transition": props.transition
    }, {
      default: () => [normalisedSrc.value.lazySrc && state.value !== 'loaded' && (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("img", {
        "class": ['v-img__img', 'v-img__img--preload', containClasses.value],
        "src": normalisedSrc.value.lazySrc,
        "alt": ""
      }, null)]
    }));

    const __placeholder = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
      if (!slots.placeholder) return;
      return (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(_composables_transition_mjs__WEBPACK_IMPORTED_MODULE_4__.MaybeTransition, {
        "transition": props.transition,
        "appear": true
      }, {
        default: () => [(state.value === 'loading' || state.value === 'error' && !slots.error) && (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", {
          "class": "v-img__placeholder"
        }, [slots.placeholder()])]
      });
    });

    const __error = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
      if (!slots.error) return;
      return (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(_composables_transition_mjs__WEBPACK_IMPORTED_MODULE_4__.MaybeTransition, {
        "transition": props.transition,
        "appear": true
      }, {
        default: () => [state.value === 'error' && (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", {
          "class": "v-img__error"
        }, [slots.error()])]
      });
    });

    const __gradient = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
      if (!props.gradient) return;
      return (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", {
        "class": "v-img__gradient",
        "style": {
          backgroundImage: `linear-gradient(${props.gradient})`
        }
      }, null);
    });

    const isBooted = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)(false);
    {
      const stop = (0,vue__WEBPACK_IMPORTED_MODULE_0__.watch)(aspectRatio, val => {
        if (val) {
          // Doesn't work with nextTick, idk why
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              isBooted.value = true;
            });
          });
          stop();
        }
      });
    }
    (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_6__.useRender)(() => (0,vue__WEBPACK_IMPORTED_MODULE_0__.withDirectives)((0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(_VResponsive_index_mjs__WEBPACK_IMPORTED_MODULE_7__.VResponsive, {
      "class": ['v-img', {
        'v-img--booting': !isBooted.value
      }],
      "style": {
        width: (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_8__.convertToUnit)(props.width === 'auto' ? naturalWidth.value : props.width)
      },
      "aspectRatio": aspectRatio.value,
      "aria-label": props.alt,
      "role": props.alt ? 'img' : undefined
    }, {
      additional: () => [__image.value, __preloadImage.value, __gradient.value, __placeholder.value, __error.value],
      default: slots.default
    }), [[(0,vue__WEBPACK_IMPORTED_MODULE_0__.resolveDirective)("intersect"), {
      handler: init,
      options: props.options
    }, null, {
      once: true
    }]]));
    return {
      currentSrc,
      image,
      state,
      naturalWidth,
      naturalHeight
    };
  }

});

/***/ }),

/***/ "./node_modules/vuetify/lib/components/VMain/VMain.mjs":
/*!*************************************************************!*\
  !*** ./node_modules/vuetify/lib/components/VMain/VMain.mjs ***!
  \*************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VMain": function() { return /* binding */ VMain; }
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _VMain_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./VMain.css */ "./node_modules/vuetify/lib/components/VMain/VMain.css");
/* harmony import */ var _composables_tag_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../composables/tag.mjs */ "./node_modules/vuetify/lib/composables/tag.mjs");
/* harmony import */ var _composables_layout_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../composables/layout.mjs */ "./node_modules/vuetify/lib/composables/layout.mjs");
/* harmony import */ var _composables_ssrBoot_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../composables/ssrBoot.mjs */ "./node_modules/vuetify/lib/composables/ssrBoot.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../util/index.mjs */ "./node_modules/vuetify/lib/util/defineComponent.mjs");
 // Styles

 // Composables



 // Utilities


const VMain = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.defineComponent)({
  name: 'VMain',
  props: (0,_composables_tag_mjs__WEBPACK_IMPORTED_MODULE_3__.makeTagProps)({
    tag: 'main'
  }),

  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      mainStyles
    } = (0,_composables_layout_mjs__WEBPACK_IMPORTED_MODULE_4__.useLayout)();
    const {
      ssrBootStyles
    } = (0,_composables_ssrBoot_mjs__WEBPACK_IMPORTED_MODULE_5__.useSsrBoot)();
    return () => {
      var _slots$default;

      return (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(props.tag, {
        "class": "v-main",
        "style": [mainStyles.value, ssrBootStyles.value]
      }, {
        default: () => [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", {
          "class": "v-main__wrap"
        }, [(_slots$default = slots.default) == null ? void 0 : _slots$default.call(slots)])]
      });
    };
  }

});

/***/ }),

/***/ "./node_modules/vuetify/lib/components/VNavigationDrawer/VNavigationDrawer.mjs":
/*!*************************************************************************************!*\
  !*** ./node_modules/vuetify/lib/components/VNavigationDrawer/VNavigationDrawer.mjs ***!
  \*************************************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VNavigationDrawer": function() { return /* binding */ VNavigationDrawer; }
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _VNavigationDrawer_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./VNavigationDrawer.css */ "./node_modules/vuetify/lib/components/VNavigationDrawer/VNavigationDrawer.css");
/* harmony import */ var _composables_border_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../composables/border.mjs */ "./node_modules/vuetify/lib/composables/border.mjs");
/* harmony import */ var _composables_elevation_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../composables/elevation.mjs */ "./node_modules/vuetify/lib/composables/elevation.mjs");
/* harmony import */ var _composables_layout_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../composables/layout.mjs */ "./node_modules/vuetify/lib/composables/layout.mjs");
/* harmony import */ var _composables_rounded_mjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../composables/rounded.mjs */ "./node_modules/vuetify/lib/composables/rounded.mjs");
/* harmony import */ var _composables_tag_mjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../composables/tag.mjs */ "./node_modules/vuetify/lib/composables/tag.mjs");
/* harmony import */ var _composables_theme_mjs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../composables/theme.mjs */ "./node_modules/vuetify/lib/composables/theme.mjs");
/* harmony import */ var _composables_color_mjs__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../composables/color.mjs */ "./node_modules/vuetify/lib/composables/color.mjs");
/* harmony import */ var _composables_display_mjs__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../composables/display.mjs */ "./node_modules/vuetify/lib/composables/display.mjs");
/* harmony import */ var _composables_proxiedModel_mjs__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../composables/proxiedModel.mjs */ "./node_modules/vuetify/lib/composables/proxiedModel.mjs");
/* harmony import */ var _composables_router_mjs__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../composables/router.mjs */ "./node_modules/vuetify/lib/composables/router.mjs");
/* harmony import */ var _touch_mjs__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./touch.mjs */ "./node_modules/vuetify/lib/components/VNavigationDrawer/touch.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../util/index.mjs */ "./node_modules/vuetify/lib/util/defineComponent.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../util/index.mjs */ "./node_modules/vuetify/lib/util/helpers.mjs");
 // Styles

 // Composables











 // Utilities


 // Types

const VNavigationDrawer = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.defineComponent)({
  name: 'VNavigationDrawer',
  props: {
    color: String,
    disableResizeWatcher: Boolean,
    disableRouteWatcher: Boolean,
    expandOnHover: Boolean,
    floating: Boolean,
    modelValue: {
      type: Boolean,
      default: null
    },
    permanent: Boolean,
    rail: Boolean,
    railWidth: {
      type: [Number, String],
      default: 72
    },
    image: String,
    temporary: Boolean,
    touchless: Boolean,
    width: {
      type: [Number, String],
      default: 256
    },
    position: {
      type: String,
      default: 'left',
      validator: value => ['left', 'right', 'bottom'].includes(value)
    },
    ...(0,_composables_border_mjs__WEBPACK_IMPORTED_MODULE_3__.makeBorderProps)(),
    ...(0,_composables_elevation_mjs__WEBPACK_IMPORTED_MODULE_4__.makeElevationProps)(),
    ...(0,_composables_layout_mjs__WEBPACK_IMPORTED_MODULE_5__.makeLayoutItemProps)(),
    ...(0,_composables_rounded_mjs__WEBPACK_IMPORTED_MODULE_6__.makeRoundedProps)(),
    ...(0,_composables_tag_mjs__WEBPACK_IMPORTED_MODULE_7__.makeTagProps)({
      tag: 'nav'
    }),
    ...(0,_composables_theme_mjs__WEBPACK_IMPORTED_MODULE_8__.makeThemeProps)()
  },
  emits: {
    'update:modelValue': val => true
  },

  setup(props, _ref) {
    let {
      attrs,
      slots
    } = _ref;
    const {
      themeClasses
    } = (0,_composables_theme_mjs__WEBPACK_IMPORTED_MODULE_8__.provideTheme)(props);
    const {
      borderClasses
    } = (0,_composables_border_mjs__WEBPACK_IMPORTED_MODULE_3__.useBorder)(props);
    const {
      backgroundColorClasses,
      backgroundColorStyles
    } = (0,_composables_color_mjs__WEBPACK_IMPORTED_MODULE_9__.useBackgroundColor)((0,vue__WEBPACK_IMPORTED_MODULE_0__.toRef)(props, 'color'));
    const {
      elevationClasses
    } = (0,_composables_elevation_mjs__WEBPACK_IMPORTED_MODULE_4__.useElevation)(props);
    const {
      mobile
    } = (0,_composables_display_mjs__WEBPACK_IMPORTED_MODULE_10__.useDisplay)();
    const {
      roundedClasses
    } = (0,_composables_rounded_mjs__WEBPACK_IMPORTED_MODULE_6__.useRounded)(props);
    const router = (0,_composables_router_mjs__WEBPACK_IMPORTED_MODULE_11__.useRouter)();
    const isActive = (0,_composables_proxiedModel_mjs__WEBPACK_IMPORTED_MODULE_12__.useProxiedModel)(props, 'modelValue');
    const isHovering = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)(false);
    const width = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
      return props.rail && props.expandOnHover && isHovering.value ? Number(props.width) : Number(props.rail ? props.railWidth : props.width);
    });
    const isTemporary = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => !props.permanent && (mobile.value || props.temporary));

    if (!props.disableResizeWatcher) {
      (0,vue__WEBPACK_IMPORTED_MODULE_0__.watch)(mobile, val => !props.permanent && (isActive.value = !val));
    }

    if (!props.disableRouteWatcher && router) {
      (0,vue__WEBPACK_IMPORTED_MODULE_0__.watch)(() => router.currentRoute.value, () => isTemporary.value && (isActive.value = false));
    }

    (0,vue__WEBPACK_IMPORTED_MODULE_0__.watch)(props, val => {
      if (val.permanent) isActive.value = true;
    });
    (0,vue__WEBPACK_IMPORTED_MODULE_0__.onBeforeMount)(() => {
      if (props.modelValue != null) return;
      isActive.value = props.permanent || !mobile.value;
    });
    const rootEl = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)();
    const {
      isDragging,
      dragProgress,
      dragStyles
    } = (0,_touch_mjs__WEBPACK_IMPORTED_MODULE_13__.useTouch)({
      isActive,
      isTemporary,
      width,
      touchless: (0,vue__WEBPACK_IMPORTED_MODULE_0__.toRef)(props, 'touchless'),
      position: (0,vue__WEBPACK_IMPORTED_MODULE_0__.toRef)(props, 'position')
    });
    const layoutSize = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
      const size = isTemporary.value ? 0 : props.rail && props.expandOnHover ? Number(props.railWidth) : width.value;
      return isDragging.value ? size * dragProgress.value : size;
    });
    const {
      layoutItemStyles,
      layoutRect,
      layoutItemScrimStyles
    } = (0,_composables_layout_mjs__WEBPACK_IMPORTED_MODULE_5__.useLayoutItem)({
      id: props.name,
      priority: (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => parseInt(props.priority, 10)),
      position: (0,vue__WEBPACK_IMPORTED_MODULE_0__.toRef)(props, 'position'),
      layoutSize,
      elementSize: width,
      active: (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => isActive.value || isDragging.value),
      disableTransitions: (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => isDragging.value),
      absolute: (0,vue__WEBPACK_IMPORTED_MODULE_0__.toRef)(props, 'absolute')
    });
    const scrimStyles = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => ({ ...(isDragging.value ? {
        opacity: dragProgress.value * 0.2,
        transition: 'none'
      } : undefined),
      ...(layoutRect.value ? {
        left: (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_14__.convertToUnit)(layoutRect.value.left),
        right: (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_14__.convertToUnit)(layoutRect.value.right),
        top: (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_14__.convertToUnit)(layoutRect.value.top),
        bottom: (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_14__.convertToUnit)(layoutRect.value.bottom)
      } : undefined),
      ...layoutItemScrimStyles.value
    }));
    return () => {
      var _slots$image, _slots$prepend, _slots$default, _slots$append;

      const hasImage = slots.image || props.image;
      return (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(vue__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(props.tag, (0,vue__WEBPACK_IMPORTED_MODULE_0__.mergeProps)({
        "ref": rootEl,
        "onMouseenter": () => isHovering.value = true,
        "onMouseleave": () => isHovering.value = false,
        "class": ['v-navigation-drawer', {
          'v-navigation-drawer--bottom': props.position === 'bottom',
          'v-navigation-drawer--end': props.position === 'right',
          'v-navigation-drawer--expand-on-hover': props.expandOnHover,
          'v-navigation-drawer--floating': props.floating,
          'v-navigation-drawer--is-hovering': isHovering.value,
          'v-navigation-drawer--rail': props.rail,
          'v-navigation-drawer--start': props.position === 'left',
          'v-navigation-drawer--temporary': isTemporary.value,
          'v-navigation-drawer--active': isActive.value
        }, themeClasses.value, backgroundColorClasses.value, borderClasses.value, elevationClasses.value, roundedClasses.value],
        "style": [backgroundColorStyles.value, layoutItemStyles.value, dragStyles.value]
      }, attrs), {
        default: () => [hasImage && (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", {
          "class": "v-navigation-drawer__img"
        }, [slots.image ? (_slots$image = slots.image) == null ? void 0 : _slots$image.call(slots, {
          image: props.image
        }) : (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("img", {
          "src": props.image,
          "alt": ""
        }, null)]), slots.prepend && (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", {
          "class": "v-navigation-drawer__prepend"
        }, [(_slots$prepend = slots.prepend) == null ? void 0 : _slots$prepend.call(slots)]), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", {
          "class": "v-navigation-drawer__content"
        }, [(_slots$default = slots.default) == null ? void 0 : _slots$default.call(slots)]), slots.append && (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", {
          "class": "v-navigation-drawer__append"
        }, [(_slots$append = slots.append) == null ? void 0 : _slots$append.call(slots)])]
      }), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(vue__WEBPACK_IMPORTED_MODULE_0__.Transition, {
        "name": "fade-transition"
      }, {
        default: () => [isTemporary.value && (isDragging.value || isActive.value) && (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", {
          "class": "v-navigation-drawer__scrim",
          "style": scrimStyles.value,
          "onClick": () => isActive.value = false
        }, null)]
      })]);
    };
  }

});

/***/ }),

/***/ "./node_modules/vuetify/lib/components/VNavigationDrawer/touch.mjs":
/*!*************************************************************************!*\
  !*** ./node_modules/vuetify/lib/components/VNavigationDrawer/touch.mjs ***!
  \*************************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "useTouch": function() { return /* binding */ useTouch; }
/* harmony export */ });
/* harmony import */ var core_js_modules_es_error_cause_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.error.cause.js */ "./node_modules/core-js/modules/es.error.cause.js");
/* harmony import */ var _composables_touch_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../composables/touch.mjs */ "./node_modules/vuetify/lib/composables/touch.mjs");
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");



function useTouch(_ref) {
  let {
    isActive,
    isTemporary,
    width,
    touchless,
    position
  } = _ref;
  (0,vue__WEBPACK_IMPORTED_MODULE_1__.onMounted)(() => {
    window.addEventListener('touchstart', onTouchstart, {
      passive: true
    });
    window.addEventListener('touchmove', onTouchmove, {
      passive: false
    });
    window.addEventListener('touchend', onTouchend, {
      passive: true
    });
  });
  (0,vue__WEBPACK_IMPORTED_MODULE_1__.onBeforeUnmount)(() => {
    window.removeEventListener('touchstart', onTouchstart);
    window.removeEventListener('touchmove', onTouchmove);
    window.removeEventListener('touchend', onTouchend);
  });
  const isHorizontal = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => position.value !== 'bottom');
  const {
    addMovement,
    endTouch,
    getVelocity
  } = (0,_composables_touch_mjs__WEBPACK_IMPORTED_MODULE_2__.useVelocity)();
  let maybeDragging = false;
  const isDragging = (0,vue__WEBPACK_IMPORTED_MODULE_1__.ref)(false);
  const dragProgress = (0,vue__WEBPACK_IMPORTED_MODULE_1__.ref)(0);
  const offset = (0,vue__WEBPACK_IMPORTED_MODULE_1__.ref)(0);
  let start;

  function getOffset(pos, active) {
    return (position.value === 'left' ? pos : position.value === 'right' ? document.documentElement.clientWidth - pos : position.value === 'bottom' ? document.documentElement.clientHeight - pos : oops()) - (active ? width.value : 0);
  }

  function getProgress(pos) {
    let limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    const progress = position.value === 'left' ? (pos - offset.value) / width.value : position.value === 'right' ? (document.documentElement.clientWidth - pos - offset.value) / width.value : position.value === 'bottom' ? (document.documentElement.clientHeight - pos - offset.value) / width.value : oops();
    return limit ? Math.max(0, Math.min(1, progress)) : progress;
  }

  function onTouchstart(e) {
    if (touchless.value) return;
    const touchX = e.changedTouches[0].clientX;
    const touchY = e.changedTouches[0].clientY;
    const touchZone = 25;
    const inTouchZone = position.value === 'left' ? touchX < touchZone : position.value === 'right' ? touchX > document.documentElement.clientWidth - touchZone : position.value === 'bottom' ? touchY > document.documentElement.clientHeight - touchZone : oops();
    const inElement = isActive.value && (position.value === 'left' ? touchX < width.value : position.value === 'right' ? touchX > document.documentElement.clientWidth - width.value : position.value === 'bottom' ? touchY > document.documentElement.clientHeight - width.value : oops());

    if (inTouchZone || inElement || isActive.value && isTemporary.value) {
      maybeDragging = true;
      start = [touchX, touchY];
      offset.value = getOffset(isHorizontal.value ? touchX : touchY, isActive.value);
      dragProgress.value = getProgress(isHorizontal.value ? touchX : touchY);
      endTouch(e);
      addMovement(e);
    }
  }

  function onTouchmove(e) {
    const touchX = e.changedTouches[0].clientX;
    const touchY = e.changedTouches[0].clientY;

    if (maybeDragging) {
      if (!e.cancelable) {
        maybeDragging = false;
        return;
      }

      const dx = Math.abs(touchX - start[0]);
      const dy = Math.abs(touchY - start[1]);
      const thresholdMet = isHorizontal.value ? dx > dy && dx > 3 : dy > dx && dy > 3;

      if (thresholdMet) {
        isDragging.value = true;
        maybeDragging = false;
      } else if ((isHorizontal.value ? dy : dx) > 3) {
        maybeDragging = false;
      }
    }

    if (!isDragging.value) return;
    e.preventDefault();
    addMovement(e);
    const progress = getProgress(isHorizontal.value ? touchX : touchY, false);
    dragProgress.value = Math.max(0, Math.min(1, progress));

    if (progress > 1) {
      offset.value = getOffset(isHorizontal.value ? touchX : touchY, true);
    } else if (progress < 0) {
      offset.value = getOffset(isHorizontal.value ? touchX : touchY, false);
    }
  }

  function onTouchend(e) {
    maybeDragging = false;
    if (!isDragging.value) return;
    addMovement(e);
    isDragging.value = false;
    const velocity = getVelocity(e.changedTouches[0].identifier);
    const vx = Math.abs(velocity.x);
    const vy = Math.abs(velocity.y);
    const thresholdMet = isHorizontal.value ? vx > vy && vx > 400 : vy > vx && vy > 3;

    if (thresholdMet) {
      isActive.value = velocity.direction === ({
        left: 'right',
        right: 'left',
        bottom: 'up'
      }[position.value] || oops());
    } else {
      isActive.value = dragProgress.value > 0.5;
    }
  }

  const dragStyles = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => {
    return isDragging.value ? {
      transform: position.value === 'left' ? `translateX(calc(-100% + ${dragProgress.value * width.value}px))` : position.value === 'right' ? `translateX(calc(100% - ${dragProgress.value * width.value}px))` : position.value === 'bottom' ? `translateY(calc(100% - ${dragProgress.value * width.value}px))` : oops(),
      transition: 'none'
    } : undefined;
  });
  return {
    isDragging,
    dragProgress,
    dragStyles
  };
}

function oops() {
  throw new Error();
}

/***/ }),

/***/ "./node_modules/vuetify/lib/components/VResponsive/VResponsive.mjs":
/*!*************************************************************************!*\
  !*** ./node_modules/vuetify/lib/components/VResponsive/VResponsive.mjs ***!
  \*************************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "useAspectStyles": function() { return /* binding */ useAspectStyles; },
/* harmony export */   "VResponsive": function() { return /* binding */ VResponsive; }
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _VResponsive_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./VResponsive.css */ "./node_modules/vuetify/lib/components/VResponsive/VResponsive.css");
/* harmony import */ var _composables_dimensions_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../composables/dimensions.mjs */ "./node_modules/vuetify/lib/composables/dimensions.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../util/index.mjs */ "./node_modules/vuetify/lib/util/defineComponent.mjs");
 // Styles

 // Composables

 // Utilities



function useAspectStyles(props) {
  return {
    aspectStyles: (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
      const ratio = Number(props.aspectRatio);
      return ratio ? {
        paddingBottom: String(1 / ratio * 100) + '%'
      } : undefined;
    })
  };
}
const VResponsive = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.defineComponent)({
  name: 'VResponsive',
  props: {
    aspectRatio: [String, Number],
    contentClass: String,
    ...(0,_composables_dimensions_mjs__WEBPACK_IMPORTED_MODULE_3__.makeDimensionProps)()
  },

  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      dimensionStyles
    } = (0,_composables_dimensions_mjs__WEBPACK_IMPORTED_MODULE_3__.useDimension)(props);
    const {
      aspectStyles
    } = useAspectStyles(props);
    return () => {
      var _slots$additional;

      return (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", {
        "class": "v-responsive",
        "style": dimensionStyles.value
      }, [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", {
        "class": "v-responsive__sizer",
        "style": aspectStyles.value
      }, null), (_slots$additional = slots.additional) == null ? void 0 : _slots$additional.call(slots), slots.default && (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)("div", {
        "class": ['v-responsive__content', props.contentClass]
      }, [slots.default()])]);
    };
  }

});

/***/ }),

/***/ "./node_modules/vuetify/lib/composables/border.mjs":
/*!*********************************************************!*\
  !*** ./node_modules/vuetify/lib/composables/border.mjs ***!
  \*********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "makeBorderProps": function() { return /* binding */ makeBorderProps; },
/* harmony export */   "useBorder": function() { return /* binding */ useBorder; }
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/propsFactory.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/getCurrentInstance.mjs");
// Utilities

 // Types
// Composables

const makeBorderProps = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_1__.propsFactory)({
  border: [Boolean, Number, String]
}, 'border');
function useBorder(props) {
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.getCurrentInstanceName)();
  const borderClasses = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
    const classes = [];

    if (props.border != null && props.border !== false) {
      classes.push(`${name}--border`);
    }

    if (typeof props.border === 'string' && props.border !== '' || props.border === 0) {
      for (const value of String(props.border).split(' ')) {
        classes.push(`border-${value}`);
      }
    }

    return classes;
  });
  return {
    borderClasses
  };
}

/***/ }),

/***/ "./node_modules/vuetify/lib/composables/color.mjs":
/*!********************************************************!*\
  !*** ./node_modules/vuetify/lib/composables/color.mjs ***!
  \********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "useColor": function() { return /* binding */ useColor; },
/* harmony export */   "useTextColor": function() { return /* binding */ useTextColor; },
/* harmony export */   "useBackgroundColor": function() { return /* binding */ useBackgroundColor; }
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/colorUtils.mjs");
// Utilities

 // Types
// Composables

function useColor(colors) {
  const backgroundIsCssColor = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_1__.isCssColor)(colors.value.background));
  const textIsCssColor = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_1__.isCssColor)(colors.value.text));
  const colorClasses = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
    const classes = [];

    if (colors.value.background && !backgroundIsCssColor.value) {
      classes.push(`bg-${colors.value.background}`);
    }

    if (colors.value.text && !textIsCssColor.value) {
      classes.push(`text-${colors.value.text}`);
    }

    return classes;
  });
  const colorStyles = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
    const styles = {};

    if (colors.value.background && backgroundIsCssColor.value) {
      styles.backgroundColor = colors.value.background;
    }

    if (colors.value.text && textIsCssColor.value) {
      styles.color = colors.value.text;
      styles.caretColor = colors.value.text;
    }

    return styles;
  });
  return {
    colorClasses,
    colorStyles
  };
}
function useTextColor(props, name) {
  const colors = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => ({
    text: (0,vue__WEBPACK_IMPORTED_MODULE_0__.isRef)(props) ? props.value : name ? props[name] : null
  }));
  const {
    colorClasses: textColorClasses,
    colorStyles: textColorStyles
  } = useColor(colors);
  return {
    textColorClasses,
    textColorStyles
  };
}
function useBackgroundColor(props, name) {
  const colors = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => ({
    background: (0,vue__WEBPACK_IMPORTED_MODULE_0__.isRef)(props) ? props.value : name ? props[name] : null
  }));
  const {
    colorClasses: backgroundColorClasses,
    colorStyles: backgroundColorStyles
  } = useColor(colors);
  return {
    backgroundColorClasses,
    backgroundColorStyles
  };
}

/***/ }),

/***/ "./node_modules/vuetify/lib/composables/defaults.mjs":
/*!***********************************************************!*\
  !*** ./node_modules/vuetify/lib/composables/defaults.mjs ***!
  \***********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DefaultsSymbol": function() { return /* binding */ DefaultsSymbol; },
/* harmony export */   "createDefaults": function() { return /* binding */ createDefaults; },
/* harmony export */   "useDefaults": function() { return /* binding */ useDefaults; },
/* harmony export */   "provideDefaults": function() { return /* binding */ provideDefaults; }
/* harmony export */ });
/* harmony import */ var core_js_modules_es_error_cause_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.error.cause.js */ "./node_modules/core-js/modules/es.error.cause.js");
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/helpers.mjs");

// Utilities

 // Types

const DefaultsSymbol = Symbol.for('vuetify:defaults');
function createDefaults(options) {
  return (0,vue__WEBPACK_IMPORTED_MODULE_1__.ref)(options != null ? options : {});
}
function useDefaults() {
  const defaults = (0,vue__WEBPACK_IMPORTED_MODULE_1__.inject)(DefaultsSymbol);
  if (!defaults) throw new Error('[Vuetify] Could not find defaults instance');
  return defaults;
}
function provideDefaults(defaults, options) {
  const injectedDefaults = useDefaults();
  const providedDefaults = (0,vue__WEBPACK_IMPORTED_MODULE_1__.ref)(defaults);
  const newDefaults = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => {
    const scoped = (0,vue__WEBPACK_IMPORTED_MODULE_1__.unref)(options == null ? void 0 : options.scoped);
    const reset = (0,vue__WEBPACK_IMPORTED_MODULE_1__.unref)(options == null ? void 0 : options.reset);
    const root = (0,vue__WEBPACK_IMPORTED_MODULE_1__.unref)(options == null ? void 0 : options.root);
    let properties = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.mergeDeep)(providedDefaults.value, {
      prev: injectedDefaults.value
    });
    if (scoped) return properties;

    if (reset || root) {
      const len = Number(reset || Infinity);

      for (let i = 0; i <= len; i++) {
        if (!properties.prev) break;
        properties = properties.prev;
      }

      return properties;
    }

    return (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.mergeDeep)(properties, properties.prev);
  });
  (0,vue__WEBPACK_IMPORTED_MODULE_1__.provide)(DefaultsSymbol, newDefaults);
  return newDefaults;
}

/***/ }),

/***/ "./node_modules/vuetify/lib/composables/density.mjs":
/*!**********************************************************!*\
  !*** ./node_modules/vuetify/lib/composables/density.mjs ***!
  \**********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "makeDensityProps": function() { return /* binding */ makeDensityProps; },
/* harmony export */   "useDensity": function() { return /* binding */ useDensity; }
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/propsFactory.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/getCurrentInstance.mjs");
// Utilities

 // Types

const allowedDensities = [null, 'default', 'comfortable', 'compact']; // Composables

const makeDensityProps = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_1__.propsFactory)({
  density: {
    type: String,
    default: 'default',
    validator: v => allowedDensities.includes(v)
  }
}, 'density');
function useDensity(props) {
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.getCurrentInstanceName)();
  const densityClasses = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
    return `${name}--density-${props.density}`;
  });
  return {
    densityClasses
  };
}

/***/ }),

/***/ "./node_modules/vuetify/lib/composables/dimensions.mjs":
/*!*************************************************************!*\
  !*** ./node_modules/vuetify/lib/composables/dimensions.mjs ***!
  \*************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "makeDimensionProps": function() { return /* binding */ makeDimensionProps; },
/* harmony export */   "useDimension": function() { return /* binding */ useDimension; }
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/propsFactory.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/helpers.mjs");
// Utilities

 // Types
// Composables

const makeDimensionProps = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_1__.propsFactory)({
  height: [Number, String],
  maxHeight: [Number, String],
  maxWidth: [Number, String],
  minHeight: [Number, String],
  minWidth: [Number, String],
  width: [Number, String]
}, 'dimension');
function useDimension(props) {
  const dimensionStyles = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => ({
    height: (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.convertToUnit)(props.height),
    maxHeight: (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.convertToUnit)(props.maxHeight),
    maxWidth: (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.convertToUnit)(props.maxWidth),
    minHeight: (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.convertToUnit)(props.minHeight),
    minWidth: (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.convertToUnit)(props.minWidth),
    width: (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.convertToUnit)(props.width)
  }));
  return {
    dimensionStyles
  };
}

/***/ }),

/***/ "./node_modules/vuetify/lib/composables/display.mjs":
/*!**********************************************************!*\
  !*** ./node_modules/vuetify/lib/composables/display.mjs ***!
  \**********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DisplaySymbol": function() { return /* binding */ DisplaySymbol; },
/* harmony export */   "createDisplay": function() { return /* binding */ createDisplay; },
/* harmony export */   "useDisplay": function() { return /* binding */ useDisplay; }
/* harmony export */ });
/* harmony import */ var core_js_modules_es_error_cause_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.error.cause.js */ "./node_modules/core-js/modules/es.error.cause.js");
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/helpers.mjs");
/* harmony import */ var _util_globals_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/globals.mjs */ "./node_modules/vuetify/lib/util/globals.mjs");

// Utilities

 // Globals

 // Types

const DisplaySymbol = Symbol.for('vuetify:display');
const defaultDisplayOptions = {
  mobileBreakpoint: 'lg',
  thresholds: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
    xxl: 2560
  }
};

const parseDisplayOptions = function () {
  let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultDisplayOptions;
  return (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.mergeDeep)(defaultDisplayOptions, options);
}; // Cross-browser support as described in:
// https://stackoverflow.com/questions/1248081


function getClientWidth() {
  return _util_globals_mjs__WEBPACK_IMPORTED_MODULE_3__.IN_BROWSER ? Math.max(document.documentElement.clientWidth, window.innerWidth) : 0; // SSR
}

function getClientHeight() {
  return _util_globals_mjs__WEBPACK_IMPORTED_MODULE_3__.IN_BROWSER ? Math.max(document.documentElement.clientHeight, window.innerHeight) : 0; // SSR
}

function getPlatform() {
  const userAgent = _util_globals_mjs__WEBPACK_IMPORTED_MODULE_3__.IN_BROWSER ? window.navigator.userAgent : 'ssr';

  function match(regexp) {
    return Boolean(userAgent.match(regexp));
  }

  const android = match(/android/i);
  const ios = match(/iphone|ipad|ipod/i);
  const cordova = match(/cordova/i);
  const electron = match(/electron/i);
  const chrome = match(/chrome/i);
  const edge = match(/edge/i);
  const firefox = match(/firefox/i);
  const opera = match(/opera/i);
  const win = match(/win/i);
  const mac = match(/mac/i);
  const linux = match(/linux/i);
  const ssr = match(/ssr/i);
  return {
    android,
    ios,
    cordova,
    electron,
    chrome,
    edge,
    firefox,
    opera,
    win,
    mac,
    linux,
    touch: _util_globals_mjs__WEBPACK_IMPORTED_MODULE_3__.SUPPORTS_TOUCH,
    ssr
  };
}

function createDisplay(options) {
  const {
    thresholds,
    mobileBreakpoint
  } = parseDisplayOptions(options);
  const height = (0,vue__WEBPACK_IMPORTED_MODULE_1__.ref)(getClientHeight());
  const platform = getPlatform();
  const state = (0,vue__WEBPACK_IMPORTED_MODULE_1__.reactive)({});
  const width = (0,vue__WEBPACK_IMPORTED_MODULE_1__.ref)(getClientWidth());

  function onResize() {
    height.value = getClientHeight();
    width.value = getClientWidth();
  } // eslint-disable-next-line max-statements


  (0,vue__WEBPACK_IMPORTED_MODULE_1__.watchEffect)(() => {
    const xs = width.value < thresholds.sm;
    const sm = width.value < thresholds.md && !xs;
    const md = width.value < thresholds.lg && !(sm || xs);
    const lg = width.value < thresholds.xl && !(md || sm || xs);
    const xl = width.value < thresholds.xxl && !(lg || md || sm || xs);
    const xxl = width.value >= thresholds.xxl;
    const name = xs ? 'xs' : sm ? 'sm' : md ? 'md' : lg ? 'lg' : xl ? 'xl' : 'xxl';
    const breakpointValue = typeof mobileBreakpoint === 'number' ? mobileBreakpoint : thresholds[mobileBreakpoint];
    const mobile = !platform.ssr ? width.value < breakpointValue : platform.android || platform.ios || platform.opera;
    state.xs = xs;
    state.sm = sm;
    state.md = md;
    state.lg = lg;
    state.xl = xl;
    state.xxl = xxl;
    state.smAndUp = !xs;
    state.mdAndUp = !(xs || sm);
    state.lgAndUp = !(xs || sm || md);
    state.xlAndUp = !(xs || sm || md || lg);
    state.smAndDown = !(md || lg || xl || xxl);
    state.mdAndDown = !(lg || xl || xxl);
    state.lgAndDown = !(xl || xxl);
    state.xlAndDown = !xxl;
    state.name = name;
    state.height = height.value;
    state.width = width.value;
    state.mobile = mobile;
    state.mobileBreakpoint = mobileBreakpoint;
    state.platform = platform;
    state.thresholds = thresholds;
  });

  if (_util_globals_mjs__WEBPACK_IMPORTED_MODULE_3__.IN_BROWSER) {
    window.addEventListener('resize', onResize, {
      passive: true
    });
  }

  return (0,vue__WEBPACK_IMPORTED_MODULE_1__.toRefs)(state);
}
function useDisplay() {
  const display = (0,vue__WEBPACK_IMPORTED_MODULE_1__.inject)(DisplaySymbol);
  if (!display) throw new Error('Could not find Vuetify display injection');
  return display;
}

/***/ }),

/***/ "./node_modules/vuetify/lib/composables/elevation.mjs":
/*!************************************************************!*\
  !*** ./node_modules/vuetify/lib/composables/elevation.mjs ***!
  \************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "makeElevationProps": function() { return /* binding */ makeElevationProps; },
/* harmony export */   "useElevation": function() { return /* binding */ useElevation; }
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/propsFactory.mjs");
// Utilities

 // Types
// Composables

const makeElevationProps = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_1__.propsFactory)({
  elevation: {
    type: [Number, String],

    validator(v) {
      const value = parseInt(v);
      return !isNaN(value) && value >= 0 && // Material Design has a maximum elevation of 24
      // https://material.io/design/environment/elevation.html#default-elevations
      value <= 24;
    }

  }
}, 'elevation');
function useElevation(props) {
  const elevationClasses = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
    const elevation = (0,vue__WEBPACK_IMPORTED_MODULE_0__.isRef)(props) ? props.value : props.elevation;
    const classes = [];
    if (elevation == null) return classes;
    classes.push(`elevation-${elevation}`);
    return classes;
  });
  return {
    elevationClasses
  };
}

/***/ }),

/***/ "./node_modules/vuetify/lib/composables/icons.mjs":
/*!********************************************************!*\
  !*** ./node_modules/vuetify/lib/composables/icons.mjs ***!
  \********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "IconSymbol": function() { return /* binding */ IconSymbol; },
/* harmony export */   "makeIconProps": function() { return /* binding */ makeIconProps; },
/* harmony export */   "VComponentIcon": function() { return /* binding */ VComponentIcon; },
/* harmony export */   "VSvgIcon": function() { return /* binding */ VSvgIcon; },
/* harmony export */   "VLigatureIcon": function() { return /* binding */ VLigatureIcon; },
/* harmony export */   "VClassIcon": function() { return /* binding */ VClassIcon; },
/* harmony export */   "defaultSets": function() { return /* binding */ defaultSets; },
/* harmony export */   "useIcon": function() { return /* binding */ useIcon; }
/* harmony export */ });
/* harmony import */ var core_js_modules_es_error_cause_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.error.cause.js */ "./node_modules/core-js/modules/es.error.cause.js");
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/propsFactory.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/defineComponent.mjs");

 // Utilities


 // Types

const IconSymbol = Symbol.for('vuetify:icons');
const makeIconProps = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.propsFactory)({
  icon: {
    type: [String, Object],
    required: true
  },
  // Could not remove this and use makeTagProps, types complained because it is not required
  tag: {
    type: String,
    required: true
  }
}, 'icon');
const VComponentIcon = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_3__.defineComponent)({
  name: 'VComponentIcon',
  props: makeIconProps(),

  setup(props) {
    return () => {
      return (0,vue__WEBPACK_IMPORTED_MODULE_1__.createVNode)(props.tag, null, {
        default: () => [(0,vue__WEBPACK_IMPORTED_MODULE_1__.createVNode)(props.icon, null, null)]
      });
    };
  }

});
const VSvgIcon = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_3__.defineComponent)({
  name: 'VSvgIcon',
  inheritAttrs: false,
  props: makeIconProps(),

  setup(props, _ref) {
    let {
      attrs
    } = _ref;
    return () => {
      return (0,vue__WEBPACK_IMPORTED_MODULE_1__.createVNode)(props.tag, (0,vue__WEBPACK_IMPORTED_MODULE_1__.mergeProps)(attrs, {
        "style": null
      }), {
        default: () => [(0,vue__WEBPACK_IMPORTED_MODULE_1__.createVNode)("svg", {
          "class": "v-icon__svg",
          "xmlns": "http://www.w3.org/2000/svg",
          "viewBox": "0 0 24 24",
          "role": "img",
          "aria-hidden": "true"
        }, [(0,vue__WEBPACK_IMPORTED_MODULE_1__.createVNode)("path", {
          "d": props.icon
        }, null)])]
      });
    };
  }

});
const VLigatureIcon = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_3__.defineComponent)({
  name: 'VLigatureIcon',
  props: makeIconProps(),

  setup(props) {
    return () => {
      return (0,vue__WEBPACK_IMPORTED_MODULE_1__.createVNode)(props.tag, null, {
        default: () => [props.icon]
      });
    };
  }

});
const VClassIcon = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_3__.defineComponent)({
  name: 'VClassIcon',
  props: makeIconProps(),

  setup(props) {
    return () => {
      return (0,vue__WEBPACK_IMPORTED_MODULE_1__.createVNode)(props.tag, {
        "class": props.icon
      }, null);
    };
  }

});
const defaultSets = {
  svg: {
    component: VSvgIcon
  },
  class: {
    component: VClassIcon
  }
}; // Composables

const useIcon = props => {
  const icons = (0,vue__WEBPACK_IMPORTED_MODULE_1__.inject)(IconSymbol);
  if (!icons) throw new Error('Missing Vuetify Icons provide!');
  const iconData = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => {
    const iconAlias = (0,vue__WEBPACK_IMPORTED_MODULE_1__.isRef)(props) ? props.value : props.icon;
    if (!iconAlias) throw new Error('Icon value is undefined or null');
    let icon = iconAlias;

    if (typeof iconAlias === 'string' && iconAlias.includes('$')) {
      var _icons$aliases;

      icon = (_icons$aliases = icons.aliases) == null ? void 0 : _icons$aliases[iconAlias.slice(iconAlias.indexOf('$') + 1)];
    }

    if (!icon) throw new Error(`Could not find aliased icon "${iconAlias}"`);

    if (typeof icon !== 'string') {
      return {
        component: VComponentIcon,
        icon
      };
    }

    const iconSetName = Object.keys(icons.sets).find(setName => typeof icon === 'string' && icon.startsWith(`${setName}:`));
    const iconName = iconSetName ? icon.slice(iconSetName.length + 1) : icon;
    const iconSet = icons.sets[iconSetName != null ? iconSetName : icons.defaultSet];
    return {
      component: iconSet.component,
      icon: iconName
    };
  });
  return {
    iconData
  };
};

/***/ }),

/***/ "./node_modules/vuetify/lib/composables/index.mjs":
/*!********************************************************!*\
  !*** ./node_modules/vuetify/lib/composables/index.mjs ***!
  \********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "useDisplay": function() { return /* reexport safe */ _display_mjs__WEBPACK_IMPORTED_MODULE_0__.useDisplay; },
/* harmony export */   "useTheme": function() { return /* reexport safe */ _theme_mjs__WEBPACK_IMPORTED_MODULE_1__.useTheme; },
/* harmony export */   "provideRtl": function() { return /* reexport safe */ _rtl_mjs__WEBPACK_IMPORTED_MODULE_2__.provideRtl; },
/* harmony export */   "useRtl": function() { return /* reexport safe */ _rtl_mjs__WEBPACK_IMPORTED_MODULE_2__.useRtl; },
/* harmony export */   "useLayout": function() { return /* reexport safe */ _layout_mjs__WEBPACK_IMPORTED_MODULE_3__.useLayout; }
/* harmony export */ });
/* harmony import */ var _display_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./display.mjs */ "./node_modules/vuetify/lib/composables/display.mjs");
/* harmony import */ var _theme_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./theme.mjs */ "./node_modules/vuetify/lib/composables/theme.mjs");
/* harmony import */ var _rtl_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./rtl.mjs */ "./node_modules/vuetify/lib/composables/rtl.mjs");
/* harmony import */ var _layout_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./layout.mjs */ "./node_modules/vuetify/lib/composables/layout.mjs");
/*
 * PUBLIC INTERFACES ONLY
 * Imports in our code should be to the composable directly, not this file
 */





/***/ }),

/***/ "./node_modules/vuetify/lib/composables/layout.mjs":
/*!*********************************************************!*\
  !*** ./node_modules/vuetify/lib/composables/layout.mjs ***!
  \*********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VuetifyLayoutKey": function() { return /* binding */ VuetifyLayoutKey; },
/* harmony export */   "makeLayoutProps": function() { return /* binding */ makeLayoutProps; },
/* harmony export */   "makeLayoutItemProps": function() { return /* binding */ makeLayoutItemProps; },
/* harmony export */   "useLayout": function() { return /* binding */ useLayout; },
/* harmony export */   "useOverlay": function() { return /* binding */ useOverlay; },
/* harmony export */   "useLayoutItem": function() { return /* binding */ useLayoutItem; },
/* harmony export */   "createLayout": function() { return /* binding */ createLayout; }
/* harmony export */ });
/* harmony import */ var core_js_modules_es_error_cause_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.error.cause.js */ "./node_modules/core-js/modules/es.error.cause.js");
/* harmony import */ var _resizeObserver_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./resizeObserver.mjs */ "./node_modules/vuetify/lib/composables/resizeObserver.mjs");
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/propsFactory.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/helpers.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/getCurrentInstance.mjs");

// Composables
 // Utilities


 // Types

const VuetifyLayoutKey = Symbol.for('vuetify:layout');
const ROOT_ZINDEX = 1000;
const makeLayoutProps = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.propsFactory)({
  overlaps: {
    type: Array,
    default: () => []
  },
  fullHeight: Boolean
}, 'layout'); // Composables

const makeLayoutItemProps = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.propsFactory)({
  name: {
    type: String
  },
  priority: {
    type: [Number, String],
    default: 0
  },
  absolute: Boolean
}, 'layout-item');
function useLayout() {
  const layout = (0,vue__WEBPACK_IMPORTED_MODULE_1__.inject)(VuetifyLayoutKey);
  if (!layout) throw new Error('Could not find injected Vuetify layout');
  return layout;
}
function useOverlay(isActive) {
  const layout = useLayout();
  const id = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_3__.getUid)();
  (0,vue__WEBPACK_IMPORTED_MODULE_1__.watch)(isActive, value => {
    if (value) {
      layout.overlays.value.push(id);
    } else {
      layout.overlays.value = layout.overlays.value.filter(x => x !== id);
    }
  }, {
    immediate: true
  });
  const overlayZIndex = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => ROOT_ZINDEX + layout.overlays.value.indexOf(id) + 1);
  return {
    overlayZIndex,
    layoutRect: layout.layoutRect
  };
}
function useLayoutItem(options) {
  var _options$id;

  const layout = (0,vue__WEBPACK_IMPORTED_MODULE_1__.inject)(VuetifyLayoutKey);
  if (!layout) throw new Error('Could not find injected Vuetify layout');
  const id = (_options$id = options.id) != null ? _options$id : `layout-item-${(0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_3__.getUid)()}`;
  const vm = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_4__.getCurrentInstance)('useLayoutItem');
  const isKeptAlive = (0,vue__WEBPACK_IMPORTED_MODULE_1__.ref)(false);
  (0,vue__WEBPACK_IMPORTED_MODULE_1__.onDeactivated)(() => isKeptAlive.value = true);
  (0,vue__WEBPACK_IMPORTED_MODULE_1__.onActivated)(() => isKeptAlive.value = false);
  const {
    layoutItemStyles,
    layoutItemScrimStyles
  } = layout.register(vm, { ...options,
    active: (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => isKeptAlive.value ? false : options.active.value),
    id
  });
  (0,vue__WEBPACK_IMPORTED_MODULE_1__.onBeforeUnmount)(() => layout.unregister(id));
  return {
    layoutItemStyles,
    layoutRect: layout.layoutRect,
    layoutItemScrimStyles
  };
}

const generateLayers = (layout, positions, layoutSizes, activeItems) => {
  let previousLayer = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  };
  const layers = [{
    id: '',
    layer: { ...previousLayer
    }
  }];

  for (const id of layout) {
    const position = positions.get(id);
    const amount = layoutSizes.get(id);
    const active = activeItems.get(id);
    if (!position || !amount || !active) continue;
    const layer = { ...previousLayer,
      [position.value]: parseInt(previousLayer[position.value], 10) + (active.value ? parseInt(amount.value, 10) : 0)
    };
    layers.push({
      id,
      layer
    });
    previousLayer = layer;
  }

  return layers;
};

function createLayout(props) {
  const parentLayout = (0,vue__WEBPACK_IMPORTED_MODULE_1__.inject)(VuetifyLayoutKey, null);
  const rootZIndex = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => parentLayout ? parentLayout.rootZIndex.value - 100 : ROOT_ZINDEX);
  const registered = (0,vue__WEBPACK_IMPORTED_MODULE_1__.ref)([]);
  const positions = (0,vue__WEBPACK_IMPORTED_MODULE_1__.reactive)(new Map());
  const layoutSizes = (0,vue__WEBPACK_IMPORTED_MODULE_1__.reactive)(new Map());
  const priorities = (0,vue__WEBPACK_IMPORTED_MODULE_1__.reactive)(new Map());
  const activeItems = (0,vue__WEBPACK_IMPORTED_MODULE_1__.reactive)(new Map());
  const disabledTransitions = (0,vue__WEBPACK_IMPORTED_MODULE_1__.reactive)(new Map());
  const {
    resizeRef,
    contentRect: layoutRect
  } = (0,_resizeObserver_mjs__WEBPACK_IMPORTED_MODULE_5__.useResizeObserver)();
  const overlays = (0,vue__WEBPACK_IMPORTED_MODULE_1__.ref)([]);
  const computedOverlaps = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => {
    var _props$overlaps;

    const map = new Map();
    const overlaps = (_props$overlaps = props.overlaps) != null ? _props$overlaps : [];

    for (const overlap of overlaps.filter(item => item.includes(':'))) {
      const [top, bottom] = overlap.split(':');
      if (!registered.value.includes(top) || !registered.value.includes(bottom)) continue;
      const topPosition = positions.get(top);
      const bottomPosition = positions.get(bottom);
      const topAmount = layoutSizes.get(top);
      const bottomAmount = layoutSizes.get(bottom);
      if (!topPosition || !bottomPosition || !topAmount || !bottomAmount) continue;
      map.set(bottom, {
        position: topPosition.value,
        amount: parseInt(topAmount.value, 10)
      });
      map.set(top, {
        position: bottomPosition.value,
        amount: -parseInt(bottomAmount.value, 10)
      });
    }

    return map;
  });
  const layers = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => {
    const uniquePriorities = [...new Set([...priorities.values()].map(p => p.value))].sort((a, b) => a - b);
    const layout = [];

    for (const p of uniquePriorities) {
      const items = registered.value.filter(id => {
        var _priorities$get;

        return ((_priorities$get = priorities.get(id)) == null ? void 0 : _priorities$get.value) === p;
      });
      layout.push(...items);
    }

    return generateLayers(layout, positions, layoutSizes, activeItems);
  });
  const transitionsEnabled = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => {
    return !Array.from(disabledTransitions.values()).some(ref => ref.value);
  });
  const mainStyles = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => {
    const layer = layers.value[layers.value.length - 1].layer;
    return {
      position: 'relative',
      paddingLeft: (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_3__.convertToUnit)(layer.left),
      paddingRight: (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_3__.convertToUnit)(layer.right),
      paddingTop: (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_3__.convertToUnit)(layer.top),
      paddingBottom: (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_3__.convertToUnit)(layer.bottom),
      ...(transitionsEnabled.value ? undefined : {
        transition: 'none'
      })
    };
  });
  const items = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => {
    return layers.value.slice(1).map((_ref, index) => {
      let {
        id
      } = _ref;
      const {
        layer
      } = layers.value[index];
      const size = layoutSizes.get(id);
      return {
        id,
        ...layer,
        size: Number(size.value)
      };
    });
  });

  const getLayoutItem = id => {
    return items.value.find(item => item.id === id);
  };

  const rootVm = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_4__.getCurrentInstance)('createLayout');
  const isMounted = (0,vue__WEBPACK_IMPORTED_MODULE_1__.ref)(false);
  (0,vue__WEBPACK_IMPORTED_MODULE_1__.onMounted)(() => {
    isMounted.value = true;
  });
  (0,vue__WEBPACK_IMPORTED_MODULE_1__.provide)(VuetifyLayoutKey, {
    register: (vm, _ref2) => {
      let {
        id,
        priority,
        position,
        layoutSize,
        elementSize,
        active,
        disableTransitions,
        absolute
      } = _ref2;
      priorities.set(id, priority);
      positions.set(id, position);
      layoutSizes.set(id, layoutSize);
      activeItems.set(id, active);
      disableTransitions && disabledTransitions.set(id, disableTransitions);
      const instances = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_3__.findChildrenWithProvide)(VuetifyLayoutKey, rootVm == null ? void 0 : rootVm.vnode);
      const instanceIndex = instances.indexOf(vm);
      if (instanceIndex > -1) registered.value.splice(instanceIndex, 0, id);else registered.value.push(id);
      const index = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => items.value.findIndex(i => i.id === id));
      const zIndex = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => rootZIndex.value + layers.value.length * 2 - index.value * 2);
      const layoutItemStyles = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => {
        const isHorizontal = position.value === 'left' || position.value === 'right';
        const isOppositeHorizontal = position.value === 'right';
        const isOppositeVertical = position.value === 'bottom';
        const styles = {
          [position.value]: 0,
          zIndex: zIndex.value,
          transform: `translate${isHorizontal ? 'X' : 'Y'}(${(active.value ? 0 : -110) * (isOppositeHorizontal || isOppositeVertical ? -1 : 1)}%)`,
          position: absolute.value || rootZIndex.value !== ROOT_ZINDEX ? 'absolute' : 'fixed',
          ...(transitionsEnabled.value ? undefined : {
            transition: 'none'
          })
        };
        if (!isMounted.value) return styles;
        if (index.value < 0) throw new Error(`Layout item "${id}" is missing`);
        const item = items.value[index.value];
        if (!item) throw new Error(`Could not find layout item "${id}`);
        const overlap = computedOverlaps.value.get(id);

        if (overlap) {
          item[overlap.position] += overlap.amount;
        }

        return { ...styles,
          height: isHorizontal ? `calc(100% - ${item.top}px - ${item.bottom}px)` : `${elementSize.value}px`,
          marginLeft: isOppositeHorizontal ? undefined : `${item.left}px`,
          marginRight: isOppositeHorizontal ? `${item.right}px` : undefined,
          marginTop: position.value !== 'bottom' ? `${item.top}px` : undefined,
          marginBottom: position.value !== 'top' ? `${item.bottom}px` : undefined,
          width: !isHorizontal ? `calc(100% - ${item.left}px - ${item.right}px)` : `${elementSize.value}px`
        };
      });
      const layoutItemScrimStyles = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => ({
        zIndex: zIndex.value - 1,
        position: rootZIndex.value === ROOT_ZINDEX ? 'fixed' : 'absolute'
      }));
      return {
        layoutItemStyles,
        layoutItemScrimStyles
      };
    },
    unregister: id => {
      priorities.delete(id);
      positions.delete(id);
      layoutSizes.delete(id);
      activeItems.delete(id);
      disabledTransitions.delete(id);
      registered.value = registered.value.filter(v => v !== id);
    },
    mainStyles,
    getLayoutItem,
    items,
    layoutRect,
    rootZIndex,
    overlays
  });
  const layoutClasses = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => ['v-layout', {
    'v-layout--full-height': props.fullHeight
  }]);
  const layoutStyles = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => ({
    zIndex: rootZIndex.value
  }));
  return {
    layoutClasses,
    layoutStyles,
    getLayoutItem,
    items,
    layoutRect,
    layoutRef: resizeRef
  };
}

/***/ }),

/***/ "./node_modules/vuetify/lib/composables/locale.mjs":
/*!*********************************************************!*\
  !*** ./node_modules/vuetify/lib/composables/locale.mjs ***!
  \*********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LocaleAdapterSymbol": function() { return /* binding */ LocaleAdapterSymbol; },
/* harmony export */   "VuetifyLocaleSymbol": function() { return /* binding */ VuetifyLocaleSymbol; },
/* harmony export */   "provideLocale": function() { return /* binding */ provideLocale; },
/* harmony export */   "useLocale": function() { return /* binding */ useLocale; },
/* harmony export */   "createLocaleAdapter": function() { return /* binding */ createLocaleAdapter; },
/* harmony export */   "createDefaultLocaleAdapter": function() { return /* binding */ createDefaultLocaleAdapter; }
/* harmony export */ });
/* harmony import */ var core_js_modules_es_error_cause_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.error.cause.js */ "./node_modules/core-js/modules/es.error.cause.js");
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/helpers.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/console.mjs");
/* harmony import */ var _locale_en_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../locale/en.mjs */ "./node_modules/vuetify/lib/locale/en.mjs");



 // Types

const LocaleAdapterSymbol = Symbol.for('vuetify:locale-adapter');
const VuetifyLocaleSymbol = Symbol.for('vuetify:locale');
function provideLocale(props) {
  const adapter = (0,vue__WEBPACK_IMPORTED_MODULE_1__.inject)(LocaleAdapterSymbol);
  if (!adapter) throw new Error('[Vuetify] Could not find injected locale adapter');
  return adapter.createScope(props);
}
function useLocale() {
  const adapter = (0,vue__WEBPACK_IMPORTED_MODULE_1__.inject)(LocaleAdapterSymbol);
  if (!adapter) throw new Error('[Vuetify] Could not find injected locale adapter');
  return adapter.getScope();
}

function isLocaleAdapter(x) {
  return !!x && x.hasOwnProperty('getScope') && x.hasOwnProperty('createScope') && x.hasOwnProperty('createRoot');
}

function createLocaleAdapter(app, options) {
  const adapter = isLocaleAdapter(options) ? options : createDefaultLocaleAdapter(options);
  const rootInstance = adapter.createRoot(app);
  return {
    adapter,
    rootInstance
  };
}
const LANG_PREFIX = '$vuetify.';

const replace = (str, params) => {
  return str.replace(/\{(\d+)\}/g, (match, index) => {
    /* istanbul ignore next */
    return String(params[+index]);
  });
};

const createTranslateFunction = (current, fallback, messages) => {
  return function (key) {
    for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      params[_key - 1] = arguments[_key];
    }

    if (!key.startsWith(LANG_PREFIX)) {
      return replace(key, params);
    }

    const shortKey = key.replace(LANG_PREFIX, '');
    const currentLocale = current.value && messages.value[current.value];
    const fallbackLocale = fallback.value && messages.value[fallback.value];
    let str = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.getObjectValueByPath)(currentLocale, shortKey, null);

    if (!str) {
      (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_3__.consoleWarn)(`Translation key "${key}" not found in "${current.value}", trying fallback locale`);
      str = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.getObjectValueByPath)(fallbackLocale, shortKey, null);
    }

    if (!str) {
      (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_3__.consoleError)(`Translation key "${key}" not found in fallback`);
      str = key;
    }

    if (typeof str !== 'string') {
      (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_3__.consoleError)(`Translation key "${key}" has a non-string value`);
      str = key;
    }

    return replace(str, params);
  };
};

function createNumberFunction(current, fallback) {
  return (value, options) => {
    const numberFormat = new Intl.NumberFormat([current.value, fallback.value], options);
    return numberFormat.format(value);
  };
}

function createDefaultLocaleAdapter(options) {
  const createScope = options => {
    const current = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.wrapInRef)(options.current);
    const fallback = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.wrapInRef)(options.fallback);
    const messages = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.wrapInRef)(options.messages);
    return {
      current,
      fallback,
      messages,
      t: createTranslateFunction(current, fallback, messages),
      n: createNumberFunction(current, fallback)
    };
  };

  return {
    createRoot: app => {
      var _options$defaultLocal, _options$fallbackLoca, _options$messages;

      const rootScope = createScope({
        current: (_options$defaultLocal = options == null ? void 0 : options.defaultLocale) != null ? _options$defaultLocal : 'en',
        fallback: (_options$fallbackLoca = options == null ? void 0 : options.fallbackLocale) != null ? _options$fallbackLoca : 'en',
        messages: (_options$messages = options == null ? void 0 : options.messages) != null ? _options$messages : {
          en: _locale_en_mjs__WEBPACK_IMPORTED_MODULE_4__["default"]
        }
      });
      app.provide(VuetifyLocaleSymbol, rootScope);
      return rootScope;
    },
    getScope: () => {
      const currentScope = (0,vue__WEBPACK_IMPORTED_MODULE_1__.inject)(VuetifyLocaleSymbol);
      if (!currentScope) throw new Error('[Vuetify] Could not find injected locale instance');
      return currentScope;
    },
    createScope: options => {
      const currentScope = (0,vue__WEBPACK_IMPORTED_MODULE_1__.inject)(VuetifyLocaleSymbol);
      if (!currentScope) throw new Error('[Vuetify] Could not find injected locale instance');
      const newScope = createScope({
        current: (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => {
          var _options$locale;

          return (_options$locale = options == null ? void 0 : options.locale) != null ? _options$locale : currentScope.current.value;
        }),
        fallback: (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => {
          var _options$locale2;

          return (_options$locale2 = options == null ? void 0 : options.locale) != null ? _options$locale2 : currentScope.fallback.value;
        }),
        messages: (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => {
          var _options$messages2;

          return (_options$messages2 = options == null ? void 0 : options.messages) != null ? _options$messages2 : currentScope.messages.value;
        })
      });
      (0,vue__WEBPACK_IMPORTED_MODULE_1__.provide)(VuetifyLocaleSymbol, newScope);
      return newScope;
    }
  };
}

/***/ }),

/***/ "./node_modules/vuetify/lib/composables/proxiedModel.mjs":
/*!***************************************************************!*\
  !*** ./node_modules/vuetify/lib/composables/proxiedModel.mjs ***!
  \***************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "useProxiedModel": function() { return /* binding */ useProxiedModel; }
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/getCurrentInstance.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/helpers.mjs");
// Utilities

 // Types
// Composables

function useProxiedModel(props, prop, defaultValue) {
  let transformIn = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : v => v;
  let transformOut = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : v => v;
  const vm = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_1__.getCurrentInstance)('useProxiedModel');
  const propIsDefined = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
    var _vm$vnode$props, _vm$vnode$props2;

    return !!(typeof props[prop] !== 'undefined' && (vm != null && (_vm$vnode$props = vm.vnode.props) != null && _vm$vnode$props.hasOwnProperty(prop) || vm != null && (_vm$vnode$props2 = vm.vnode.props) != null && _vm$vnode$props2.hasOwnProperty((0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.toKebabCase)(prop))));
  });
  const internal = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)(transformIn(props[prop]));
  return (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)({
    get() {
      if (propIsDefined.value) return transformIn(props[prop]);else return internal.value;
    },

    set(newValue) {
      internal.value = newValue;
      vm == null ? void 0 : vm.emit(`update:${prop}`, transformOut(newValue));
    }

  });
}

/***/ }),

/***/ "./node_modules/vuetify/lib/composables/resizeObserver.mjs":
/*!*****************************************************************!*\
  !*** ./node_modules/vuetify/lib/composables/resizeObserver.mjs ***!
  \*****************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "useResizeObserver": function() { return /* binding */ useResizeObserver; }
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _util_globals_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/globals.mjs */ "./node_modules/vuetify/lib/util/globals.mjs");
// Utilities
 // Globals


function useResizeObserver(callback) {
  const resizeRef = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)();
  const contentRect = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)();
  const contentBoxSize = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)();
  const borderBoxSize = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)();

  if (_util_globals_mjs__WEBPACK_IMPORTED_MODULE_1__.IN_BROWSER) {
    const observer = new ResizeObserver(entries => {
      callback == null ? void 0 : callback(entries, observer);
      if (!entries.length) return;
      contentRect.value = entries[0].contentRect;
      contentBoxSize.value = entries[0].contentBoxSize[0];
      borderBoxSize.value = entries[0].borderBoxSize[0];
    });
    (0,vue__WEBPACK_IMPORTED_MODULE_0__.onBeforeUnmount)(() => {
      observer.disconnect();
    });
    (0,vue__WEBPACK_IMPORTED_MODULE_0__.watch)(resizeRef, (newValue, oldValue) => {
      if (oldValue) {
        observer.unobserve(oldValue);
        contentRect.value = undefined;
        contentBoxSize.value = undefined;
        borderBoxSize.value = undefined;
      }

      if (newValue) observer.observe(newValue);
    }, {
      flush: 'post'
    });
  }

  return {
    resizeRef,
    contentRect: (0,vue__WEBPACK_IMPORTED_MODULE_0__.readonly)(contentRect),
    contentBoxSize: (0,vue__WEBPACK_IMPORTED_MODULE_0__.readonly)(contentBoxSize),
    borderBoxSize: (0,vue__WEBPACK_IMPORTED_MODULE_0__.readonly)(borderBoxSize)
  };
}

/***/ }),

/***/ "./node_modules/vuetify/lib/composables/rounded.mjs":
/*!**********************************************************!*\
  !*** ./node_modules/vuetify/lib/composables/rounded.mjs ***!
  \**********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "makeRoundedProps": function() { return /* binding */ makeRoundedProps; },
/* harmony export */   "useRounded": function() { return /* binding */ useRounded; }
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/propsFactory.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/getCurrentInstance.mjs");
// Utilities

 // Types
// Composables

const makeRoundedProps = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_1__.propsFactory)({
  rounded: {
    type: [Boolean, Number, String],
    default: undefined
  }
}, 'rounded');
function useRounded(props) {
  let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.getCurrentInstanceName)();
  const roundedClasses = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
    const rounded = (0,vue__WEBPACK_IMPORTED_MODULE_0__.isRef)(props) ? props.value : props.rounded;
    const classes = [];

    if (rounded === true || rounded === '') {
      classes.push(`${name}--rounded`);
    } else if (typeof rounded === 'string' || rounded === 0) {
      for (const value of String(rounded).split(' ')) {
        classes.push(`rounded-${value}`);
      }
    }

    return classes;
  });
  return {
    roundedClasses
  };
}

/***/ }),

/***/ "./node_modules/vuetify/lib/composables/router.mjs":
/*!*********************************************************!*\
  !*** ./node_modules/vuetify/lib/composables/router.mjs ***!
  \*********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "useRoute": function() { return /* binding */ useRoute; },
/* harmony export */   "useRouter": function() { return /* binding */ useRouter; },
/* harmony export */   "useLink": function() { return /* binding */ useLink; },
/* harmony export */   "makeRouterProps": function() { return /* binding */ makeRouterProps; },
/* harmony export */   "useBackButton": function() { return /* binding */ useBackButton; }
/* harmony export */ });
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/getCurrentInstance.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/propsFactory.mjs");
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
// Utilities

 // Types

function useRoute() {
  const vm = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_1__.getCurrentInstance)('useRoute');
  return (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
    var _vm$proxy;

    return vm == null ? void 0 : (_vm$proxy = vm.proxy) == null ? void 0 : _vm$proxy.$route;
  });
}
function useRouter() {
  var _getCurrentInstance, _getCurrentInstance$p;

  return (_getCurrentInstance = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_1__.getCurrentInstance)('useRouter')) == null ? void 0 : (_getCurrentInstance$p = _getCurrentInstance.proxy) == null ? void 0 : _getCurrentInstance$p.$router;
}
function useLink(props, attrs) {
  const RouterLink = (0,vue__WEBPACK_IMPORTED_MODULE_0__.resolveDynamicComponent)('RouterLink');
  const isLink = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => !!(props.href || props.to));
  const isClickable = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
    return (isLink == null ? void 0 : isLink.value) || !!(attrs.onClick || attrs.onClickOnce);
  });

  if (typeof RouterLink === 'string') {
    return {
      isLink,
      isClickable,
      href: (0,vue__WEBPACK_IMPORTED_MODULE_0__.toRef)(props, 'href')
    };
  }

  const link = props.to ? RouterLink.useLink(props) : undefined;
  return { ...link,
    isLink,
    isClickable,
    href: (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => props.to ? link == null ? void 0 : link.route.value.href : props.href)
  };
}
const makeRouterProps = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.propsFactory)({
  href: String,
  replace: Boolean,
  to: [String, Object]
}, 'router');
function useBackButton(cb) {
  const router = useRouter();
  let popped = false;
  let removeGuard;
  (0,vue__WEBPACK_IMPORTED_MODULE_0__.onMounted)(() => {
    window.addEventListener('popstate', onPopstate);
    removeGuard = router == null ? void 0 : router.beforeEach((to, from, next) => {
      setTimeout(() => popped ? cb(next) : next());
    });
  });
  (0,vue__WEBPACK_IMPORTED_MODULE_0__.onBeforeUnmount)(() => {
    var _removeGuard;

    window.removeEventListener('popstate', onPopstate);
    (_removeGuard = removeGuard) == null ? void 0 : _removeGuard();
  });

  function onPopstate(e) {
    if (e.state.replaced) return;
    popped = true;
    setTimeout(() => popped = false);
  }
}

/***/ }),

/***/ "./node_modules/vuetify/lib/composables/rtl.mjs":
/*!******************************************************!*\
  !*** ./node_modules/vuetify/lib/composables/rtl.mjs ***!
  \******************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RtlSymbol": function() { return /* binding */ RtlSymbol; },
/* harmony export */   "createRtl": function() { return /* binding */ createRtl; },
/* harmony export */   "createRtlScope": function() { return /* binding */ createRtlScope; },
/* harmony export */   "provideRtl": function() { return /* binding */ provideRtl; },
/* harmony export */   "useRtl": function() { return /* binding */ useRtl; }
/* harmony export */ });
/* harmony import */ var core_js_modules_es_error_cause_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.error.cause.js */ "./node_modules/core-js/modules/es.error.cause.js");
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _locale_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../locale/index.mjs */ "./node_modules/vuetify/lib/locale/index.mjs");


 // Types

const RtlSymbol = Symbol.for('vuetify:rtl');
function createRtl(localeScope, options) {
  var _options$rtl, _options$defaultRtl;

  return createRtlScope({
    rtl: { ..._locale_index_mjs__WEBPACK_IMPORTED_MODULE_2__.rtl,
      ...((_options$rtl = options == null ? void 0 : options.rtl) != null ? _options$rtl : {})
    },
    isRtl: (0,vue__WEBPACK_IMPORTED_MODULE_1__.ref)((_options$defaultRtl = options == null ? void 0 : options.defaultRtl) != null ? _options$defaultRtl : false),
    rtlClasses: (0,vue__WEBPACK_IMPORTED_MODULE_1__.ref)('')
  }, localeScope);
}
function createRtlScope(currentScope, localeScope, options) {
  const isRtl = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => {
    if (typeof (options == null ? void 0 : options.rtl) === 'boolean') return options.rtl;

    if (localeScope.current.value && currentScope.rtl.hasOwnProperty(localeScope.current.value)) {
      return currentScope.rtl[localeScope.current.value];
    }

    return currentScope.isRtl.value;
  });
  return {
    isRtl,
    rtl: currentScope.rtl,
    rtlClasses: (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => `v-locale--is-${isRtl.value ? 'rtl' : 'ltr'}`)
  };
}
function provideRtl(props, localeScope) {
  const currentScope = (0,vue__WEBPACK_IMPORTED_MODULE_1__.inject)(RtlSymbol);
  if (!currentScope) throw new Error('[Vuetify] Could not find injected rtl instance');
  const newScope = createRtlScope(currentScope, localeScope, props);
  (0,vue__WEBPACK_IMPORTED_MODULE_1__.provide)(RtlSymbol, newScope);
  return newScope;
}
function useRtl() {
  const currentScope = (0,vue__WEBPACK_IMPORTED_MODULE_1__.inject)(RtlSymbol);
  if (!currentScope) throw new Error('[Vuetify] Could not find injected rtl instance');
  return currentScope;
}

/***/ }),

/***/ "./node_modules/vuetify/lib/composables/ssrBoot.mjs":
/*!**********************************************************!*\
  !*** ./node_modules/vuetify/lib/composables/ssrBoot.mjs ***!
  \**********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "useSsrBoot": function() { return /* binding */ useSsrBoot; }
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
// Utilities
 // Composables

function useSsrBoot() {
  const isBooted = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)(false);
  (0,vue__WEBPACK_IMPORTED_MODULE_0__.onMounted)(() => {
    window.requestAnimationFrame(() => {
      isBooted.value = true;
    });
  });
  const ssrBootStyles = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => !isBooted.value ? {
    transition: 'none !important'
  } : undefined);
  return {
    ssrBootStyles
  };
}

/***/ }),

/***/ "./node_modules/vuetify/lib/composables/tag.mjs":
/*!******************************************************!*\
  !*** ./node_modules/vuetify/lib/composables/tag.mjs ***!
  \******************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "makeTagProps": function() { return /* binding */ makeTagProps; }
/* harmony export */ });
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/propsFactory.mjs");
// Utilities
 // Types
// Composables

const makeTagProps = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_0__.propsFactory)({
  tag: {
    type: String,
    default: 'div'
  }
}, 'tag');

/***/ }),

/***/ "./node_modules/vuetify/lib/composables/theme.mjs":
/*!********************************************************!*\
  !*** ./node_modules/vuetify/lib/composables/theme.mjs ***!
  \********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ThemeSymbol": function() { return /* binding */ ThemeSymbol; },
/* harmony export */   "makeThemeProps": function() { return /* binding */ makeThemeProps; },
/* harmony export */   "createTheme": function() { return /* binding */ createTheme; },
/* harmony export */   "provideTheme": function() { return /* binding */ provideTheme; },
/* harmony export */   "useTheme": function() { return /* binding */ useTheme; }
/* harmony export */ });
/* harmony import */ var core_js_modules_es_error_cause_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.error.cause.js */ "./node_modules/core-js/modules/es.error.cause.js");
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/propsFactory.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/helpers.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/colorUtils.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/globals.mjs");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/getCurrentInstance.mjs");
/* harmony import */ var _util_color_APCA_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../util/color/APCA.mjs */ "./node_modules/vuetify/lib/util/color/APCA.mjs");

// Utilities


 // Types

const ThemeSymbol = Symbol.for('vuetify:theme');
const makeThemeProps = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_2__.propsFactory)({
  theme: String
}, 'theme');
const defaultThemeOptions = {
  defaultTheme: 'light',
  variations: {
    colors: [],
    lighten: 0,
    darken: 0
  },
  themes: {
    light: {
      dark: false,
      colors: {
        background: '#FFFFFF',
        surface: '#FFFFFF',
        'surface-variant': '#424242',
        'on-surface-variant': '#EEEEEE',
        primary: '#6200EE',
        'primary-darken-1': '#3700B3',
        secondary: '#03DAC6',
        'secondary-darken-1': '#018786',
        error: '#B00020',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FB8C00'
      },
      variables: {
        'border-color': '#000000',
        'border-opacity': 0.12,
        'high-emphasis-opacity': 0.87,
        'medium-emphasis-opacity': 0.60,
        'disabled-opacity': 0.38,
        'idle-opacity': 0.04,
        'hover-opacity': 0.04,
        'focus-opacity': 0.12,
        'selected-opacity': 0.08,
        'activated-opacity': 0.12,
        'pressed-opacity': 0.12,
        'dragged-opacity': 0.08,
        'kbd-background-color': '#212529',
        'kbd-color': '#FFFFFF',
        'code-background-color': '#C2C2C2'
      }
    },
    dark: {
      dark: true,
      colors: {
        background: '#121212',
        surface: '#212121',
        'surface-variant': '#BDBDBD',
        'on-surface-variant': '#424242',
        primary: '#BB86FC',
        'primary-darken-1': '#3700B3',
        secondary: '#03DAC5',
        'secondary-darken-1': '#03DAC5',
        error: '#CF6679',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FB8C00'
      },
      variables: {
        'border-color': '#FFFFFF',
        'border-opacity': 0.12,
        'high-emphasis-opacity': 0.87,
        'medium-emphasis-opacity': 0.60,
        'disabled-opacity': 0.38,
        'idle-opacity': 0.10,
        'hover-opacity': 0.04,
        'focus-opacity': 0.12,
        'selected-opacity': 0.08,
        'activated-opacity': 0.12,
        'pressed-opacity': 0.16,
        'dragged-opacity': 0.08,
        'kbd-background-color': '#212529',
        'kbd-color': '#FFFFFF',
        'code-background-color': '#B7B7B7'
      }
    }
  }
};

const parseThemeOptions = function () {
  var _options$themes;

  let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultThemeOptions;
  if (!options) return { ...defaultThemeOptions,
    isDisabled: true
  };
  const themes = Object.entries((_options$themes = options.themes) != null ? _options$themes : {}).reduce((obj, _ref) => {
    var _defaultThemeOptions$, _defaultThemeOptions$2;

    let [key, theme] = _ref;
    const defaultTheme = theme.dark ? (_defaultThemeOptions$ = defaultThemeOptions.themes) == null ? void 0 : _defaultThemeOptions$.dark : (_defaultThemeOptions$2 = defaultThemeOptions.themes) == null ? void 0 : _defaultThemeOptions$2.light;
    obj[key] = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_3__.mergeDeep)(defaultTheme, theme);
    return obj;
  }, {});
  return (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_3__.mergeDeep)(defaultThemeOptions, { ...options,
    themes
  });
}; // Composables


function createTheme(app, options) {
  const head = app._context.provides.usehead;
  const parsedOptions = parseThemeOptions(options);
  const styleEl = (0,vue__WEBPACK_IMPORTED_MODULE_1__.ref)();
  const current = (0,vue__WEBPACK_IMPORTED_MODULE_1__.ref)(parsedOptions.defaultTheme);
  const themes = (0,vue__WEBPACK_IMPORTED_MODULE_1__.ref)(parsedOptions.themes);
  const variations = (0,vue__WEBPACK_IMPORTED_MODULE_1__.ref)(parsedOptions.variations);
  const computedThemes = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => {
    return Object.entries(themes.value).reduce((obj, _ref2) => {
      var _parsedOptions$variat;

      let [name, original] = _ref2;
      const theme = { ...original,
        colors: { ...original.colors,
          ...((_parsedOptions$variat = parsedOptions.variations.colors) != null ? _parsedOptions$variat : []).reduce((obj, color) => {
            return { ...obj,
              ...genColorVariations(color, original.colors[color])
            };
          }, {})
        }
      };

      for (const color of Object.keys(theme.colors)) {
        if (/on-[a-z]/.test(color) || theme.colors[`on-${color}`]) continue;
        const onColor = `on-${color}`;
        const colorVal = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_4__.colorToInt)(theme.colors[color]);
        const blackContrast = Math.abs((0,_util_color_APCA_mjs__WEBPACK_IMPORTED_MODULE_5__.APCAcontrast)(0, colorVal));
        const whiteContrast = Math.abs((0,_util_color_APCA_mjs__WEBPACK_IMPORTED_MODULE_5__.APCAcontrast)(0xffffff, colorVal)); // TODO: warn about poor color selections
        // const contrastAsText = Math.abs(APCAcontrast(colorVal, colorToInt(theme.colors.background)))
        // const minContrast = Math.max(blackContrast, whiteContrast)
        // if (minContrast < 60) {
        //   consoleInfo(`${key} theme color ${color} has poor contrast (${minContrast.toFixed()}%)`)
        // } else if (contrastAsText < 60 && !['background', 'surface'].includes(color)) {
        //   consoleInfo(`${key} theme color ${color} has poor contrast as text (${contrastAsText.toFixed()}%)`)
        // }
        // Prefer white text if both have an acceptable contrast ratio

        theme.colors[onColor] = whiteContrast > Math.min(blackContrast, 50) ? '#fff' : '#000';
      }

      obj[name] = theme;
      return obj;
    }, {});
  });

  function genColorVariations(name, color) {
    const obj = {};

    for (const variation of ['lighten', 'darken']) {
      const fn = variation === 'lighten' ? _util_index_mjs__WEBPACK_IMPORTED_MODULE_4__.lighten : _util_index_mjs__WEBPACK_IMPORTED_MODULE_4__.darken;

      for (const amount of (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_3__.createRange)(variations.value[variation], 1)) {
        obj[`${name}-${variation}-${amount}`] = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_4__.intToHex)(fn((0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_4__.colorToInt)(color), amount));
      }
    }

    return obj;
  }

  const styles = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => {
    const lines = [];

    for (const themeName of Object.keys(computedThemes.value)) {
      const variables = computedThemes.value[themeName].variables;
      lines.push(...createCssClass(`.v-theme--${themeName}`, [...genCssVariables(themeName), ...Object.keys(variables).map(key => {
        const value = variables[key];
        const color = typeof value === 'string' && value.startsWith('#') ? (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_4__.colorToRGB)(value) : undefined;
        const rgb = color ? `${color.r}, ${color.g}, ${color.b}` : undefined;
        return `--v-${key}: ${rgb != null ? rgb : value}`;
      })]));
    }

    const colors = new Set(Object.values(computedThemes.value).flatMap(theme => Object.keys(theme.colors)));

    for (const key of colors) {
      if (/on-[a-z]/.test(key)) {
        lines.push(...createCssClass(`.${key}`, [`color: rgb(var(--v-theme-${key})) !important`]));
      } else {
        lines.push(...createCssClass(`.bg-${key}`, [`--v-theme-overlay-multiplier: var(--v-theme-${key}-overlay-multiplier)`, `background: rgb(var(--v-theme-${key})) !important`, `color: rgb(var(--v-theme-on-${key})) !important`]), ...createCssClass(`.text-${key}`, [`color: rgb(var(--v-theme-${key})) !important`]), ...createCssClass(`.border-${key}`, [`--v-border-color: var(--v-theme-${key})`]));
      }
    }

    return lines.map((str, i) => i === 0 ? str : `    ${str}`).join('');
  });

  function genCssVariables(name) {
    const theme = computedThemes.value[name];
    if (!theme) throw new Error(`Could not find theme ${name}`);
    const lightOverlay = theme.dark ? 2 : 1;
    const darkOverlay = theme.dark ? 1 : 2;
    const variables = [];

    for (const [key, value] of Object.entries(theme.colors)) {
      const rgb = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_4__.colorToRGB)(value);
      variables.push(`--v-theme-${key}: ${rgb.r},${rgb.g},${rgb.b}`);

      if (!key.startsWith('on-')) {
        variables.push(`--v-theme-${key}-overlay-multiplier: ${(0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_4__.getLuma)(value) > 0.18 ? lightOverlay : darkOverlay}`);
      }
    }

    return variables;
  }

  function createCssClass(selector, content) {
    return [`${selector} {\n`, ...content.map(line => `  ${line};\n`), '}\n'];
  }

  if (head) {
    head.addHeadObjs((0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => ({
      style: [{
        children: styles.value,
        type: 'text/css',
        id: 'vuetify-theme-stylesheet'
      }]
    })));

    if (_util_index_mjs__WEBPACK_IMPORTED_MODULE_6__.IN_BROWSER) {
      (0,vue__WEBPACK_IMPORTED_MODULE_1__.watchEffect)(() => head.updateDOM());
    }
  } else {
    (0,vue__WEBPACK_IMPORTED_MODULE_1__.watch)(themes, updateStyles, {
      deep: true,
      immediate: true
    });

    function updateStyles() {
      if (parsedOptions.isDisabled) return;
      genStyleElement();
      if (styleEl.value) styleEl.value.innerHTML = styles.value;
    }

    function genStyleElement() {
      if (typeof document === 'undefined' || styleEl.value) return;
      const el = document.createElement('style');
      el.type = 'text/css';
      el.id = 'vuetify-theme-stylesheet';
      styleEl.value = el;
      document.head.appendChild(styleEl.value);
    }
  }

  return {
    isDisabled: parsedOptions.isDisabled,
    themes: computedThemes,
    setTheme: (key, theme) => themes.value[key] = theme,
    getTheme: key => computedThemes.value[key],
    current,
    themeClasses: (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => parsedOptions.isDisabled ? undefined : `v-theme--${current.value}`),
    styles
  };
}
function provideTheme(props) {
  (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_7__.getCurrentInstance)('provideTheme');
  const theme = (0,vue__WEBPACK_IMPORTED_MODULE_1__.inject)(ThemeSymbol, null);
  if (!theme) throw new Error('Could not find Vuetify theme injection');
  const current = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => {
    var _props$theme;

    return (_props$theme = props.theme) != null ? _props$theme : theme == null ? void 0 : theme.current.value;
  });
  const themeClasses = (0,vue__WEBPACK_IMPORTED_MODULE_1__.computed)(() => theme.isDisabled ? undefined : `v-theme--${current.value}`);
  const newTheme = { ...theme,
    current,
    themeClasses
  };
  (0,vue__WEBPACK_IMPORTED_MODULE_1__.provide)(ThemeSymbol, newTheme);
  return newTheme;
}
function useTheme() {
  (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_7__.getCurrentInstance)('useTheme');
  const theme = (0,vue__WEBPACK_IMPORTED_MODULE_1__.inject)(ThemeSymbol, null);
  if (!theme) throw new Error('Could not find Vuetify theme injection');
  return theme;
}

/***/ }),

/***/ "./node_modules/vuetify/lib/composables/touch.mjs":
/*!********************************************************!*\
  !*** ./node_modules/vuetify/lib/composables/touch.mjs ***!
  \********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "calculateImpulseVelocity": function() { return /* binding */ calculateImpulseVelocity; },
/* harmony export */   "useVelocity": function() { return /* binding */ useVelocity; }
/* harmony export */ });
/* harmony import */ var core_js_modules_es_error_cause_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.error.cause.js */ "./node_modules/core-js/modules/es.error.cause.js");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/helpers.mjs");


const HORIZON = 100; // ms

const HISTORY = 20; // number of samples to keep

/** @see https://android.googlesource.com/platform/frameworks/native/+/master/libs/input/VelocityTracker.cpp */

function kineticEnergyToVelocity(work) {
  const sqrt2 = 1.41421356237;
  return (work < 0 ? -1.0 : 1.0) * Math.sqrt(Math.abs(work)) * sqrt2;
}
/**
 * Returns pointer velocity in px/s
 */


function calculateImpulseVelocity(samples) {
  // The input should be in reversed time order (most recent sample at index i=0)
  if (samples.length < 2) {
    // if 0 or 1 points, velocity is zero
    return 0;
  } // if (samples[1].t > samples[0].t) {
  //   // Algorithm will still work, but not perfectly
  //   consoleWarn('Samples provided to calculateImpulseVelocity in the wrong order')
  // }


  if (samples.length === 2) {
    // if 2 points, basic linear calculation
    if (samples[1].t === samples[0].t) {
      // consoleWarn(`Events have identical time stamps t=${samples[0].t}, setting velocity = 0`)
      return 0;
    }

    return (samples[1].d - samples[0].d) / (samples[1].t - samples[0].t);
  } // Guaranteed to have at least 3 points here
  // start with the oldest sample and go forward in time


  let work = 0;

  for (let i = samples.length - 1; i > 0; i--) {
    if (samples[i].t === samples[i - 1].t) {
      // consoleWarn(`Events have identical time stamps t=${samples[i].t}, skipping sample`)
      continue;
    }

    const vprev = kineticEnergyToVelocity(work); // v[i-1]

    const vcurr = (samples[i].d - samples[i - 1].d) / (samples[i].t - samples[i - 1].t); // v[i]

    work += (vcurr - vprev) * Math.abs(vcurr);

    if (i === samples.length - 1) {
      work *= 0.5;
    }
  }

  return kineticEnergyToVelocity(work) * 1000;
}
function useVelocity() {
  const touches = {};

  function addMovement(e) {
    Array.from(e.changedTouches).forEach(touch => {
      var _touches$touch$identi;

      const samples = (_touches$touch$identi = touches[touch.identifier]) != null ? _touches$touch$identi : touches[touch.identifier] = new _util_index_mjs__WEBPACK_IMPORTED_MODULE_1__.CircularBuffer(HISTORY);
      samples.push([e.timeStamp, touch]);
    });
  }

  function endTouch(e) {
    Array.from(e.changedTouches).forEach(touch => {
      delete touches[touch.identifier];
    });
  }

  function getVelocity(id) {
    var _touches$id;

    const samples = (_touches$id = touches[id]) == null ? void 0 : _touches$id.values().reverse();

    if (!samples) {
      throw new Error(`No samples for touch id ${id}`);
    }

    const newest = samples[0];
    const x = [];
    const y = [];

    for (const val of samples) {
      if (newest[0] - val[0] > HORIZON) break;
      x.push({
        t: val[0],
        d: val[1].clientX
      });
      y.push({
        t: val[0],
        d: val[1].clientY
      });
    }

    return {
      x: calculateImpulseVelocity(x),
      y: calculateImpulseVelocity(y),

      get direction() {
        const {
          x,
          y
        } = this;
        const [absX, absY] = [Math.abs(x), Math.abs(y)];
        return absX > absY && x >= 0 ? 'right' : absX > absY && x <= 0 ? 'left' : absY > absX && y >= 0 ? 'down' : absY > absX && y <= 0 ? 'up' : oops();
      }

    };
  }

  return {
    addMovement,
    endTouch,
    getVelocity
  };
}

function oops() {
  throw new Error();
}

/***/ }),

/***/ "./node_modules/vuetify/lib/composables/transition.mjs":
/*!*************************************************************!*\
  !*** ./node_modules/vuetify/lib/composables/transition.mjs ***!
  \*************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "makeTransitionProps": function() { return /* binding */ makeTransitionProps; },
/* harmony export */   "MaybeTransition": function() { return /* binding */ MaybeTransition; }
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/index.mjs */ "./node_modules/vuetify/lib/util/propsFactory.mjs");
// Utilities

 // Types

const makeTransitionProps = (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_1__.propsFactory)({
  transition: {
    type: [Boolean, String, Object],
    default: 'fade-transition',
    validator: val => val !== true
  }
}, 'transition');
const MaybeTransition = (props, _ref) => {
  var _slots$default;

  let {
    slots
  } = _ref;
  const {
    transition,
    ...rest
  } = props;
  if (!transition || typeof transition === 'boolean') return (_slots$default = slots.default) == null ? void 0 : _slots$default.call(slots);
  const {
    component = vue__WEBPACK_IMPORTED_MODULE_0__.Transition,
    ...customProps
  } = typeof transition === 'object' ? transition : {};
  return (0,vue__WEBPACK_IMPORTED_MODULE_0__.h)(component, (0,vue__WEBPACK_IMPORTED_MODULE_0__.mergeProps)(typeof transition === 'string' ? {
    name: transition
  } : customProps, rest), slots);
};

/***/ }),

/***/ "./node_modules/vuetify/lib/directives/intersect/index.mjs":
/*!*****************************************************************!*\
  !*** ./node_modules/vuetify/lib/directives/intersect/index.mjs ***!
  \*****************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Intersect": function() { return /* binding */ Intersect; }
/* harmony export */ });
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../util/index.mjs */ "./node_modules/vuetify/lib/util/globals.mjs");
// Utils
 // Types

function mounted(el, binding) {
  if (!_util_index_mjs__WEBPACK_IMPORTED_MODULE_0__.SUPPORTS_INTERSECTION) return;
  const modifiers = binding.modifiers || {};
  const value = binding.value;
  const {
    handler,
    options
  } = typeof value === 'object' ? value : {
    handler: value,
    options: {}
  };
  const observer = new IntersectionObserver(function () {
    var _el$_observe;

    let entries = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    let observer = arguments.length > 1 ? arguments[1] : undefined;

    const _observe = (_el$_observe = el._observe) == null ? void 0 : _el$_observe[binding.instance.$.uid];

    if (!_observe) return; // Just in case, should never fire

    const isIntersecting = entries.some(entry => entry.isIntersecting); // If is not quiet or has already been
    // initted, invoke the user callback

    if (handler && (!modifiers.quiet || _observe.init) && (!modifiers.once || isIntersecting || _observe.init)) {
      handler(isIntersecting, entries, observer);
    }

    if (isIntersecting && modifiers.once) unmounted(el, binding);else _observe.init = true;
  }, options);
  el._observe = Object(el._observe);
  el._observe[binding.instance.$.uid] = {
    init: false,
    observer
  };
  observer.observe(el);
}

function unmounted(el, binding) {
  var _el$_observe2;

  const observe = (_el$_observe2 = el._observe) == null ? void 0 : _el$_observe2[binding.instance.$.uid];
  if (!observe) return;
  observe.observer.unobserve(el);
  delete el._observe[binding.instance.$.uid];
}

const Intersect = {
  mounted,
  unmounted
};
/* harmony default export */ __webpack_exports__["default"] = (Intersect);

/***/ }),

/***/ "./node_modules/vuetify/lib/framework.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/framework.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "provideRtl": function() { return /* reexport safe */ _composables_index_mjs__WEBPACK_IMPORTED_MODULE_1__.provideRtl; },
/* harmony export */   "useDisplay": function() { return /* reexport safe */ _composables_index_mjs__WEBPACK_IMPORTED_MODULE_1__.useDisplay; },
/* harmony export */   "useLayout": function() { return /* reexport safe */ _composables_index_mjs__WEBPACK_IMPORTED_MODULE_1__.useLayout; },
/* harmony export */   "useRtl": function() { return /* reexport safe */ _composables_index_mjs__WEBPACK_IMPORTED_MODULE_1__.useRtl; },
/* harmony export */   "useTheme": function() { return /* reexport safe */ _composables_index_mjs__WEBPACK_IMPORTED_MODULE_1__.useTheme; },
/* harmony export */   "createVuetify": function() { return /* binding */ createVuetify; }
/* harmony export */ });
/* harmony import */ var _composables_display_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./composables/display.mjs */ "./node_modules/vuetify/lib/composables/display.mjs");
/* harmony import */ var _composables_theme_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./composables/theme.mjs */ "./node_modules/vuetify/lib/composables/theme.mjs");
/* harmony import */ var _composables_icons_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./composables/icons.mjs */ "./node_modules/vuetify/lib/composables/icons.mjs");
/* harmony import */ var _composables_defaults_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./composables/defaults.mjs */ "./node_modules/vuetify/lib/composables/defaults.mjs");
/* harmony import */ var _composables_locale_mjs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./composables/locale.mjs */ "./node_modules/vuetify/lib/composables/locale.mjs");
/* harmony import */ var _composables_rtl_mjs__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./composables/rtl.mjs */ "./node_modules/vuetify/lib/composables/rtl.mjs");
/* harmony import */ var _iconsets_mdi_mjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./iconsets/mdi.mjs */ "./node_modules/vuetify/lib/iconsets/mdi.mjs");
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _util_index_mjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./util/index.mjs */ "./node_modules/vuetify/lib/util/helpers.mjs");
/* harmony import */ var _composables_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./composables/index.mjs */ "./node_modules/vuetify/lib/composables/index.mjs");






 // Utilities


 // Types


const createVuetify = function () {
  let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  const install = app => {
    const {
      components = {},
      directives = {},
      icons = {}
    } = options;

    for (const key in directives) {
      const directive = directives[key];
      app.directive(key, directive);
    }

    for (const key in components) {
      const component = components[key];
      app.component(key, component);
    }

    app.provide(_composables_defaults_mjs__WEBPACK_IMPORTED_MODULE_2__.DefaultsSymbol, (0,_composables_defaults_mjs__WEBPACK_IMPORTED_MODULE_2__.createDefaults)(options.defaults));
    app.provide(_composables_display_mjs__WEBPACK_IMPORTED_MODULE_3__.DisplaySymbol, (0,_composables_display_mjs__WEBPACK_IMPORTED_MODULE_3__.createDisplay)(options.display));
    app.provide(_composables_theme_mjs__WEBPACK_IMPORTED_MODULE_4__.ThemeSymbol, (0,_composables_theme_mjs__WEBPACK_IMPORTED_MODULE_4__.createTheme)(app, options.theme));
    app.provide(_composables_icons_mjs__WEBPACK_IMPORTED_MODULE_5__.IconSymbol, (0,_util_index_mjs__WEBPACK_IMPORTED_MODULE_6__.mergeDeep)({
      defaultSet: 'mdi',
      sets: { ..._composables_icons_mjs__WEBPACK_IMPORTED_MODULE_5__.defaultSets,
        mdi: _iconsets_mdi_mjs__WEBPACK_IMPORTED_MODULE_7__.mdi
      },
      aliases: _iconsets_mdi_mjs__WEBPACK_IMPORTED_MODULE_7__.aliases
    }, icons));
    const {
      adapter,
      rootInstance
    } = (0,_composables_locale_mjs__WEBPACK_IMPORTED_MODULE_8__.createLocaleAdapter)(app, options == null ? void 0 : options.locale);
    app.provide(_composables_locale_mjs__WEBPACK_IMPORTED_MODULE_8__.LocaleAdapterSymbol, adapter);
    app.provide(_composables_rtl_mjs__WEBPACK_IMPORTED_MODULE_9__.RtlSymbol, (0,_composables_rtl_mjs__WEBPACK_IMPORTED_MODULE_9__.createRtl)(rootInstance, options == null ? void 0 : options.locale)); // Vue's inject() can only be used in setup

    function inject(key) {
      var _vm$parent$provides, _vm$parent, _vm$vnode$appContext;

      const vm = this.$;
      const provides = (_vm$parent$provides = (_vm$parent = vm.parent) == null ? void 0 : _vm$parent.provides) != null ? _vm$parent$provides : (_vm$vnode$appContext = vm.vnode.appContext) == null ? void 0 : _vm$vnode$appContext.provides;

      if (provides && key in provides) {
        return provides[key];
      }
    }

    app.mixin({
      computed: {
        $vuetify() {
          return (0,vue__WEBPACK_IMPORTED_MODULE_0__.reactive)({
            defaults: inject.call(this, _composables_defaults_mjs__WEBPACK_IMPORTED_MODULE_2__.DefaultsSymbol),
            display: inject.call(this, _composables_display_mjs__WEBPACK_IMPORTED_MODULE_3__.DisplaySymbol),
            theme: inject.call(this, _composables_theme_mjs__WEBPACK_IMPORTED_MODULE_4__.ThemeSymbol),
            icons: inject.call(this, _composables_icons_mjs__WEBPACK_IMPORTED_MODULE_5__.IconSymbol),
            locale: inject.call(this, _composables_locale_mjs__WEBPACK_IMPORTED_MODULE_8__.LocaleAdapterSymbol),
            rtl: inject.call(this, _composables_rtl_mjs__WEBPACK_IMPORTED_MODULE_9__.RtlSymbol)
          });
        }

      }
    });
  };

  return {
    install
  };
};

/***/ }),

/***/ "./node_modules/vuetify/lib/iconsets/mdi.mjs":
/*!***************************************************!*\
  !*** ./node_modules/vuetify/lib/iconsets/mdi.mjs ***!
  \***************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "aliases": function() { return /* binding */ aliases; },
/* harmony export */   "mdi": function() { return /* binding */ mdi; }
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _composables_icons_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../composables/icons.mjs */ "./node_modules/vuetify/lib/composables/icons.mjs");
// Utilities
 // Components

 // Types

const aliases = {
  collapse: 'mdi-chevron-up',
  complete: 'mdi-check',
  cancel: 'mdi-close-circle',
  close: 'mdi-close',
  delete: 'mdi-close-circle',
  // delete (e.g. v-chip close)
  clear: 'mdi-close-circle',
  success: 'mdi-check-circle',
  info: 'mdi-information',
  warning: 'mdi-alert-circle',
  error: 'mdi-close-circle',
  prev: 'mdi-chevron-left',
  next: 'mdi-chevron-right',
  checkboxOn: 'mdi-checkbox-marked',
  checkboxOff: 'mdi-checkbox-blank-outline',
  checkboxIndeterminate: 'mdi-minus-box',
  delimiter: 'mdi-circle',
  // for carousel
  sort: 'mdi-arrow-up',
  expand: 'mdi-chevron-down',
  menu: 'mdi-menu',
  subgroup: 'mdi-menu-down',
  dropdown: 'mdi-menu-down',
  radioOn: 'mdi-radiobox-marked',
  radioOff: 'mdi-radiobox-blank',
  edit: 'mdi-pencil',
  ratingEmpty: 'mdi-star-outline',
  ratingFull: 'mdi-star',
  ratingHalf: 'mdi-star-half-full',
  loading: 'mdi-cached',
  first: 'mdi-page-first',
  last: 'mdi-page-last',
  unfold: 'mdi-unfold-more-horizontal',
  file: 'mdi-paperclip',
  plus: 'mdi-plus',
  minus: 'mdi-minus'
};
const mdi = {
  // Not using mergeProps here, functional components merge props by default (?)
  component: props => (0,vue__WEBPACK_IMPORTED_MODULE_0__.h)(_composables_icons_mjs__WEBPACK_IMPORTED_MODULE_1__.VClassIcon, { ...props,
    class: 'mdi'
  })
};


/***/ }),

/***/ "./node_modules/vuetify/lib/locale/af.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/af.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'badge',
  close: 'Close',
  dataIterator: {
    noResultsText: 'Geen ooreenstemmende resultate is gevind nie',
    loadingText: 'Loading item...'
  },
  dataTable: {
    itemsPerPageText: 'Rye per bladsy:',
    ariaLabel: {
      sortDescending: 'Sorted descending.',
      sortAscending: 'Sorted ascending..',
      sortNone: 'Not sorted.',
      activateNone: 'Activate to remove sorting.',
      activateDescending: 'Activate to sort descending.',
      activateAscending: 'Activate to sort ascending.'
    },
    sortBy: 'Sort by'
  },
  dataFooter: {
    itemsPerPageText: 'Aantal per bladsy:',
    itemsPerPageAll: 'Alles',
    nextPage: 'Volgende bladsy',
    prevPage: 'Vorige bladsy',
    firstPage: 'Eerste bladsy',
    lastPage: 'Laaste bladsy',
    pageText: '{0}-{1} van {2}'
  },
  datePicker: {
    itemsSelected: '{0} gekies',
    nextMonthAriaLabel: 'Volgende maand',
    nextYearAriaLabel: 'Volgende jaar',
    prevMonthAriaLabel: 'Vorige maand',
    prevYearAriaLabel: 'Vorige jaar'
  },
  noDataText: 'Geen data is beskikbaar nie',
  carousel: {
    prev: 'Vorige visuele',
    next: 'Volgende visuele',
    ariaLabel: {
      delimiter: 'Carousel slide {0} of {1}'
    }
  },
  calendar: {
    moreEvents: '{0} meer'
  },
  fileInput: {
    counter: '{0} files',
    counterSize: '{0} files ({1} in total)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Paginasie-navigasie',
      next: 'Volgende bladsy',
      previous: 'Vorige bladsy',
      page: 'Gaan na bladsy {0}',
      currentPage: 'Huidige bladsy, Bladsy {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/ar.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/ar.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'شارة',
  close: 'إغلاق',
  dataIterator: {
    noResultsText: 'لا توجد سجلات مطابقة',
    loadingText: 'تحميل العنصر...'
  },
  dataTable: {
    itemsPerPageText: 'الصفوف لكل صفحة:',
    ariaLabel: {
      sortDescending: 'مفروز تنازلي. تنشيط لإزالة الفرز.',
      sortAscending: 'مفروز تصاعدي. تنشيط للفرز التنازلي.',
      sortNone: 'غير مفروزة. تفعيل لفرز تصاعدي.',
      activateNone: 'Activate to remove sorting.',
      activateDescending: 'Activate to sort descending.',
      activateAscending: 'Activate to sort ascending.'
    },
    sortBy: 'مفروزة حسب'
  },
  dataFooter: {
    itemsPerPageText: 'العناصر لكل صفحة:',
    itemsPerPageAll: 'الكل',
    nextPage: 'الصفحة التالية',
    prevPage: 'الصفحة السابقة',
    firstPage: 'الصفحة الأولى',
    lastPage: 'الصفحة الأخيرة',
    pageText: '{0}-{1} من {2}'
  },
  datePicker: {
    itemsSelected: '{0} مختارة',
    nextMonthAriaLabel: 'الشهر القادم',
    nextYearAriaLabel: 'العام القادم',
    prevMonthAriaLabel: 'الشهر الماضى',
    prevYearAriaLabel: 'السنة الماضية'
  },
  noDataText: 'لا توجد بيانات متاحة',
  carousel: {
    prev: 'البصري السابق',
    next: 'البصري التالي',
    ariaLabel: {
      delimiter: 'Carousel slide {0} of {1}'
    }
  },
  calendar: {
    moreEvents: '{0} أكثر'
  },
  fileInput: {
    counter: '{0} ملفات',
    counterSize: '{0} ملفات ({1} في المجموع)'
  },
  timePicker: {
    am: 'صباحاً',
    pm: 'مساءً'
  },
  pagination: {
    ariaLabel: {
      root: 'ترقيم الصفحات الملاحة',
      next: 'الصفحة التالية',
      previous: 'الصفحة السابقة',
      page: '{0} انتقل إلى صفحة',
      currentPage: '{0} الصفحة الحالية ، الصفحة',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/az.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/az.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'nişan',
  close: 'Bağla',
  dataIterator: {
    noResultsText: 'Uyğun məlumat tapılmadı',
    loadingText: 'Yüklənir... Zəhmət olmasa, gözləyin.'
  },
  dataTable: {
    itemsPerPageText: 'Səhifə başı sətir sayı:',
    ariaLabel: {
      sortDescending: 'Azalan sıra ilə düzülmüş.',
      sortAscending: 'Artan sıra ilə düzülmüş.',
      sortNone: 'Sıralanmamışdır. ',
      activateNone: 'Sıralamanı yığışdır.',
      activateDescending: 'Azalan sıra ilə düz.',
      activateAscending: 'Artan sıra ilə düz.'
    },
    sortBy: 'Sırala'
  },
  dataFooter: {
    itemsPerPageText: 'Səhifə başı sətir sayı:',
    itemsPerPageAll: 'Hamısı',
    nextPage: 'Növbəti səhifə',
    prevPage: 'Əvvəlki səhifə',
    firstPage: 'İlk səhifə',
    lastPage: 'Son səhifə',
    pageText: '{0} - {1} arası, Cəmi: {2} qeydiyyat'
  },
  datePicker: {
    itemsSelected: '{0} element seçildi',
    nextMonthAriaLabel: 'Növbəti ay',
    nextYearAriaLabel: 'Növbəti yıl',
    prevMonthAriaLabel: 'Keçən ay',
    prevYearAriaLabel: 'Keçən yıl'
  },
  noDataText: 'Bu görüntüdə məlumat yoxdur.',
  carousel: {
    prev: 'Əvvəlki görüntü',
    next: 'Növbəti görüntü',
    ariaLabel: {
      delimiter: 'Galereya səhifə {0} / {1}'
    }
  },
  calendar: {
    moreEvents: '{0} ədad daha'
  },
  fileInput: {
    counter: '{0} fayl',
    counterSize: '{0} fayl (cəmi {1})'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Səhifələmə Naviqasiyası',
      next: 'Növbəti səhifə',
      previous: 'Əvəvlki səhifə',
      page: 'Səhifəyə get {0}',
      currentPage: 'Cari səhifə, Səhifə {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/bg.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/bg.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Значка',
  close: 'Затвори',
  dataIterator: {
    noResultsText: 'Не са намерени записи',
    loadingText: 'Зареждане на елементи...'
  },
  dataTable: {
    itemsPerPageText: 'Редове на страница:',
    ariaLabel: {
      sortDescending: 'Подреди в намаляващ ред.',
      sortAscending: 'Подреди в нарастващ ред.',
      sortNone: 'Без подредба.',
      activateNone: 'Активирай за премахване на подредбата.',
      activateDescending: 'Активирай за подредба в намаляващ ред.',
      activateAscending: 'Активирай за подредба в нарастващ ред.'
    },
    sortBy: 'Сортирай по'
  },
  dataFooter: {
    itemsPerPageText: 'Елементи на страница:',
    itemsPerPageAll: 'Всички',
    nextPage: 'Следваща страница',
    prevPage: 'Предишна страница',
    firstPage: 'Първа страница',
    lastPage: 'Последна страница',
    pageText: '{0}-{1} от {2}'
  },
  datePicker: {
    itemsSelected: '{0} избрани',
    nextMonthAriaLabel: 'Следващ месец',
    nextYearAriaLabel: 'Следващата година',
    prevMonthAriaLabel: 'Предишен месец',
    prevYearAriaLabel: 'Предишна година'
  },
  noDataText: 'Няма налични данни',
  carousel: {
    prev: 'Предишна визуализация',
    next: 'Следваща визуализация',
    ariaLabel: {
      delimiter: 'Кадър {0} от {1} на въртележката'
    }
  },
  calendar: {
    moreEvents: 'Още {0}'
  },
  fileInput: {
    counter: '{0} файла',
    counterSize: '{0} файла ({1} общо)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Странициране',
      next: 'Следваща страница',
      previous: 'Предишна страница',
      page: 'Отиди на страница {0}',
      currentPage: 'Текуща страница, Страница {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/ca.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/ca.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Insígnia',
  close: 'Tancar',
  dataIterator: {
    noResultsText: 'Sense dades per mostrar',
    loadingText: 'Carregant...'
  },
  dataTable: {
    itemsPerPageText: 'Files per pàgina:',
    ariaLabel: {
      sortDescending: 'Ordre descendent. Premi per treure la ordenació.',
      sortAscending: 'Ordre ascendent. Premi per ordenar descendent.',
      sortNone: 'Sense ordenar. Premi per ordenar ascendent.',
      activateNone: 'Activate to remove sorting.',
      activateDescending: 'Activate to sort descending.',
      activateAscending: 'Activate to sort ascending.'
    },
    sortBy: 'Ordenat per'
  },
  dataFooter: {
    itemsPerPageText: 'Elements per pàgina:',
    itemsPerPageAll: 'Tot',
    nextPage: 'Pàgina següent',
    prevPage: 'Pàgina anterior',
    firstPage: 'Primera pàgina',
    lastPage: 'Última pàgina',
    pageText: '{0}-{1} de {2}'
  },
  datePicker: {
    itemsSelected: '{0} seleccionats',
    nextMonthAriaLabel: 'El mes que ve',
    nextYearAriaLabel: `L'any que ve`,
    prevMonthAriaLabel: 'Mes anterior',
    prevYearAriaLabel: 'Any anterior'
  },
  noDataText: 'Sense dades',
  carousel: {
    prev: 'Visualització prèvia',
    next: 'Visualització següent',
    ariaLabel: {
      delimiter: 'Diapositiva {0} of {1}'
    }
  },
  calendar: {
    moreEvents: '{0} més'
  },
  fileInput: {
    counter: '{0} fitxers',
    counterSize: '{0} fitxers ({1} en total)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Navegació de la pàgina',
      next: 'Pàgina següent',
      previous: 'Pàgina anterior',
      page: 'Ves a la pàgina {0}',
      currentPage: 'Pàgina actual, pàgina {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/ckb.mjs":
/*!*************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/ckb.mjs ***!
  \*************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'باج',
  close: 'داخستن',
  dataIterator: {
    noResultsText: 'هیچ تۆمارێکی هاوتا نەدۆزرایەوە',
    loadingText: 'بارکردنی ئایتمەکان...'
  },
  dataTable: {
    itemsPerPageText: 'ڕیزەکان بۆ هەر پەڕەیەک:',
    ariaLabel: {
      sortDescending: '.سەر بەرەو خوار ڕیزکراوە',
      sortAscending: '.سەر بەرەو ژوور ڕیزکراوە',
      sortNone: 'ڕیزنەکراوە.',
      activateNone: 'چالاککردن بۆ لابردنی ڕیزکردن.',
      activateDescending: 'چالاککردن بۆ ڕیزکردنی سەربەرەوخوار.',
      activateAscending: 'چالاککردن بۆ ڕیزکردنی سەر بەرەو ژوور.'
    },
    sortBy: 'ڕیزکردن بەپێی'
  },
  dataFooter: {
    itemsPerPageText: 'ئایتمەکان بۆ هەر پەڕەیەک:',
    itemsPerPageAll: 'هەمووی',
    nextPage: 'پەڕەی دواتر',
    prevPage: 'پەڕەی پێشوو',
    firstPage: 'پەڕەی یەکەم',
    lastPage: 'پەڕەی کۆتایی',
    pageText: '{0}-{1} لە {2}'
  },
  datePicker: {
    itemsSelected: '{0} دەسنیشانکراوە',
    nextMonthAriaLabel: 'مانگی داهاتوو',
    nextYearAriaLabel: 'ساڵی داهاتوو',
    prevMonthAriaLabel: 'مانگی پێشوو',
    prevYearAriaLabel: 'ساڵی پێشوو'
  },
  noDataText: 'هیچ داتایەک بەردەست نیە',
  carousel: {
    prev: 'بینراوی پێشوو',
    next: 'بینراوی داهاتوو',
    ariaLabel: {
      delimiter: 'سلایدی کارۆسێل {0} لە {1}'
    }
  },
  calendar: {
    moreEvents: '{0} زیاتر'
  },
  fileInput: {
    counter: '{0} فایل',
    counterSize: '{0} فایل ({1} لە کۆی گشتی)'
  },
  timePicker: {
    am: 'پێش نیوەڕۆژ',
    pm: 'دوای نیوەڕۆژ'
  },
  pagination: {
    ariaLabel: {
      root: 'ڕێنیشاندەری پەڕەگۆڕکێ',
      next: 'پەڕەی دواتر',
      previous: 'پەڕەی پێشوو',
      page: 'بڕۆ بۆ پەڕەی {0}',
      currentPage: 'پەڕەی ئێستا، پەڕە{0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/cs.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/cs.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Odznak',
  close: 'Zavřít',
  dataIterator: {
    noResultsText: 'Nenalezeny žádné záznamy',
    loadingText: 'Načítám položky...'
  },
  dataTable: {
    itemsPerPageText: 'Řádků na stránku:',
    ariaLabel: {
      sortDescending: 'Řazeno sestupně.',
      sortAscending: 'Řazeno vzestupně.',
      sortNone: 'Neseřazeno.',
      activateNone: 'Aktivováním vypnete řazení.',
      activateDescending: 'Aktivováním se bude řadit sestupně.',
      activateAscending: 'Aktivováním se bude řadit vzestupně.'
    },
    sortBy: 'Řadit dle'
  },
  dataFooter: {
    itemsPerPageText: 'Položek na stránku:',
    itemsPerPageAll: 'Vše',
    nextPage: 'Další strana',
    prevPage: 'Předchozí strana',
    firstPage: 'První strana',
    lastPage: 'Poslední strana',
    pageText: '{0}-{1} z {2}'
  },
  datePicker: {
    itemsSelected: '{0} vybráno',
    nextMonthAriaLabel: 'Příští měsíc',
    nextYearAriaLabel: 'Příští rok',
    prevMonthAriaLabel: 'Předchozí měsíc',
    prevYearAriaLabel: 'Předchozí rok'
  },
  noDataText: 'Nejsou dostupná žádná data',
  carousel: {
    prev: 'Předchozí obrázek',
    next: 'Další obrázek',
    ariaLabel: {
      delimiter: 'Slide {0} z {1}'
    }
  },
  calendar: {
    moreEvents: '{0} dalších'
  },
  fileInput: {
    counter: '{0} souborů',
    counterSize: '{0} souborů ({1} celkem)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Navigace po stránkách',
      next: 'Další strana',
      previous: 'Předchozí strana',
      page: 'Přejít na stránku {0}',
      currentPage: 'Aktuální stránka, stránka {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Hodnocení {0} z {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/da.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/da.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Emblem',
  close: 'Luk',
  dataIterator: {
    noResultsText: 'Ingen matchende data fundet',
    loadingText: 'Indhenter data...'
  },
  dataTable: {
    itemsPerPageText: 'Rækker pr. side:',
    ariaLabel: {
      sortDescending: 'Sorteret faldende.',
      sortAscending: 'Sorteret stigende.',
      sortNone: 'Ikke sorteret.',
      activateNone: 'Aktiver for at fjerne sortering.',
      activateDescending: 'Aktiver for at sortere faldende.',
      activateAscending: 'Aktiver for at sortere stigende.'
    },
    sortBy: 'Sorter efter'
  },
  dataFooter: {
    itemsPerPageText: 'Rækker pr. side:',
    itemsPerPageAll: 'Alle',
    nextPage: 'Næste side',
    prevPage: 'Forrige side',
    firstPage: 'Første side',
    lastPage: 'Sidste side',
    pageText: '{0}-{1} af {2}'
  },
  datePicker: {
    itemsSelected: '{0} valgt',
    nextMonthAriaLabel: 'Næste måned',
    nextYearAriaLabel: 'Næste år',
    prevMonthAriaLabel: 'Forrige måned',
    prevYearAriaLabel: 'Forrige år'
  },
  noDataText: 'Ingen data tilgængelig',
  carousel: {
    prev: 'Forrige visuelle',
    next: 'Næste visuelle',
    ariaLabel: {
      delimiter: 'Karrusel dias {0} af {1}'
    }
  },
  calendar: {
    moreEvents: '{0} mere'
  },
  fileInput: {
    counter: '{0} filer',
    counterSize: '{0} filer ({1} total)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Pagineringsnavigation',
      next: 'Næste side',
      previous: 'Forrige side',
      page: 'Gå til side {0}',
      currentPage: 'Nuværende side, Side {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Bedømmelse {0} af {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/de.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/de.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Abzeichen',
  close: 'Schließen',
  dataIterator: {
    noResultsText: 'Keine Elemente gefunden',
    loadingText: 'Lade Elemente...'
  },
  dataTable: {
    itemsPerPageText: 'Zeilen pro Seite:',
    ariaLabel: {
      sortDescending: 'Absteigend sortiert.',
      sortAscending: 'Aufsteigend sortiert.',
      sortNone: 'Nicht sortiert.',
      activateNone: 'Aktivieren um Sortierung zu entfernen.',
      activateDescending: 'Aktivieren um absteigend zu sortieren.',
      activateAscending: 'Aktivieren um aufsteigend zu sortieren.'
    },
    sortBy: 'Sortiere nach'
  },
  dataFooter: {
    itemsPerPageText: 'Elemente pro Seite:',
    itemsPerPageAll: 'Alle',
    nextPage: 'Nächste Seite',
    prevPage: 'Vorherige Seite',
    firstPage: 'Erste Seite',
    lastPage: 'Letzte Seite',
    pageText: '{0}-{1} von {2}'
  },
  datePicker: {
    itemsSelected: '{0} ausgewählt',
    nextMonthAriaLabel: 'Nächsten Monat',
    nextYearAriaLabel: 'Nächstes Jahr',
    prevMonthAriaLabel: 'Vorheriger Monat',
    prevYearAriaLabel: 'Vorheriges Jahr'
  },
  noDataText: 'Keine Daten vorhanden',
  carousel: {
    prev: 'Vorheriges Bild',
    next: 'Nächstes Bild',
    ariaLabel: {
      delimiter: 'Element {0} von {1}'
    }
  },
  calendar: {
    moreEvents: '{0} mehr'
  },
  fileInput: {
    counter: '{0} Dateien',
    counterSize: '{0} Dateien ({1} gesamt)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Seitennavigation',
      next: 'Nächste Seite',
      previous: 'Vorherige Seite',
      page: 'Gehe zu Seite {0}',
      currentPage: 'Aktuelle Seite, Seite {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/el.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/el.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Σήμα',
  close: 'Close',
  dataIterator: {
    noResultsText: 'Δε βρέθηκαν αποτελέσματα',
    loadingText: 'Loading item...'
  },
  dataTable: {
    itemsPerPageText: 'Γραμμές ανά σελίδα:',
    ariaLabel: {
      sortDescending: 'Sorted descending.',
      sortAscending: 'Sorted ascending.',
      sortNone: 'Not sorted.',
      activateNone: 'Activate to remove sorting.',
      activateDescending: 'Activate to sort descending.',
      activateAscending: 'Activate to sort ascending.'
    },
    sortBy: 'Sort by'
  },
  dataFooter: {
    itemsPerPageText: 'Αντικείμενα ανά σελίδα:',
    itemsPerPageAll: 'Όλα',
    nextPage: 'Επόμενη σελίδα',
    prevPage: 'Προηγούμενη σελίδα',
    firstPage: 'Πρώτη σελίδα',
    lastPage: 'Τελευταία σελίδα',
    pageText: '{0}-{1} από {2}'
  },
  datePicker: {
    itemsSelected: '{0} επιλεγμένα',
    nextMonthAriaLabel: 'Τον επόμενο μήνα',
    nextYearAriaLabel: 'Του χρόνου',
    prevMonthAriaLabel: 'Προηγούμενος μήνας',
    prevYearAriaLabel: 'Προηγούμενο έτος'
  },
  noDataText: 'Χωρίς δεδομένα',
  carousel: {
    prev: 'הקודם חזותי',
    next: 'הבא חזותי',
    ariaLabel: {
      delimiter: 'Carousel slide {0} of {1}'
    }
  },
  calendar: {
    moreEvents: '{0} ακόμη'
  },
  fileInput: {
    counter: '{0} files',
    counterSize: '{0} files ({1} in total)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Πλοήγηση με προορισμούς',
      next: 'Επόμενη σελίδα',
      previous: 'Προηγούμενη σελίδα',
      page: 'Πήγαινε στην σελίδα {0}',
      currentPage: 'Τρέχουσα σελίδα, σελίδα {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/en.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/en.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Badge',
  close: 'Close',
  dataIterator: {
    noResultsText: 'No matching records found',
    loadingText: 'Loading items...'
  },
  dataTable: {
    itemsPerPageText: 'Rows per page:',
    ariaLabel: {
      sortDescending: 'Sorted descending.',
      sortAscending: 'Sorted ascending.',
      sortNone: 'Not sorted.',
      activateNone: 'Activate to remove sorting.',
      activateDescending: 'Activate to sort descending.',
      activateAscending: 'Activate to sort ascending.'
    },
    sortBy: 'Sort by'
  },
  dataFooter: {
    itemsPerPageText: 'Items per page:',
    itemsPerPageAll: 'All',
    nextPage: 'Next page',
    prevPage: 'Previous page',
    firstPage: 'First page',
    lastPage: 'Last page',
    pageText: '{0}-{1} of {2}'
  },
  datePicker: {
    itemsSelected: '{0} selected',
    nextMonthAriaLabel: 'Next month',
    nextYearAriaLabel: 'Next year',
    prevMonthAriaLabel: 'Previous month',
    prevYearAriaLabel: 'Previous year'
  },
  noDataText: 'No data available',
  carousel: {
    prev: 'Previous visual',
    next: 'Next visual',
    ariaLabel: {
      delimiter: 'Carousel slide {0} of {1}'
    }
  },
  calendar: {
    moreEvents: '{0} more'
  },
  fileInput: {
    counter: '{0} files',
    counterSize: '{0} files ({1} in total)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Pagination Navigation',
      next: 'Next page',
      previous: 'Previous page',
      page: 'Goto Page {0}',
      currentPage: 'Page {0}, Current Page',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/es.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/es.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Placa',
  close: 'Cerrar',
  dataIterator: {
    noResultsText: 'Ningún elemento coincide con la búsqueda',
    loadingText: 'Cargando...'
  },
  dataTable: {
    itemsPerPageText: 'Filas por página:',
    ariaLabel: {
      sortDescending: 'Orden descendente.',
      sortAscending: 'Orden ascendente.',
      sortNone: 'Sin ordenar.',
      activateNone: 'Pulse para quitar orden.',
      activateDescending: 'Pulse para ordenar descendente.',
      activateAscending: 'Pulse para ordenar ascendente.'
    },
    sortBy: 'Ordenado por'
  },
  dataFooter: {
    itemsPerPageText: 'Elementos por página:',
    itemsPerPageAll: 'Todos',
    nextPage: 'Página siguiente',
    prevPage: 'Página anterior',
    firstPage: 'Primer página',
    lastPage: 'Última página',
    pageText: '{0}-{1} de {2}'
  },
  datePicker: {
    itemsSelected: '{0} seleccionados',
    nextMonthAriaLabel: 'Próximo mes',
    nextYearAriaLabel: 'Próximo año',
    prevMonthAriaLabel: 'Mes anterior',
    prevYearAriaLabel: 'Año anterior'
  },
  noDataText: 'No hay datos disponibles',
  carousel: {
    prev: 'Visual anterior',
    next: 'Visual siguiente',
    ariaLabel: {
      delimiter: 'Visual {0} de {1}'
    }
  },
  calendar: {
    moreEvents: '{0} más'
  },
  fileInput: {
    counter: '{0} archivos',
    counterSize: '{0} archivos ({1} en total)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Navegación de paginación',
      next: 'Página siguiente',
      previous: 'Página anterior',
      page: 'Ir a la página {0}',
      currentPage: 'Página actual, página {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Puntuación {0} de {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/et.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/et.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Märk',
  close: 'Sulge',
  dataIterator: {
    noResultsText: 'Vastavaid kirjeid ei leitud',
    loadingText: 'Andmeid laaditakse...'
  },
  dataTable: {
    itemsPerPageText: 'Ridu leheküljel:',
    ariaLabel: {
      sortDescending: 'Kahanevalt sorteeritud.',
      sortAscending: 'Kasvavalt sorteeritud.',
      sortNone: 'Ei ole sorteeritud.',
      activateNone: 'Vajuta uuesti sorteerimise eemaldamiseks.',
      activateDescending: 'Vajuta uuesti, et sorteerida kahanevalt.',
      activateAscending: 'Vajuta kasvavalt sorteerimiseks.'
    },
    sortBy: 'Sorteerimise alus'
  },
  dataFooter: {
    itemsPerPageText: 'Kirjeid leheküljel:',
    itemsPerPageAll: 'Kõik',
    nextPage: 'Järgmine lehekülg',
    prevPage: 'Eelmine lehekülg',
    firstPage: 'Esimene lehekülg',
    lastPage: 'Viimane lehekülg',
    pageText: '{0}-{1} {2}st'
  },
  datePicker: {
    itemsSelected: '{0} valitud',
    nextMonthAriaLabel: 'Järgmine kuu',
    nextYearAriaLabel: 'Järgmine aasta',
    prevMonthAriaLabel: 'Eelmine kuu',
    prevYearAriaLabel: 'Eelmine aasta'
  },
  noDataText: 'Andmed puuduvad',
  carousel: {
    prev: 'Eelmine visuaalne',
    next: 'Järgmine visuaalne',
    ariaLabel: {
      delimiter: 'Carousel slide {0} of {1}'
    }
  },
  calendar: {
    moreEvents: '{0} veel'
  },
  fileInput: {
    counter: '{0} faili',
    counterSize: '{0} faili (kokku {1})'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Pagination Navigation',
      next: 'Järgmine lehekülg',
      previous: 'Eelmine lehekülg',
      page: 'Mine lehele {0}',
      currentPage: 'Praegune leht, leht {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/fa.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/fa.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'نشان',
  close: 'بستن',
  dataIterator: {
    noResultsText: 'نتیجه‌ای یافت نشد',
    loadingText: 'در حال بارگذاری...'
  },
  dataTable: {
    itemsPerPageText: 'ردیف در صفحه:',
    ariaLabel: {
      sortDescending: 'مرتب‌سازی نزولی',
      sortAscending: 'مرتب‌سازی صعودی',
      sortNone: 'بدون مرتب‌سازی',
      activateNone: 'غیرفعال‌سازی مرتب‌سازی',
      activateDescending: 'غیرفعال‌سازی مرتب‌سازی نزولی',
      activateAscending: 'غیرفعال‌سازی مرتب‌سازی صعودی'
    },
    sortBy: 'مرتب‌سازی براساس'
  },
  dataFooter: {
    itemsPerPageText: 'ردیف در صفحه:',
    itemsPerPageAll: 'همه',
    nextPage: 'صفحه‌ی بعد',
    prevPage: 'صفحه‌ی قبل',
    firstPage: 'صفحه‌ی یکم',
    lastPage: 'صفحه‌ی آخر',
    pageText: '{0} تا {1} از {2}'
  },
  datePicker: {
    itemsSelected: '{0} انتخاب شده',
    nextMonthAriaLabel: 'ماه بعد',
    nextYearAriaLabel: 'سال بعد',
    prevMonthAriaLabel: 'ماه قبل',
    prevYearAriaLabel: 'سال قبل'
  },
  noDataText: 'داده‌ای موجود نیست',
  carousel: {
    prev: 'اسلاید قبلی',
    next: 'اسلاید بعدی',
    ariaLabel: {
      delimiter: 'اسلاید {0} از {1}'
    }
  },
  calendar: {
    moreEvents: '{بیشتر {0'
  },
  fileInput: {
    counter: '{0} پرونده',
    counterSize: '{0} پرونده ({1} در کل)'
  },
  timePicker: {
    am: 'قبل از ظهر',
    pm: 'بعد از ظهر'
  },
  pagination: {
    ariaLabel: {
      root: 'جهت یابی صفحه',
      next: 'صفحه بعد',
      previous: 'صفحه قبلی',
      page: 'برو صفحه {0}',
      currentPage: '{0} صفحه فعلی ، صفحه',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/fi.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/fi.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Infopiste',
  close: 'Sulje',
  dataIterator: {
    noResultsText: 'Ei osumia',
    loadingText: 'Ladataan kohteita...'
  },
  dataTable: {
    itemsPerPageText: 'Rivejä sivulla:',
    ariaLabel: {
      sortDescending: ': Järjestetty laskevasti. Poista järjestäminen aktivoimalla.',
      sortAscending: ': Järjestetty nousevasti. Järjestä laskevasti aktivoimalla.',
      sortNone: ': Ei järjestetty. Järjestä nousevasti aktivoimalla.',
      activateNone: 'Aktivoi lajittelun poistamiseksi.',
      activateDescending: 'Aktivoi laskevien laskevien lajittelemiseksi.',
      activateAscending: 'Aktivoi lajitella nouseva.'
    },
    sortBy: 'Järjestä'
  },
  dataFooter: {
    itemsPerPageText: 'Kohteita sivulla:',
    itemsPerPageAll: 'Kaikki',
    nextPage: 'Seuraava sivu',
    prevPage: 'Edellinen sivu',
    firstPage: 'Ensimmäinen sivu',
    lastPage: 'Viimeinen sivu',
    pageText: '{0}-{1} ({2})'
  },
  datePicker: {
    itemsSelected: '{0} valittu',
    nextMonthAriaLabel: 'Seuraava kuukausi',
    nextYearAriaLabel: 'Ensi vuosi',
    prevMonthAriaLabel: 'Edellinen kuukausi',
    prevYearAriaLabel: 'Edellinen vuosi'
  },
  noDataText: 'Ei dataa',
  carousel: {
    prev: 'Edellinen kuva',
    next: 'Seuraava kuva',
    ariaLabel: {
      delimiter: 'Karusellin kuva {0}/{1}'
    }
  },
  calendar: {
    moreEvents: '{0} lisää'
  },
  fileInput: {
    counter: '{0} tiedostoa',
    counterSize: '{0} tiedostoa ({1} yhteensä)'
  },
  timePicker: {
    am: 'ap.',
    pm: 'ip.'
  },
  pagination: {
    ariaLabel: {
      root: 'Pagination Navigation',
      next: 'Next page',
      previous: 'Previous page',
      page: 'Goto Page {0}',
      currentPage: 'Current Page, Page {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/fr.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/fr.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Badge',
  close: 'Fermer',
  dataIterator: {
    noResultsText: 'Aucun enregistrement correspondant trouvé',
    loadingText: `Chargement de l'élément...`
  },
  dataTable: {
    itemsPerPageText: 'Lignes par page :',
    ariaLabel: {
      sortDescending: 'Tri décroissant.',
      sortAscending: 'Tri croissant.',
      sortNone: 'Non trié.',
      activateNone: 'Activer pour supprimer le tri.',
      activateDescending: 'Activer pour trier par ordre décroissant.',
      activateAscending: 'Activer pour trier par ordre croissant.'
    },
    sortBy: 'Trier par'
  },
  dataFooter: {
    itemsPerPageText: 'Élements par page :',
    itemsPerPageAll: 'Tous',
    nextPage: 'Page suivante',
    prevPage: 'Page précédente',
    firstPage: 'Première page',
    lastPage: 'Dernière page',
    pageText: '{0}-{1} de {2}'
  },
  datePicker: {
    itemsSelected: '{0} sélectionné(s)',
    nextMonthAriaLabel: 'Le mois prochain',
    nextYearAriaLabel: `L'année prochaine`,
    prevMonthAriaLabel: 'Le mois précédent',
    prevYearAriaLabel: 'Année précédente'
  },
  noDataText: 'Aucune donnée disponible',
  carousel: {
    prev: 'Visuel précédent',
    next: 'Visuel suivant',
    ariaLabel: {
      delimiter: 'Diapositive {0} de {1}'
    }
  },
  calendar: {
    moreEvents: '{0} de plus'
  },
  fileInput: {
    counter: '{0} fichier(s)',
    counterSize: '{0} fichier(s) ({1} au total)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Navigation de pagination',
      next: 'Page suivante',
      previous: 'Page précédente',
      page: 'Aller à la page {0}',
      currentPage: 'Page actuelle, Page {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Note de {0} sur {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/he.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/he.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'תג',
  close: 'סגור',
  dataIterator: {
    noResultsText: 'לא נמצאו תוצאות מתאימות',
    loadingText: 'טוען פריט...'
  },
  dataTable: {
    itemsPerPageText: 'שורות לעמוד:',
    ariaLabel: {
      sortDescending: 'ממוין לפי סדר עולה. לחץ להספקת המיון.',
      sortAscending: 'ממוין לפי סדר יורד. לחץ למיון לפי סדר עולה.',
      sortNone: 'לא ממוין. לחץ למיון לפי סדר עולה.',
      activateNone: 'הפעל להסרת המיון.',
      activateDescending: 'הפעל למיון יורד.',
      activateAscending: 'הפעל למיון עולה.'
    },
    sortBy: 'סדר לפי'
  },
  dataFooter: {
    itemsPerPageText: 'פריטים לדף:',
    itemsPerPageAll: 'הכל',
    nextPage: 'עמוד הבא',
    prevPage: 'עמוד הקודם',
    firstPage: 'עמוד ראשון',
    lastPage: 'עמוד אחרון',
    pageText: '{0}-{1} מתוך {2}'
  },
  datePicker: {
    itemsSelected: '{0} נבחרו',
    nextMonthAriaLabel: 'חודש הבא',
    nextYearAriaLabel: 'שנה הבאה',
    prevMonthAriaLabel: 'חודש שעבר',
    prevYearAriaLabel: 'שנה שעברה'
  },
  noDataText: 'אין נתונים זמינים',
  carousel: {
    prev: 'מצג קודם',
    next: 'מצג הבא',
    ariaLabel: {
      delimiter: 'Carousel slide {0} of {1}'
    }
  },
  calendar: {
    moreEvents: '{0} נוספים'
  },
  fileInput: {
    counter: '{0} קבצים',
    counterSize: '{0} קבצים ({1} בסך הכל)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'ניווט עימוד',
      next: 'עמוד הבא',
      previous: 'עמוד הקודם',
      page: '{0} לך לעמוד',
      currentPage: '{0} עמוד נוכחי, עמוד',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/hr.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/hr.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Bedž',
  close: 'Zatvori',
  dataIterator: {
    noResultsText: 'Nisu pronađene odgovarajuće stavke',
    loadingText: 'Učitavanje...'
  },
  dataTable: {
    itemsPerPageText: 'Redaka po stranici:',
    ariaLabel: {
      sortDescending: 'Sortirano silazno.',
      sortAscending: 'Sortirano uzlazno.',
      sortNone: 'Nije sortirano.',
      activateNone: 'Odaberite za uklanjanje sortiranja.',
      activateDescending: 'Odaberite za silazno sortiranje.',
      activateAscending: 'Odaberite za uzlazno sortiranje.'
    },
    sortBy: 'Sortirajte po'
  },
  dataFooter: {
    itemsPerPageText: 'Stavki po stranici:',
    itemsPerPageAll: 'Sve',
    nextPage: 'Sljedeća stranica',
    prevPage: 'Prethodna stranica',
    firstPage: 'Prva stranica',
    lastPage: 'Posljednja stranica',
    pageText: '{0}-{1} od {2}'
  },
  datePicker: {
    itemsSelected: '{0} odabrano',
    nextMonthAriaLabel: 'Sljedeći mjesec',
    nextYearAriaLabel: 'Slijedeće godine',
    prevMonthAriaLabel: 'Prethodni mjesec',
    prevYearAriaLabel: 'Prošla godina'
  },
  noDataText: 'Nema dostupnih podataka',
  carousel: {
    prev: 'Prethodno',
    next: 'Sljedeće',
    ariaLabel: {
      delimiter: 'Carousel slide {0} of {1}'
    }
  },
  calendar: {
    moreEvents: 'Još {0}'
  },
  fileInput: {
    counter: 'Odabranih datoteka: {0}',
    counterSize: 'Odabranih datoteka: {0} ({1} ukupno)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Navigacija stranicama',
      next: 'Sljedeća stranica',
      previous: 'Prethodna stranica',
      page: 'Idi na stranicu {0}',
      currentPage: 'Trenutna stranica, stranica {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/hu.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/hu.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Jelvény',
  close: 'Bezárás',
  dataIterator: {
    noResultsText: 'Nincs egyező találat',
    loadingText: 'Betöltés...'
  },
  dataTable: {
    itemsPerPageText: 'Elem oldalanként:',
    ariaLabel: {
      sortDescending: 'Csökkenő sorrendbe rendezve.',
      sortAscending: 'Növekvő sorrendbe rendezve.',
      sortNone: 'Rendezetlen.',
      activateNone: 'Rendezés törlése.',
      activateDescending: 'Aktiváld a csökkenő rendezésért.',
      activateAscending: 'Aktiváld a növekvő rendezésért.'
    },
    sortBy: 'Rendezés'
  },
  dataFooter: {
    itemsPerPageText: 'Elem oldalanként:',
    itemsPerPageAll: 'Mind',
    nextPage: 'Következő oldal',
    prevPage: 'Előző oldal',
    firstPage: 'Első oldal',
    lastPage: 'Utolsó oldal',
    pageText: '{0}-{1} / {2}'
  },
  datePicker: {
    itemsSelected: '{0} kiválasztva',
    nextMonthAriaLabel: 'Következő hónap',
    nextYearAriaLabel: 'Következő év',
    prevMonthAriaLabel: 'Előző hónap',
    prevYearAriaLabel: 'Előző év'
  },
  noDataText: 'Nincs elérhető adat',
  carousel: {
    prev: 'Előző',
    next: 'Következő',
    ariaLabel: {
      delimiter: 'Dia {0}/{1}'
    }
  },
  calendar: {
    moreEvents: '{0} további'
  },
  fileInput: {
    counter: '{0} fájl',
    counterSize: '{0} fájl ({1} összesen)'
  },
  timePicker: {
    am: 'de',
    pm: 'du'
  },
  pagination: {
    ariaLabel: {
      root: 'Oldal navigáció',
      next: 'Következő oldal',
      previous: 'Előző oldal',
      page: 'Menj a(z) {0}. oldalra',
      currentPage: 'Aktuális oldal: {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/id.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/id.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Lencana',
  close: 'Tutup',
  dataIterator: {
    noResultsText: 'Tidak ditemukan catatan yang cocok',
    loadingText: 'Memuat data...'
  },
  dataTable: {
    itemsPerPageText: 'Baris per halaman:',
    ariaLabel: {
      sortDescending: 'Diurutkan kebawah.',
      sortAscending: 'Diurutkan keatas.',
      sortNone: 'Tidak diurutkan.',
      activateNone: 'Aktifkan untuk menghapus penyortiran.',
      activateDescending: 'Aktifkan untuk mengurutkan kebawah.',
      activateAscending: 'Aktifkan untuk mengurutkan keatas.'
    },
    sortBy: 'Urutkan berdasar'
  },
  dataFooter: {
    itemsPerPageText: 'Item per halaman:',
    itemsPerPageAll: 'Semua',
    nextPage: 'Halaman selanjutnya',
    prevPage: 'Halaman sebelumnya',
    firstPage: 'Halaman pertama',
    lastPage: 'Halaman terakhir',
    pageText: '{0}-{1} dari {2}'
  },
  datePicker: {
    itemsSelected: '{0} dipilih',
    nextMonthAriaLabel: 'Bulan depan',
    nextYearAriaLabel: 'Tahun depan',
    prevMonthAriaLabel: 'Bulan sebelumnya',
    prevYearAriaLabel: 'Tahun sebelumnya'
  },
  noDataText: 'Tidak ada data tersedia',
  carousel: {
    prev: 'Visual sebelumnya',
    next: 'Visual selanjutnya',
    ariaLabel: {
      delimiter: 'Carousel slide {0} of {1}'
    }
  },
  calendar: {
    moreEvents: '{0} lagi'
  },
  fileInput: {
    counter: '{0} berkas',
    counterSize: '{0} berkas (dari total {1})'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Navigasi Pagination',
      next: 'Halaman selanjutnya',
      previous: 'Halaman sebelumnya',
      page: 'Buka halaman {0}',
      currentPage: 'Halaman Saat Ini, Halaman {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/index.mjs":
/*!***************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/index.mjs ***!
  \***************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "af": function() { return /* reexport safe */ _af_mjs__WEBPACK_IMPORTED_MODULE_0__["default"]; },
/* harmony export */   "ar": function() { return /* reexport safe */ _ar_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]; },
/* harmony export */   "bg": function() { return /* reexport safe */ _bg_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]; },
/* harmony export */   "ca": function() { return /* reexport safe */ _ca_mjs__WEBPACK_IMPORTED_MODULE_3__["default"]; },
/* harmony export */   "ckb": function() { return /* reexport safe */ _ckb_mjs__WEBPACK_IMPORTED_MODULE_4__["default"]; },
/* harmony export */   "cs": function() { return /* reexport safe */ _cs_mjs__WEBPACK_IMPORTED_MODULE_5__["default"]; },
/* harmony export */   "da": function() { return /* reexport safe */ _da_mjs__WEBPACK_IMPORTED_MODULE_6__["default"]; },
/* harmony export */   "de": function() { return /* reexport safe */ _de_mjs__WEBPACK_IMPORTED_MODULE_7__["default"]; },
/* harmony export */   "el": function() { return /* reexport safe */ _el_mjs__WEBPACK_IMPORTED_MODULE_8__["default"]; },
/* harmony export */   "en": function() { return /* reexport safe */ _en_mjs__WEBPACK_IMPORTED_MODULE_9__["default"]; },
/* harmony export */   "es": function() { return /* reexport safe */ _es_mjs__WEBPACK_IMPORTED_MODULE_10__["default"]; },
/* harmony export */   "et": function() { return /* reexport safe */ _et_mjs__WEBPACK_IMPORTED_MODULE_11__["default"]; },
/* harmony export */   "fa": function() { return /* reexport safe */ _fa_mjs__WEBPACK_IMPORTED_MODULE_12__["default"]; },
/* harmony export */   "fi": function() { return /* reexport safe */ _fi_mjs__WEBPACK_IMPORTED_MODULE_13__["default"]; },
/* harmony export */   "fr": function() { return /* reexport safe */ _fr_mjs__WEBPACK_IMPORTED_MODULE_14__["default"]; },
/* harmony export */   "hr": function() { return /* reexport safe */ _hr_mjs__WEBPACK_IMPORTED_MODULE_15__["default"]; },
/* harmony export */   "hu": function() { return /* reexport safe */ _hu_mjs__WEBPACK_IMPORTED_MODULE_16__["default"]; },
/* harmony export */   "he": function() { return /* reexport safe */ _he_mjs__WEBPACK_IMPORTED_MODULE_17__["default"]; },
/* harmony export */   "id": function() { return /* reexport safe */ _id_mjs__WEBPACK_IMPORTED_MODULE_18__["default"]; },
/* harmony export */   "it": function() { return /* reexport safe */ _it_mjs__WEBPACK_IMPORTED_MODULE_19__["default"]; },
/* harmony export */   "ja": function() { return /* reexport safe */ _ja_mjs__WEBPACK_IMPORTED_MODULE_20__["default"]; },
/* harmony export */   "ko": function() { return /* reexport safe */ _ko_mjs__WEBPACK_IMPORTED_MODULE_21__["default"]; },
/* harmony export */   "lv": function() { return /* reexport safe */ _lv_mjs__WEBPACK_IMPORTED_MODULE_22__["default"]; },
/* harmony export */   "lt": function() { return /* reexport safe */ _lt_mjs__WEBPACK_IMPORTED_MODULE_23__["default"]; },
/* harmony export */   "nl": function() { return /* reexport safe */ _nl_mjs__WEBPACK_IMPORTED_MODULE_24__["default"]; },
/* harmony export */   "no": function() { return /* reexport safe */ _no_mjs__WEBPACK_IMPORTED_MODULE_25__["default"]; },
/* harmony export */   "pl": function() { return /* reexport safe */ _pl_mjs__WEBPACK_IMPORTED_MODULE_26__["default"]; },
/* harmony export */   "pt": function() { return /* reexport safe */ _pt_mjs__WEBPACK_IMPORTED_MODULE_27__["default"]; },
/* harmony export */   "ro": function() { return /* reexport safe */ _ro_mjs__WEBPACK_IMPORTED_MODULE_28__["default"]; },
/* harmony export */   "ru": function() { return /* reexport safe */ _ru_mjs__WEBPACK_IMPORTED_MODULE_29__["default"]; },
/* harmony export */   "sk": function() { return /* reexport safe */ _sk_mjs__WEBPACK_IMPORTED_MODULE_30__["default"]; },
/* harmony export */   "sl": function() { return /* reexport safe */ _sl_mjs__WEBPACK_IMPORTED_MODULE_31__["default"]; },
/* harmony export */   "srCyrl": function() { return /* reexport safe */ _sr_Cyrl_mjs__WEBPACK_IMPORTED_MODULE_32__["default"]; },
/* harmony export */   "srLatn": function() { return /* reexport safe */ _sr_Latn_mjs__WEBPACK_IMPORTED_MODULE_33__["default"]; },
/* harmony export */   "sv": function() { return /* reexport safe */ _sv_mjs__WEBPACK_IMPORTED_MODULE_34__["default"]; },
/* harmony export */   "th": function() { return /* reexport safe */ _th_mjs__WEBPACK_IMPORTED_MODULE_35__["default"]; },
/* harmony export */   "tr": function() { return /* reexport safe */ _tr_mjs__WEBPACK_IMPORTED_MODULE_36__["default"]; },
/* harmony export */   "az": function() { return /* reexport safe */ _az_mjs__WEBPACK_IMPORTED_MODULE_37__["default"]; },
/* harmony export */   "uk": function() { return /* reexport safe */ _uk_mjs__WEBPACK_IMPORTED_MODULE_38__["default"]; },
/* harmony export */   "vi": function() { return /* reexport safe */ _vi_mjs__WEBPACK_IMPORTED_MODULE_39__["default"]; },
/* harmony export */   "zhHans": function() { return /* reexport safe */ _zh_Hans_mjs__WEBPACK_IMPORTED_MODULE_40__["default"]; },
/* harmony export */   "zhHant": function() { return /* reexport safe */ _zh_Hant_mjs__WEBPACK_IMPORTED_MODULE_41__["default"]; },
/* harmony export */   "rtl": function() { return /* binding */ rtl; }
/* harmony export */ });
/* harmony import */ var _af_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./af.mjs */ "./node_modules/vuetify/lib/locale/af.mjs");
/* harmony import */ var _ar_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ar.mjs */ "./node_modules/vuetify/lib/locale/ar.mjs");
/* harmony import */ var _bg_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./bg.mjs */ "./node_modules/vuetify/lib/locale/bg.mjs");
/* harmony import */ var _ca_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ca.mjs */ "./node_modules/vuetify/lib/locale/ca.mjs");
/* harmony import */ var _ckb_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ckb.mjs */ "./node_modules/vuetify/lib/locale/ckb.mjs");
/* harmony import */ var _cs_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./cs.mjs */ "./node_modules/vuetify/lib/locale/cs.mjs");
/* harmony import */ var _da_mjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./da.mjs */ "./node_modules/vuetify/lib/locale/da.mjs");
/* harmony import */ var _de_mjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./de.mjs */ "./node_modules/vuetify/lib/locale/de.mjs");
/* harmony import */ var _el_mjs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./el.mjs */ "./node_modules/vuetify/lib/locale/el.mjs");
/* harmony import */ var _en_mjs__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./en.mjs */ "./node_modules/vuetify/lib/locale/en.mjs");
/* harmony import */ var _es_mjs__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./es.mjs */ "./node_modules/vuetify/lib/locale/es.mjs");
/* harmony import */ var _et_mjs__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./et.mjs */ "./node_modules/vuetify/lib/locale/et.mjs");
/* harmony import */ var _fa_mjs__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./fa.mjs */ "./node_modules/vuetify/lib/locale/fa.mjs");
/* harmony import */ var _fi_mjs__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./fi.mjs */ "./node_modules/vuetify/lib/locale/fi.mjs");
/* harmony import */ var _fr_mjs__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./fr.mjs */ "./node_modules/vuetify/lib/locale/fr.mjs");
/* harmony import */ var _hr_mjs__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./hr.mjs */ "./node_modules/vuetify/lib/locale/hr.mjs");
/* harmony import */ var _hu_mjs__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./hu.mjs */ "./node_modules/vuetify/lib/locale/hu.mjs");
/* harmony import */ var _he_mjs__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./he.mjs */ "./node_modules/vuetify/lib/locale/he.mjs");
/* harmony import */ var _id_mjs__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./id.mjs */ "./node_modules/vuetify/lib/locale/id.mjs");
/* harmony import */ var _it_mjs__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./it.mjs */ "./node_modules/vuetify/lib/locale/it.mjs");
/* harmony import */ var _ja_mjs__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./ja.mjs */ "./node_modules/vuetify/lib/locale/ja.mjs");
/* harmony import */ var _ko_mjs__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./ko.mjs */ "./node_modules/vuetify/lib/locale/ko.mjs");
/* harmony import */ var _lv_mjs__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./lv.mjs */ "./node_modules/vuetify/lib/locale/lv.mjs");
/* harmony import */ var _lt_mjs__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./lt.mjs */ "./node_modules/vuetify/lib/locale/lt.mjs");
/* harmony import */ var _nl_mjs__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./nl.mjs */ "./node_modules/vuetify/lib/locale/nl.mjs");
/* harmony import */ var _no_mjs__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./no.mjs */ "./node_modules/vuetify/lib/locale/no.mjs");
/* harmony import */ var _pl_mjs__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./pl.mjs */ "./node_modules/vuetify/lib/locale/pl.mjs");
/* harmony import */ var _pt_mjs__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./pt.mjs */ "./node_modules/vuetify/lib/locale/pt.mjs");
/* harmony import */ var _ro_mjs__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./ro.mjs */ "./node_modules/vuetify/lib/locale/ro.mjs");
/* harmony import */ var _ru_mjs__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./ru.mjs */ "./node_modules/vuetify/lib/locale/ru.mjs");
/* harmony import */ var _sk_mjs__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./sk.mjs */ "./node_modules/vuetify/lib/locale/sk.mjs");
/* harmony import */ var _sl_mjs__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./sl.mjs */ "./node_modules/vuetify/lib/locale/sl.mjs");
/* harmony import */ var _sr_Cyrl_mjs__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./sr-Cyrl.mjs */ "./node_modules/vuetify/lib/locale/sr-Cyrl.mjs");
/* harmony import */ var _sr_Latn_mjs__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ./sr-Latn.mjs */ "./node_modules/vuetify/lib/locale/sr-Latn.mjs");
/* harmony import */ var _sv_mjs__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ./sv.mjs */ "./node_modules/vuetify/lib/locale/sv.mjs");
/* harmony import */ var _th_mjs__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ./th.mjs */ "./node_modules/vuetify/lib/locale/th.mjs");
/* harmony import */ var _tr_mjs__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ./tr.mjs */ "./node_modules/vuetify/lib/locale/tr.mjs");
/* harmony import */ var _az_mjs__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! ./az.mjs */ "./node_modules/vuetify/lib/locale/az.mjs");
/* harmony import */ var _uk_mjs__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! ./uk.mjs */ "./node_modules/vuetify/lib/locale/uk.mjs");
/* harmony import */ var _vi_mjs__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! ./vi.mjs */ "./node_modules/vuetify/lib/locale/vi.mjs");
/* harmony import */ var _zh_Hans_mjs__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! ./zh-Hans.mjs */ "./node_modules/vuetify/lib/locale/zh-Hans.mjs");
/* harmony import */ var _zh_Hant_mjs__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! ./zh-Hant.mjs */ "./node_modules/vuetify/lib/locale/zh-Hant.mjs");










































const rtl = {
  af: false,
  ar: true,
  bg: false,
  ca: false,
  ckb: false,
  cs: false,
  de: false,
  el: false,
  en: false,
  es: false,
  et: false,
  fa: false,
  fi: false,
  fr: false,
  hr: false,
  hu: false,
  he: true,
  id: false,
  it: false,
  ja: false,
  ko: false,
  lv: false,
  lt: false,
  nl: false,
  no: false,
  pl: false,
  pt: false,
  ro: false,
  ru: false,
  sk: false,
  sl: false,
  srCyrl: false,
  srLatn: false,
  sv: false,
  th: false,
  tr: false,
  az: false,
  uk: false,
  vi: false,
  zhHans: false,
  zhHant: false
};

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/it.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/it.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Distintivo',
  close: 'Chiudi',
  dataIterator: {
    noResultsText: 'Nessun risultato trovato',
    loadingText: 'Caricamento in corso...'
  },
  dataTable: {
    itemsPerPageText: 'Righe per pagina:',
    ariaLabel: {
      sortDescending: 'Ordinati in ordine decrescente.',
      sortAscending: 'Ordinati in ordine crescente.',
      sortNone: 'Non ordinato.',
      activateNone: `Attiva per rimuovere l'ordinamento.`,
      activateDescending: 'Attiva per ordinare in ordine decrescente.',
      activateAscending: 'Attiva per ordinare in ordine crescente.'
    },
    sortBy: 'Ordina per'
  },
  dataFooter: {
    itemsPerPageText: 'Elementi per pagina:',
    itemsPerPageAll: 'Tutti',
    nextPage: 'Pagina seguente',
    prevPage: 'Pagina precedente',
    firstPage: 'Pagina prima',
    lastPage: 'Pagina ultima',
    pageText: '{0}-{1} di {2}'
  },
  datePicker: {
    itemsSelected: '{0} selezionati',
    nextMonthAriaLabel: 'Il prossimo mese',
    nextYearAriaLabel: `L'anno prossimo`,
    prevMonthAriaLabel: 'Il mese scorso',
    prevYearAriaLabel: `L'anno scorso`
  },
  noDataText: 'Nessun elemento disponibile',
  carousel: {
    prev: 'Vista precedente',
    next: 'Prossima vista',
    ariaLabel: {
      delimiter: 'Carousel slide {0} of {1}'
    }
  },
  calendar: {
    moreEvents: '{0} di più'
  },
  fileInput: {
    counter: '{0} files',
    counterSize: '{0} files ({1} in totale)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Navigazione impaginazione',
      next: 'Pagina seguente',
      previous: 'Pagina precedente',
      page: 'Vai alla pagina {0}',
      currentPage: 'Pagina corrente, pagina {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/ja.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/ja.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'バッジ',
  close: '閉じる',
  dataIterator: {
    noResultsText: '検索結果が見つかりません。',
    loadingText: '項目をロード中です...'
  },
  dataTable: {
    itemsPerPageText: '1ページあたりの行数：',
    ariaLabel: {
      sortDescending: '降順の並び替え。',
      sortAscending: '昇順の並び替え。',
      sortNone: 'ソートされていません。',
      activateNone: 'ソートを削除するには有効にしてください。',
      activateDescending: '降順の並び替えのためには有効にしてください。',
      activateAscending: '昇順のソートのためには有効にしてください。'
    },
    sortBy: 'ソート方式'
  },
  dataFooter: {
    itemsPerPageText: '1ページあたりの件数：',
    itemsPerPageAll: 'すべて',
    nextPage: '次のページ',
    prevPage: '前のページ',
    firstPage: '最初のページ',
    lastPage: '最後のページ',
    pageText: '{0}-{1} 件目 / {2}件'
  },
  datePicker: {
    itemsSelected: '{0}日付選択',
    nextMonthAriaLabel: '来月',
    nextYearAriaLabel: '来年',
    prevMonthAriaLabel: '前月',
    prevYearAriaLabel: '前年'
  },
  noDataText: 'データはありません。',
  carousel: {
    prev: '前のビジュアル',
    next: '次のビジュアル',
    ariaLabel: {
      delimiter: 'カルーセルのスライド {0}件目 / {1}件'
    }
  },
  calendar: {
    moreEvents: 'さらに{0}'
  },
  fileInput: {
    counter: '{0} ファイル',
    counterSize: '{0} ファイル (合計 {1})'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'ページネーションナビゲーション',
      next: '次のページ',
      previous: '前のページ',
      page: '{0}ページ目に移動',
      currentPage: '現在のページ、ページ {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: '評価 {1} のうち {0}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/ko.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/ko.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: '배지',
  close: '닫기',
  dataIterator: {
    noResultsText: '일치하는 항목이 없습니다.',
    loadingText: '불러오는 중...'
  },
  dataTable: {
    itemsPerPageText: '페이지 당 행 수:',
    ariaLabel: {
      sortDescending: '내림차순 정렬.',
      sortAscending: '오름차순 정렬.',
      sortNone: '정렬하지 않음.',
      activateNone: '정렬을 취소하려면 활성화하세요.',
      activateDescending: '내림차순 정렬을 위해 활성화하세요.',
      activateAscending: '오름차순 정렬을 위해 활성화하세요.'
    },
    sortBy: 'Sort by'
  },
  dataFooter: {
    itemsPerPageText: '페이지 당 항목 수:',
    itemsPerPageAll: '전체',
    nextPage: '다음 페이지',
    prevPage: '이전 페이지',
    firstPage: '첫 페이지',
    lastPage: '마지막 페이지',
    pageText: '{2} 중 {0}-{1}'
  },
  datePicker: {
    itemsSelected: '{0} 선택됨',
    nextMonthAriaLabel: '다음 달',
    nextYearAriaLabel: '내년',
    prevMonthAriaLabel: '지난달',
    prevYearAriaLabel: '전년도'
  },
  noDataText: '데이터가 없습니다.',
  carousel: {
    prev: '이전 화면',
    next: '다음 화면',
    ariaLabel: {
      delimiter: 'Carousel slide {0} of {1}'
    }
  },
  calendar: {
    moreEvents: '{0} 더보기'
  },
  fileInput: {
    counter: '{0} files',
    counterSize: '{0} files ({1} in total)'
  },
  timePicker: {
    am: '오전',
    pm: '오후'
  },
  pagination: {
    ariaLabel: {
      root: 'Pagination Navigation',
      next: '다음 페이지',
      previous: '이전 페이지',
      page: '고토 페이지 {0}',
      currentPage: '현재 페이지, 페이지 {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/lt.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/lt.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Ženklelis',
  close: 'Uždaryti',
  dataIterator: {
    noResultsText: 'Nerasta atitinkančių įrašų',
    loadingText: 'Kraunama...'
  },
  dataTable: {
    itemsPerPageText: 'Eilutės per puslapį:',
    ariaLabel: {
      sortDescending: 'Išrikiuota mažėjimo tvarka.',
      sortAscending: 'Išrikiuota didėjimo tvarka.',
      sortNone: 'Nerikiuota.',
      activateNone: 'Suaktyvinkite, jei norite rikiavimą pašalinti.',
      activateDescending: 'Suaktyvinkite, jei norite rikiuoti mažėjimo tvarka.',
      activateAscending: 'Suaktyvinkite, jei norite rikiuoti didėjimo tvarka.'
    },
    sortBy: 'Sort by'
  },
  dataFooter: {
    itemsPerPageText: 'Įrašai per puslapį:',
    itemsPerPageAll: 'Visi',
    nextPage: 'Kitas puslapis',
    prevPage: 'Ankstesnis puslapis',
    firstPage: 'Pirmas puslapis',
    lastPage: 'Paskutinis puslapis',
    pageText: '{0}-{1} iš {2}'
  },
  datePicker: {
    itemsSelected: '{0} pasirinkta',
    nextMonthAriaLabel: 'Kitą mėnesį',
    nextYearAriaLabel: 'Kitais metais',
    prevMonthAriaLabel: 'Praeita mėnesį',
    prevYearAriaLabel: 'Praeiti metai'
  },
  noDataText: 'Nėra duomenų',
  carousel: {
    prev: 'Ankstesnioji skaidrė',
    next: 'Kita skaidrė',
    ariaLabel: {
      delimiter: 'Carousel slide {0} of {1}'
    }
  },
  calendar: {
    moreEvents: 'Daugiau {0}'
  },
  fileInput: {
    counter: '{0} failų',
    counterSize: '{0} failų ({1} iš viso)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Puslapio naršymas',
      next: 'Kitas puslapis',
      previous: 'Ankstesnis puslapis',
      page: 'Eiti į puslapį {0}',
      currentPage: 'Dabartinis puslapis, puslapis {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/lv.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/lv.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Žetons',
  close: 'Aizvērt',
  dataIterator: {
    noResultsText: 'Nekas netika atrasts',
    loadingText: 'Ielādē...'
  },
  dataTable: {
    itemsPerPageText: 'Rādīt lapā:',
    ariaLabel: {
      sortDescending: 'Sakārtots dilstošā secībā.',
      sortAscending: 'Sakārtots augošā secībā.',
      sortNone: 'Nav sakārtots.',
      activateNone: 'Aktivizēt, lai noņemtu kārtošanu.',
      activateDescending: 'Aktivizēt, lai sakārtotu dilstošā secībā.',
      activateAscending: 'Aktivizēt, lai sakārtotu augošā secībā.'
    },
    sortBy: 'Sort by'
  },
  dataFooter: {
    itemsPerPageText: 'Rādīt lapā:',
    itemsPerPageAll: 'Visu',
    nextPage: 'Nākamā lapa',
    prevPage: 'Iepriekšējā lapa',
    firstPage: 'Pirmā lapa',
    lastPage: 'Pēdējā lapa',
    pageText: '{0}-{1} no {2}'
  },
  datePicker: {
    itemsSelected: '{0} izvēlēts',
    nextMonthAriaLabel: 'Nākammēnes',
    nextYearAriaLabel: 'Nākamgad',
    prevMonthAriaLabel: 'Iepriekšējais mēnesis',
    prevYearAriaLabel: 'Iepriekšējais gads'
  },
  noDataText: 'Nav pieejamu datu',
  carousel: {
    prev: 'Iepriekšējais slaids',
    next: 'Nākamais slaids',
    ariaLabel: {
      delimiter: 'Carousel slide {0} of {1}'
    }
  },
  calendar: {
    moreEvents: 'Vēl {0}'
  },
  fileInput: {
    counter: '{0} files',
    counterSize: '{0} files ({1} in total)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Navigācija paginationā',
      next: 'Nākamā lapa',
      previous: 'Iepriekšējā lapa',
      page: 'Iet uz lapu {0}',
      currentPage: 'Pašreizējā lapa, lapa {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/nl.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/nl.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'insigne',
  close: 'Sluiten',
  dataIterator: {
    noResultsText: 'Geen overeenkomende resultaten gevonden',
    loadingText: 'Items aan het laden...'
  },
  dataTable: {
    itemsPerPageText: 'Rijen per pagina:',
    ariaLabel: {
      sortDescending: 'Aflopend gesorteerd.',
      sortAscending: 'Oplopend gesorteerd.',
      sortNone: 'Niet gesorteerd.',
      activateNone: 'Activeer om de sortering te verwijderen.',
      activateDescending: 'Activeer om aflopend te sorteren.',
      activateAscending: 'Activeer om oplopend te sorteren.'
    },
    sortBy: 'Sorteer volgens'
  },
  dataFooter: {
    itemsPerPageText: 'Aantal per pagina:',
    itemsPerPageAll: 'Alles',
    nextPage: 'Volgende pagina',
    prevPage: 'Vorige pagina',
    firstPage: 'Eerste pagina',
    lastPage: 'Laatste pagina',
    pageText: '{0}-{1} van {2}'
  },
  datePicker: {
    itemsSelected: '{0} geselecteerd',
    nextMonthAriaLabel: 'Volgende maand',
    nextYearAriaLabel: 'Volgend jaar',
    prevMonthAriaLabel: 'Vorige maand',
    prevYearAriaLabel: 'Vorig jaar'
  },
  noDataText: 'Geen gegevens beschikbaar',
  carousel: {
    prev: 'Vorig beeld',
    next: 'Volgend beeld',
    ariaLabel: {
      delimiter: 'Carousel slide {0} of {1}'
    }
  },
  calendar: {
    moreEvents: '{0} meer'
  },
  fileInput: {
    counter: '{0} bestanden',
    counterSize: '{0} bestanden ({1} in totaal)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Paginanavigatie',
      next: 'Volgende pagina',
      previous: 'Vorige pagina',
      page: 'Ga naar pagina {0}',
      currentPage: 'Huidige pagina, pagina {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/no.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/no.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Skilt',
  close: 'Lukk',
  dataIterator: {
    noResultsText: 'Fant ingen matchende elementer.',
    loadingText: 'Laster elementer...'
  },
  dataTable: {
    itemsPerPageText: 'Rader per side:',
    ariaLabel: {
      sortDescending: 'Sortert synkende.',
      sortAscending: 'Sortert stigende.',
      sortNone: 'Ikke sortert.',
      activateNone: 'Aktiver for å fjerne sortering.',
      activateDescending: 'Aktiver for å sortere synkende.',
      activateAscending: 'Aktiver for å sortere stigende.'
    },
    sortBy: 'Sorter etter'
  },
  dataFooter: {
    itemsPerPageText: 'Elementer per side:',
    itemsPerPageAll: 'Alle',
    nextPage: 'Neste side',
    prevPage: 'Forrige side',
    firstPage: 'Første side',
    lastPage: 'Siste side',
    pageText: '{0}-{1} av {2}'
  },
  datePicker: {
    itemsSelected: '{0} valgt',
    nextMonthAriaLabel: 'Neste måned',
    nextYearAriaLabel: 'Neste år',
    prevMonthAriaLabel: 'Forrige måned',
    prevYearAriaLabel: 'Forrige år'
  },
  noDataText: 'Ingen data er tilgjengelig',
  carousel: {
    prev: 'Forrige bilde',
    next: 'Neste bilde',
    ariaLabel: {
      delimiter: 'Karusellbilde {0} av {1}'
    }
  },
  calendar: {
    moreEvents: '{0} flere'
  },
  fileInput: {
    counter: '{0} filer',
    counterSize: '{0} filer ({1} totalt)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Paginasjonsnavigasjon',
      next: 'Neste side',
      previous: 'Forrige side',
      page: 'Gå til side {0}',
      currentPage: 'Gjeldende side, side {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/pl.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/pl.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Odznaka',
  close: 'Zamknij',
  dataIterator: {
    noResultsText: 'Nie znaleziono danych odpowiadających wyszukiwaniu',
    loadingText: 'Wczytywanie danych...'
  },
  dataTable: {
    itemsPerPageText: 'Wierszy na stronie:',
    ariaLabel: {
      sortDescending: 'Sortowanie malejąco. Kliknij aby zmienić.',
      sortAscending: 'Sortowanie rosnąco. Kliknij aby zmienić.',
      sortNone: 'Bez sortowania. Kliknij aby posortować rosnąco.',
      activateNone: 'Kliknij aby usunąć sortowanie.',
      activateDescending: 'Kliknij aby posortować malejąco.',
      activateAscending: 'Kliknij aby posortować rosnąco.'
    },
    sortBy: 'Sortuj według'
  },
  dataFooter: {
    itemsPerPageText: 'Pozycji na stronie:',
    itemsPerPageAll: 'Wszystkie',
    nextPage: 'Następna strona',
    prevPage: 'Poprzednia strona',
    firstPage: 'Pierwsza strona',
    lastPage: 'Ostatnia strona',
    pageText: '{0}-{1} z {2}'
  },
  datePicker: {
    itemsSelected: '{0} dat(y)',
    nextMonthAriaLabel: 'Następny miesiąc',
    nextYearAriaLabel: 'Następny rok',
    prevMonthAriaLabel: 'Poprzedni miesiąc',
    prevYearAriaLabel: 'Poprzedni rok'
  },
  noDataText: 'Brak danych',
  carousel: {
    prev: 'Poprzedni obraz',
    next: 'Następny obraz',
    ariaLabel: {
      delimiter: 'Carousel slide {0} of {1}'
    }
  },
  calendar: {
    moreEvents: '{0} więcej'
  },
  fileInput: {
    counter: 'Liczba plików: {0}',
    counterSize: 'Liczba plików: {0} (łącznie {1})'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Nawigacja paginacyjna',
      next: 'Następna strona',
      previous: 'Poprzednia strona',
      page: 'Idź do strony {0}',
      currentPage: 'Bieżąca strona, strona {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/pt.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/pt.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Distintivo',
  close: 'Fechar',
  dataIterator: {
    noResultsText: 'Nenhum dado encontrado',
    loadingText: 'Carregando itens...'
  },
  dataTable: {
    itemsPerPageText: 'Linhas por página:',
    ariaLabel: {
      sortDescending: 'Ordenado decrescente.',
      sortAscending: 'Ordenado crescente.',
      sortNone: 'Não ordenado.',
      activateNone: 'Ative para remover a ordenação.',
      activateDescending: 'Ative para ordenar decrescente.',
      activateAscending: 'Ative para ordenar crescente.'
    },
    sortBy: 'Ordenar por'
  },
  dataFooter: {
    itemsPerPageText: 'Itens por página:',
    itemsPerPageAll: 'Todos',
    nextPage: 'Próxima página',
    prevPage: 'Página anterior',
    firstPage: 'Primeira página',
    lastPage: 'Última página',
    pageText: '{0}-{1} de {2}'
  },
  datePicker: {
    itemsSelected: '{0} selecionado(s)',
    nextMonthAriaLabel: 'Próximo mês',
    nextYearAriaLabel: 'Próximo ano',
    prevMonthAriaLabel: 'Mês anterior',
    prevYearAriaLabel: 'Ano anterior'
  },
  noDataText: 'Não há dados disponíveis',
  carousel: {
    prev: 'Visão anterior',
    next: 'Próxima visão',
    ariaLabel: {
      delimiter: 'Slide {0} de {1} do carrossel'
    }
  },
  calendar: {
    moreEvents: 'Mais {0}'
  },
  fileInput: {
    counter: '{0} arquivo(s)',
    counterSize: '{0} arquivo(s) ({1} no total)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Navegação de paginação',
      next: 'Próxima página',
      previous: 'Página anterior',
      page: 'Ir à página {0}',
      currentPage: 'Página atual, página {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/ro.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/ro.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Insignă',
  close: 'Închideți',
  dataIterator: {
    noResultsText: 'Nu s-au găsit înregistrări corespunzătoare',
    loadingText: 'Se încarcă articolele...'
  },
  dataTable: {
    itemsPerPageText: 'Rânduri pe pagină:',
    ariaLabel: {
      sortDescending: 'Sortate descendent.',
      sortAscending: 'Sortate ascendent.',
      sortNone: 'Nesortate.',
      activateNone: 'Activați pentru a elimina sortarea.',
      activateDescending: 'Activați pentru a sorta descendent.',
      activateAscending: 'Activați pentru a sorta ascendent.'
    },
    sortBy: 'Sortați după'
  },
  dataFooter: {
    itemsPerPageText: 'Articole pe pagină:',
    itemsPerPageAll: 'Toate',
    nextPage: 'Pagina următoare',
    prevPage: 'Pagina anterioară',
    firstPage: 'Prima pagină',
    lastPage: 'Ultima pagină',
    pageText: '{0}-{1} din {2}'
  },
  datePicker: {
    itemsSelected: '{0} selectate',
    nextMonthAriaLabel: 'Luna următoare',
    nextYearAriaLabel: 'Anul următor',
    prevMonthAriaLabel: 'Luna anterioară',
    prevYearAriaLabel: 'Anul anterior'
  },
  noDataText: 'Nu există date disponibile',
  carousel: {
    prev: 'Grafica anterioară',
    next: 'Grafica următoare',
    ariaLabel: {
      delimiter: 'Slide carusel {0} din {1}'
    }
  },
  calendar: {
    moreEvents: 'încă {0}'
  },
  fileInput: {
    counter: '{0} fișiere',
    counterSize: '{0} fișiere ({1} în total)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Navigare prin paginare',
      next: 'Pagina următoare',
      previous: 'Pagina anterioară',
      page: 'Mergeți la pagina {0}',
      currentPage: 'Pagina curentă, pagina {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating de {0} din {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/ru.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/ru.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'знак',
  close: 'Закрыть',
  dataIterator: {
    noResultsText: 'Не найдено подходящих записей',
    loadingText: 'Запись загружается...'
  },
  dataTable: {
    itemsPerPageText: 'Строк на странице:',
    ariaLabel: {
      sortDescending: 'Упорядочено по убыванию.',
      sortAscending: 'Упорядочено по возрастанию.',
      sortNone: 'Не упорядочено.',
      activateNone: 'Активируйте, чтобы убрать сортировку.',
      activateDescending: 'Активируйте для упорядочивания убыванию.',
      activateAscending: 'Активируйте для упорядочивания по возрастанию.'
    },
    sortBy: 'Сортировать по'
  },
  dataFooter: {
    itemsPerPageText: 'Записей на странице:',
    itemsPerPageAll: 'Все',
    nextPage: 'Следующая страница',
    prevPage: 'Предыдущая страница',
    firstPage: 'Первая страница',
    lastPage: 'Последняя страница',
    pageText: '{0}-{1} из {2}'
  },
  datePicker: {
    itemsSelected: '{0} выбран',
    nextMonthAriaLabel: 'Следующий месяц',
    nextYearAriaLabel: 'Следующий год',
    prevMonthAriaLabel: 'Прошлый месяц',
    prevYearAriaLabel: 'Предыдущий год'
  },
  noDataText: 'Отсутствуют данные',
  carousel: {
    prev: 'Предыдущий слайд',
    next: 'Следующий слайд',
    ariaLabel: {
      delimiter: 'Слайд {0} из {1}'
    }
  },
  calendar: {
    moreEvents: 'Еще {0}'
  },
  fileInput: {
    counter: 'Файлов: {0}',
    counterSize: 'Файлов: {0} (всего {1})'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Навигация по страницам',
      next: 'Следующая страница',
      previous: 'Предыдущая страница',
      page: 'Перейти на страницу {0}',
      currentPage: 'Текущая страница, Страница {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/sk.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/sk.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Odznak',
  close: 'Zavrieť',
  dataIterator: {
    noResultsText: 'Neboli nájdené žiadne záznamy',
    loadingText: 'Načítavam položky...'
  },
  dataTable: {
    itemsPerPageText: 'Počet riadkov na stránku:',
    ariaLabel: {
      sortDescending: 'Zoradené zostupne.',
      sortAscending: 'Zoradené vzostupne.',
      sortNone: 'Nezoradené.',
      activateNone: 'Aktivujte na zrušenie triedenia.',
      activateDescending: 'Aktivujte na zoradenie zostupne.',
      activateAscending: 'Aktivujte na zoradenie vzostupne.'
    },
    sortBy: 'Zoradiť podľa'
  },
  dataFooter: {
    itemsPerPageText: 'Počet položiek na stránku:',
    itemsPerPageAll: 'Všetko',
    nextPage: 'Ďalšia stránka',
    prevPage: 'Predchádzajúca stránka',
    firstPage: 'Prvá stránka',
    lastPage: 'Posledná stránka',
    pageText: '{0}–{1} z {2}'
  },
  datePicker: {
    itemsSelected: '{0} vybrané',
    nextMonthAriaLabel: 'Ďalší mesiac',
    nextYearAriaLabel: 'Ďalší rok',
    prevMonthAriaLabel: 'Predchádzajúci mesiac',
    prevYearAriaLabel: 'Predchádzajúci rok'
  },
  noDataText: 'Nie sú dostupné žiadne dáta',
  carousel: {
    prev: 'Predchádzajúci obrázok',
    next: 'Další obrázok',
    ariaLabel: {
      delimiter: 'Snímka {0} z {1}'
    }
  },
  calendar: {
    moreEvents: '{0} ďalších'
  },
  fileInput: {
    counter: '{0} súborov',
    counterSize: '{0} súborov ({1} celkom)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Navigácia stránkovania',
      next: 'Ďalšia stránka',
      previous: 'Predchádzajúca stránka',
      page: 'Ísť na stránku {0}',
      currentPage: 'Aktuálna stránka, stránka {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Hodnotenie {0} z {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/sl.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/sl.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Značka',
  close: 'Zapri',
  dataIterator: {
    noResultsText: 'Ni iskanega zapisa',
    loadingText: 'Nalaganje...'
  },
  dataTable: {
    itemsPerPageText: 'Vrstic na stran:',
    ariaLabel: {
      sortDescending: 'Razvrščeno padajoče.',
      sortAscending: 'Razvrščeno naraščajoče.',
      sortNone: 'Ni razvrščeno.',
      activateNone: 'Aktivirajte za odstranitev razvrščanja.',
      activateDescending: 'Aktivirajte za padajoče razvrščanje.',
      activateAscending: 'Aktivirajte za naraščajoče razvrščanje.'
    },
    sortBy: 'Razvrsti po'
  },
  dataFooter: {
    itemsPerPageText: 'Predmetov na stran:',
    itemsPerPageAll: 'Vse',
    nextPage: 'Naslednja stran',
    prevPage: 'Prejšnja stran',
    firstPage: 'Prva stran',
    lastPage: 'Zadnja stran',
    pageText: '{0}-{1} od {2}'
  },
  datePicker: {
    itemsSelected: '{0} izbrano/-ih',
    nextMonthAriaLabel: 'Naslednji mesec',
    nextYearAriaLabel: 'Naslednje leto',
    prevMonthAriaLabel: 'Prejšnji mesec',
    prevYearAriaLabel: 'Prejšnje leto'
  },
  noDataText: 'Ni podatkov',
  carousel: {
    prev: 'Prejšnji prikaz',
    next: 'Naslednji prikaz',
    ariaLabel: {
      delimiter: 'Carousel slide {0} of {1}'
    }
  },
  calendar: {
    moreEvents: 'Še {0}'
  },
  fileInput: {
    counter: '{0} datotek',
    counterSize: '{0} datotek ({1} skupno)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Navigacija po strani po strani',
      next: 'Naslednja stran',
      previous: 'Prejšnja stran',
      page: 'Pojdi na stran {0}',
      currentPage: 'Trenutna stran, stran {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/sr-Cyrl.mjs":
/*!*****************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/sr-Cyrl.mjs ***!
  \*****************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Значка',
  close: 'Затвори',
  dataIterator: {
    noResultsText: 'Ни један запис није пронађен',
    loadingText: 'Учитавање ставке...'
  },
  dataTable: {
    itemsPerPageText: 'Редова по страници:',
    ariaLabel: {
      sortDescending: 'Сортирано опадајуће.',
      sortAscending: 'Сортирано растуће.',
      sortNone: 'Није сортирано.',
      activateNone: 'Кликни да уклониш сортирање.',
      activateDescending: 'Кликни да сортираш опадајуће.',
      activateAscending: 'Кликни да сортираш растуће.'
    },
    sortBy: 'Сортирај по'
  },
  dataFooter: {
    itemsPerPageText: 'Ставки по страници:',
    itemsPerPageAll: 'Све',
    nextPage: 'Следећа страница',
    prevPage: 'Претходна страница',
    firstPage: 'Прва страница',
    lastPage: 'Последња страница',
    pageText: '{0}-{1} од {2}'
  },
  datePicker: {
    itemsSelected: '{0} одабрано',
    nextMonthAriaLabel: 'Следећег месеца',
    nextYearAriaLabel: 'Следеће године',
    prevMonthAriaLabel: 'Претходни месец',
    prevYearAriaLabel: 'Претходна година'
  },
  noDataText: 'Нема доступних података',
  carousel: {
    prev: 'Претходна слика',
    next: 'Следећа слика',
    ariaLabel: {
      delimiter: 'Слика {0} од {1}'
    }
  },
  calendar: {
    moreEvents: '{0} више'
  },
  fileInput: {
    counter: '{0} фајлова',
    counterSize: '{0} фајлова ({1} укупно)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Навигација страницама',
      next: 'Следећа страница',
      previous: 'Претходна страница',
      page: 'Иди на страну {0}',
      currentPage: 'Тренутна страница, страница {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Оцена {0} од {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/sr-Latn.mjs":
/*!*****************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/sr-Latn.mjs ***!
  \*****************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Značka',
  close: 'Zatvori',
  dataIterator: {
    noResultsText: 'Nijedan zapis nije pronađen',
    loadingText: 'Učitavanje stavke...'
  },
  dataTable: {
    itemsPerPageText: 'Redova po stranici:',
    ariaLabel: {
      sortDescending: 'Sortirano opadajuće.',
      sortAscending: 'Sortirano rastuće.',
      sortNone: 'Nije sortirano.',
      activateNone: 'Klikni da ukloniš sortiranje.',
      activateDescending: 'Klikni da sortiraš opadajuće.',
      activateAscending: 'Klikni da sortiraš rastuće.'
    },
    sortBy: 'Sortiraj po'
  },
  dataFooter: {
    itemsPerPageText: 'Stavki po stranici:',
    itemsPerPageAll: 'Sve',
    nextPage: 'Sledeća stranica',
    prevPage: 'Prethodna stranica',
    firstPage: 'Prva stranica',
    lastPage: 'Poslednja stranica',
    pageText: '{0}-{1} od {2}'
  },
  datePicker: {
    itemsSelected: '{0} odabrano',
    nextMonthAriaLabel: 'Sledećeg meseca',
    nextYearAriaLabel: 'Sledeće godine',
    prevMonthAriaLabel: 'Prethodni mesec',
    prevYearAriaLabel: 'Prethodna godina'
  },
  noDataText: 'Nema dostupnih podataka',
  carousel: {
    prev: 'Prethodna slika',
    next: 'Sledeća slika',
    ariaLabel: {
      delimiter: 'Slika {0} od {1}'
    }
  },
  calendar: {
    moreEvents: '{0} više'
  },
  fileInput: {
    counter: '{0} fajlova',
    counterSize: '{0} fajlova ({1} ukupno)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Navigacija stranicama',
      next: 'Sledeća stranica',
      previous: 'Prethodna stranica',
      page: 'Idi na stranu {0}',
      currentPage: 'Trenutna stranica, stranica {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Ocena {0} od {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/sv.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/sv.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Bricka',
  close: 'Stäng',
  dataIterator: {
    noResultsText: 'Inga poster funna',
    loadingText: 'Laddar data...'
  },
  dataTable: {
    itemsPerPageText: 'Rader per sida:',
    ariaLabel: {
      sortDescending: 'Sorterat fallande.',
      sortAscending: 'Sorterat stigande.',
      sortNone: 'Osorterat.',
      activateNone: 'Aktivera för att ta bort sortering.',
      activateDescending: 'Aktivera för sortering fallande.',
      activateAscending: 'Aktivera för sortering stigande.'
    },
    sortBy: 'Sortera efter'
  },
  dataFooter: {
    itemsPerPageText: 'Objekt per sida:',
    itemsPerPageAll: 'Alla',
    nextPage: 'Nästa sida',
    prevPage: 'Föregående sida',
    firstPage: 'Första sidan',
    lastPage: 'Sista sidan',
    pageText: '{0}-{1} av {2}'
  },
  datePicker: {
    itemsSelected: '{0} markerade',
    nextMonthAriaLabel: 'Nästa månad',
    nextYearAriaLabel: 'Nästa år',
    prevMonthAriaLabel: 'Förra månaden',
    prevYearAriaLabel: 'Förra året'
  },
  noDataText: 'Ingen data tillgänglig',
  carousel: {
    prev: 'Föregående vy',
    next: 'Nästa vy',
    ariaLabel: {
      delimiter: 'Carousel slide {0} of {1}'
    }
  },
  calendar: {
    moreEvents: '{0} fler'
  },
  fileInput: {
    counter: '{0} filer',
    counterSize: '{0} filer (av {1} totalt)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Pagination Navigation',
      next: 'Nästa sida',
      previous: 'Föregående sida',
      page: 'Gå till sidan {0}',
      currentPage: 'Aktuell sida, sida {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/th.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/th.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'สัญลักษณ์',
  close: 'ปิด',
  dataIterator: {
    noResultsText: 'ไม่พบข้อมูลที่ค้นหา',
    loadingText: 'กำลังโหลดข้อมูล...'
  },
  dataTable: {
    itemsPerPageText: 'แถวต่อหน้า:',
    ariaLabel: {
      sortDescending: 'เรียงจากมากไปน้อยอยู่',
      sortAscending: 'เรียงจากน้อยไปมากอยู่',
      sortNone: 'ไม่ได้เรียงลำดับ',
      activateNone: 'กดเพื่อปิดการเรียงลำดับ',
      activateDescending: 'กดเพื่อเรียงจากมากไปน้อย',
      activateAscending: 'กดเพื่อเรียงจากน้อยไปมาก'
    },
    sortBy: 'เรียงตาม'
  },
  dataFooter: {
    itemsPerPageText: 'รายการต่อหน้า:',
    itemsPerPageAll: 'ทั้งหมด',
    nextPage: 'หน้าต่อไป',
    prevPage: 'หน้าที่แล้ว',
    firstPage: 'หน้าแรก',
    lastPage: 'หน้าสุดท้าย',
    pageText: '{0}-{1} จาก {2}'
  },
  datePicker: {
    itemsSelected: 'เลือก {0} วัน',
    nextMonthAriaLabel: 'เดือนถัดไป',
    nextYearAriaLabel: 'ปีถัดไป',
    prevMonthAriaLabel: 'เดือนก่อนหน้า',
    prevYearAriaLabel: 'ปีก่อนหน้า'
  },
  noDataText: 'ไม่มีข้อมูล',
  carousel: {
    prev: 'ภาพก่อนหน้า',
    next: 'ภาพถัดไป',
    ariaLabel: {
      delimiter: 'ภาพสไลด์ที่ {0} จาก {1}'
    }
  },
  calendar: {
    moreEvents: 'มีอีก {0}'
  },
  fileInput: {
    counter: '{0} ไฟล์',
    counterSize: '{0} ไฟล์ (รวม {1})'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'การนำทางไปยังหน้า',
      next: 'หน้าต่อไป',
      previous: 'หน้าที่แล้ว',
      page: 'ไปที่หน้า {0}',
      currentPage: 'หน้าปัจจุบัน (หน้า {0})',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/tr.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/tr.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'rozet',
  close: 'Kapat',
  dataIterator: {
    noResultsText: 'Eşleşen veri bulunamadı',
    loadingText: 'Yükleniyor... Lütfen bekleyin.'
  },
  dataTable: {
    itemsPerPageText: 'Sayfa başına satır:',
    ariaLabel: {
      sortDescending: 'Z den A ya sıralı.',
      sortAscending: 'A dan Z ye sıralı.',
      sortNone: 'Sıralı değil. ',
      activateNone: 'Sıralamayı kaldırmak için etkinleştir.',
      activateDescending: 'Z den A ya sıralamak için etkinleştir.',
      activateAscending: 'A dan Z ye sıralamak için etkinleştir.'
    },
    sortBy: 'Sırala'
  },
  dataFooter: {
    itemsPerPageText: 'Sayfa başına satır:',
    itemsPerPageAll: 'Hepsi',
    nextPage: 'Sonraki sayfa',
    prevPage: 'Önceki sayfa',
    firstPage: 'İlk sayfa',
    lastPage: 'Son sayfa',
    pageText: '{0} - {1} arası, Toplam: {2} kayıt'
  },
  datePicker: {
    itemsSelected: '{0} öge seçildi',
    nextMonthAriaLabel: 'Gelecek ay',
    nextYearAriaLabel: 'Gelecek yıl',
    prevMonthAriaLabel: 'Geçtiğimiz ay',
    prevYearAriaLabel: 'Geçen yıl'
  },
  noDataText: 'Bu görünümde veri yok.',
  carousel: {
    prev: 'Önceki görsel',
    next: 'Sonraki görsel',
    ariaLabel: {
      delimiter: 'Galeri sayfa {0} / {1}'
    }
  },
  calendar: {
    moreEvents: '{0} tane daha'
  },
  fileInput: {
    counter: '{0} dosya',
    counterSize: '{0} dosya (toplamda {1})'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Sayfalandırma Navigasyonu',
      next: 'Sonraki sayfa',
      previous: 'Önceki sayfa',
      page: 'Sayfaya git {0}',
      currentPage: 'Geçerli Sayfa, Sayfa {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/uk.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/uk.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Знак',
  close: 'Закрити',
  dataIterator: {
    noResultsText: 'В результаті пошуку нічого не знайдено',
    loadingText: 'Завантаження...'
  },
  dataTable: {
    itemsPerPageText: 'Рядків на сторінці:',
    ariaLabel: {
      sortDescending: 'Відсортовано за спаданням.',
      sortAscending: 'Відсортовано за зростанням.',
      sortNone: 'Не відсортовано.',
      activateNone: 'Активувати, щоб видалити сортування.',
      activateDescending: 'Активувати, щоб відсортувати за спаданням.',
      activateAscending: 'Активувати, щоб відсортувати за зростанням.'
    },
    sortBy: 'Відсортувати за'
  },
  dataFooter: {
    itemsPerPageText: 'Елементів на сторінці:',
    itemsPerPageAll: 'Всі',
    nextPage: 'Наступна сторінка',
    prevPage: 'Попередня сторінка',
    firstPage: 'Перша сторінка',
    lastPage: 'Остання сторінка',
    pageText: '{0}-{1} з {2}'
  },
  datePicker: {
    itemsSelected: '{0} вибрано',
    nextMonthAriaLabel: 'Наступного місяця',
    nextYearAriaLabel: 'Наступного року',
    prevMonthAriaLabel: 'Попередній місяць',
    prevYearAriaLabel: 'Попередній рік'
  },
  noDataText: 'Немає даних для відображення',
  carousel: {
    prev: 'Попередній слайд',
    next: 'Наступий слайд',
    ariaLabel: {
      delimiter: 'Слайд {0} з {1}'
    }
  },
  calendar: {
    moreEvents: 'Ще {0}'
  },
  fileInput: {
    counter: '{0} файлів',
    counterSize: '{0} файлів ({1} загалом)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Навігація по сторінках',
      next: 'Наступна сторінка',
      previous: 'Попередня сторінка',
      page: 'Перейти на сторінку {0}',
      currentPage: 'Поточна сторінка, Сторінка {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/vi.mjs":
/*!************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/vi.mjs ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: 'Huy hiệu',
  close: 'Đóng',
  dataIterator: {
    noResultsText: 'Không tìm thấy kết quả nào',
    loadingText: 'Đang tải...'
  },
  dataTable: {
    itemsPerPageText: 'Số hàng mỗi trang:',
    ariaLabel: {
      sortDescending: 'Sắp xếp giảm dần.',
      sortAscending: 'Sắp xếp tăng dần.',
      sortNone: 'Không sắp xếp.',
      activateNone: 'Kích hoạt để bỏ sắp xếp.',
      activateDescending: 'Kích hoạt để sắp xếp giảm dần.',
      activateAscending: 'Kích hoạt để sắp xếp tăng dần.'
    },
    sortBy: 'Sắp xếp'
  },
  dataFooter: {
    itemsPerPageText: 'Số mục mỗi trang:',
    itemsPerPageAll: 'Toàn bộ',
    nextPage: 'Trang tiếp theo',
    prevPage: 'Trang trước',
    firstPage: 'Trang đầu',
    lastPage: 'Trang cuối',
    pageText: '{0}-{1} trên {2}'
  },
  datePicker: {
    itemsSelected: '{0} được chọn',
    nextMonthAriaLabel: 'Tháng sau',
    nextYearAriaLabel: 'Năm sau',
    prevMonthAriaLabel: 'Tháng trước',
    prevYearAriaLabel: 'Năm trước'
  },
  noDataText: 'Không có dữ liệu',
  carousel: {
    prev: 'Ảnh tiếp theo',
    next: 'Ảnh trước',
    ariaLabel: {
      delimiter: 'Carousel slide {0} trên {1}'
    }
  },
  calendar: {
    moreEvents: '{0} nữa'
  },
  fileInput: {
    counter: '{0} tệp',
    counterSize: '{0} tệp (tổng cộng {1})'
  },
  timePicker: {
    am: 'SA',
    pm: 'CH'
  },
  pagination: {
    ariaLabel: {
      root: 'Điều hướng phân trang',
      next: 'Trang tiếp theo',
      previous: 'Trang trước',
      page: 'Đến trang {0}',
      currentPage: 'Trang hiện tại, Trang {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Đánh giá {0} trên {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/zh-Hans.mjs":
/*!*****************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/zh-Hans.mjs ***!
  \*****************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: '徽章',
  close: '关闭',
  dataIterator: {
    noResultsText: '没有符合条件的结果',
    loadingText: '加载中……'
  },
  dataTable: {
    itemsPerPageText: '每页数目：',
    ariaLabel: {
      sortDescending: '：降序排列。',
      sortAscending: '：升序排列。',
      sortNone: '：未排序。',
      activateNone: '点击以移除排序。',
      activateDescending: '点击以降序排列。',
      activateAscending: '点击以升序排列。'
    },
    sortBy: '排序方式'
  },
  dataFooter: {
    itemsPerPageText: '每页数目：',
    itemsPerPageAll: '全部',
    nextPage: '下一页',
    prevPage: '上一页',
    firstPage: '首页',
    lastPage: '尾页',
    pageText: '{0}-{1} 共 {2}'
  },
  datePicker: {
    itemsSelected: '已选择 {0}',
    nextMonthAriaLabel: '下个月',
    nextYearAriaLabel: '明年',
    prevMonthAriaLabel: '前一个月',
    prevYearAriaLabel: '前一年'
  },
  noDataText: '没有数据',
  carousel: {
    prev: '上一张',
    next: '下一张',
    ariaLabel: {
      delimiter: 'Carousel slide {0} of {1}'
    }
  },
  calendar: {
    moreEvents: '还有 {0} 项'
  },
  fileInput: {
    counter: '{0} 个文件',
    counterSize: '{0} 个文件（共 {1}）'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: '分页导航',
      next: '下一页',
      previous: '上一页',
      page: '转到页面 {0}',
      currentPage: '当前页 {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/locale/zh-Hant.mjs":
/*!*****************************************************!*\
  !*** ./node_modules/vuetify/lib/locale/zh-Hant.mjs ***!
  \*****************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  badge: '徽章',
  close: '關閉',
  dataIterator: {
    noResultsText: '沒有符合條件的結果',
    loadingText: '讀取中...'
  },
  dataTable: {
    itemsPerPageText: '每頁列數：',
    ariaLabel: {
      sortDescending: '：降序排列。',
      sortAscending: '：升序排列。',
      sortNone: '無排序方式。點擊以升序排列。',
      activateNone: '點擊以移除排序方式。',
      activateDescending: '點擊以降序排列。',
      activateAscending: '點擊以移除排序方式。'
    },
    sortBy: '排序方式'
  },
  dataFooter: {
    itemsPerPageText: '每頁項目：',
    itemsPerPageAll: '全部',
    nextPage: '下一頁',
    prevPage: '上一頁',
    firstPage: '第一頁',
    lastPage: '最後頁',
    pageText: '{2} 條中的 {0}~{1} 條'
  },
  datePicker: {
    itemsSelected: '已選擇 {0}',
    nextMonthAriaLabel: '下個月',
    nextYearAriaLabel: '明年',
    prevMonthAriaLabel: '前一個月',
    prevYearAriaLabel: '前一年'
  },
  noDataText: '沒有資料',
  carousel: {
    prev: '上一張',
    next: '下一張',
    ariaLabel: {
      delimiter: 'Carousel slide {0} of {1}'
    }
  },
  calendar: {
    moreEvents: '還有其他 {0} 項'
  },
  fileInput: {
    counter: '{0} 個檔案',
    counterSize: '{0} 個檔案（共 {1}）'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: '分頁導航',
      next: '下一頁',
      previous: '上一頁',
      page: '轉到頁面 {0}',
      currentPage: '當前頁 {0}',
      first: 'First page',
      last: 'Last page'
    }
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  }
});

/***/ }),

/***/ "./node_modules/vuetify/lib/util/color/APCA.mjs":
/*!******************************************************!*\
  !*** ./node_modules/vuetify/lib/util/color/APCA.mjs ***!
  \******************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "APCAcontrast": function() { return /* binding */ APCAcontrast; }
/* harmony export */ });
/**
 * WCAG 3.0 APCA perceptual contrast algorithm from https://github.com/Myndex/SAPC-APCA
 * @licence https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 * @see https://www.w3.org/WAI/GL/task-forces/silver/wiki/Visual_Contrast_of_Text_Subgroup
 */
// MAGICAL NUMBERS
// sRGB Conversion to Relative Luminance (Y)
// Transfer Curve (aka "Gamma") for sRGB linearization
// Simple power curve vs piecewise described in docs
// Essentially, 2.4 best models actual display
// characteristics in combination with the total method
const mainTRC = 2.4;
const Rco = 0.2126729; // sRGB Red Coefficient (from matrix)

const Gco = 0.7151522; // sRGB Green Coefficient (from matrix)

const Bco = 0.0721750; // sRGB Blue Coefficient (from matrix)
// For Finding Raw SAPC Contrast from Relative Luminance (Y)
// Constants for SAPC Power Curve Exponents
// One pair for normal text, and one for reverse
// These are the "beating heart" of SAPC

const normBG = 0.55;
const normTXT = 0.58;
const revTXT = 0.57;
const revBG = 0.62; // For Clamping and Scaling Values

const blkThrs = 0.03; // Level that triggers the soft black clamp

const blkClmp = 1.45; // Exponent for the soft black clamp curve

const deltaYmin = 0.0005; // Lint trap

const scaleBoW = 1.25; // Scaling for dark text on light

const scaleWoB = 1.25; // Scaling for light text on dark

const loConThresh = 0.078; // Threshold for new simple offset scale

const loConFactor = 12.82051282051282; // = 1/0.078,

const loConOffset = 0.06; // The simple offset

const loClip = 0.001; // Output clip (lint trap #2)

function APCAcontrast(text, background) {
  // Linearize sRGB
  const Rtxt = ((text >> 16 & 0xff) / 255) ** mainTRC;
  const Gtxt = ((text >> 8 & 0xff) / 255) ** mainTRC;
  const Btxt = ((text >> 0 & 0xff) / 255) ** mainTRC;
  const Rbg = ((background >> 16 & 0xff) / 255) ** mainTRC;
  const Gbg = ((background >> 8 & 0xff) / 255) ** mainTRC;
  const Bbg = ((background >> 0 & 0xff) / 255) ** mainTRC; // Apply the standard coefficients and sum to Y

  let Ytxt = Rtxt * Rco + Gtxt * Gco + Btxt * Bco;
  let Ybg = Rbg * Rco + Gbg * Gco + Bbg * Bco; // Soft clamp Y when near black.
  // Now clamping all colors to prevent crossover errors

  if (Ytxt <= blkThrs) Ytxt += (blkThrs - Ytxt) ** blkClmp;
  if (Ybg <= blkThrs) Ybg += (blkThrs - Ybg) ** blkClmp; // Return 0 Early for extremely low ∆Y (lint trap #1)

  if (Math.abs(Ybg - Ytxt) < deltaYmin) return 0.0; // SAPC CONTRAST

  let outputContrast; // For weighted final values

  if (Ybg > Ytxt) {
    // For normal polarity, black text on white
    // Calculate the SAPC contrast value and scale
    const SAPC = (Ybg ** normBG - Ytxt ** normTXT) * scaleBoW; // NEW! SAPC SmoothScale™
    // Low Contrast Smooth Scale Rollout to prevent polarity reversal
    // and also a low clip for very low contrasts (lint trap #2)
    // much of this is for very low contrasts, less than 10
    // therefore for most reversing needs, only loConOffset is important

    outputContrast = SAPC < loClip ? 0.0 : SAPC < loConThresh ? SAPC - SAPC * loConFactor * loConOffset : SAPC - loConOffset;
  } else {
    // For reverse polarity, light text on dark
    // WoB should always return negative value.
    const SAPC = (Ybg ** revBG - Ytxt ** revTXT) * scaleWoB;
    outputContrast = SAPC > -loClip ? 0.0 : SAPC > -loConThresh ? SAPC - SAPC * loConFactor * loConOffset : SAPC + loConOffset;
  }

  return outputContrast * 100;
}

/***/ }),

/***/ "./node_modules/vuetify/lib/util/color/transformCIELAB.mjs":
/*!*****************************************************************!*\
  !*** ./node_modules/vuetify/lib/util/color/transformCIELAB.mjs ***!
  \*****************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "fromXYZ": function() { return /* binding */ fromXYZ; },
/* harmony export */   "toXYZ": function() { return /* binding */ toXYZ; }
/* harmony export */ });
const delta = 0.20689655172413793; // 6÷29

const cielabForwardTransform = t => t > delta ** 3 ? Math.cbrt(t) : t / (3 * delta ** 2) + 4 / 29;

const cielabReverseTransform = t => t > delta ? t ** 3 : 3 * delta ** 2 * (t - 4 / 29);

function fromXYZ(xyz) {
  const transform = cielabForwardTransform;
  const transformedY = transform(xyz[1]);
  return [116 * transformedY - 16, 500 * (transform(xyz[0] / 0.95047) - transformedY), 200 * (transformedY - transform(xyz[2] / 1.08883))];
}
function toXYZ(lab) {
  const transform = cielabReverseTransform;
  const Ln = (lab[0] + 16) / 116;
  return [transform(Ln + lab[1] / 500) * 0.95047, transform(Ln), transform(Ln - lab[2] / 200) * 1.08883];
}

/***/ }),

/***/ "./node_modules/vuetify/lib/util/color/transformSRGB.mjs":
/*!***************************************************************!*\
  !*** ./node_modules/vuetify/lib/util/color/transformSRGB.mjs ***!
  \***************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "fromXYZ": function() { return /* binding */ fromXYZ; },
/* harmony export */   "toXYZ": function() { return /* binding */ toXYZ; }
/* harmony export */ });
/* harmony import */ var _util_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../util/helpers.mjs */ "./node_modules/vuetify/lib/util/helpers.mjs");
 // For converting XYZ to sRGB

const srgbForwardMatrix = [[3.2406, -1.5372, -0.4986], [-0.9689, 1.8758, 0.0415], [0.0557, -0.2040, 1.0570]]; // Forward gamma adjust

const srgbForwardTransform = C => C <= 0.0031308 ? C * 12.92 : 1.055 * C ** (1 / 2.4) - 0.055; // For converting sRGB to XYZ


const srgbReverseMatrix = [[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]]; // Reverse gamma adjust

const srgbReverseTransform = C => C <= 0.04045 ? C / 12.92 : ((C + 0.055) / 1.055) ** 2.4;

function fromXYZ(xyz) {
  const rgb = Array(3);
  const transform = srgbForwardTransform;
  const matrix = srgbForwardMatrix; // Matrix transform, then gamma adjustment

  for (let i = 0; i < 3; ++i) {
    rgb[i] = Math.round((0,_util_helpers_mjs__WEBPACK_IMPORTED_MODULE_0__.clamp)(transform(matrix[i][0] * xyz[0] + matrix[i][1] * xyz[1] + matrix[i][2] * xyz[2])) * 255);
  } // Rescale back to [0, 255]


  return (rgb[0] << 16) + (rgb[1] << 8) + (rgb[2] << 0);
}
function toXYZ(rgb) {
  const xyz = [0, 0, 0];
  const transform = srgbReverseTransform;
  const matrix = srgbReverseMatrix; // Rescale from [0, 255] to [0, 1] then adjust sRGB gamma to linear RGB

  const r = transform((rgb >> 16 & 0xff) / 255);
  const g = transform((rgb >> 8 & 0xff) / 255);
  const b = transform((rgb >> 0 & 0xff) / 255); // Matrix color space transform

  for (let i = 0; i < 3; ++i) {
    xyz[i] = matrix[i][0] * r + matrix[i][1] * g + matrix[i][2] * b;
  }

  return xyz;
}

/***/ }),

/***/ "./node_modules/vuetify/lib/util/colorUtils.mjs":
/*!******************************************************!*\
  !*** ./node_modules/vuetify/lib/util/colorUtils.mjs ***!
  \******************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isCssColor": function() { return /* binding */ isCssColor; },
/* harmony export */   "colorToInt": function() { return /* binding */ colorToInt; },
/* harmony export */   "classToHex": function() { return /* binding */ classToHex; },
/* harmony export */   "intToHex": function() { return /* binding */ intToHex; },
/* harmony export */   "colorToHex": function() { return /* binding */ colorToHex; },
/* harmony export */   "HSVAtoRGBA": function() { return /* binding */ HSVAtoRGBA; },
/* harmony export */   "RGBAtoHSVA": function() { return /* binding */ RGBAtoHSVA; },
/* harmony export */   "HSVAtoHSLA": function() { return /* binding */ HSVAtoHSLA; },
/* harmony export */   "HSLAtoHSVA": function() { return /* binding */ HSLAtoHSVA; },
/* harmony export */   "RGBAtoCSS": function() { return /* binding */ RGBAtoCSS; },
/* harmony export */   "RGBtoCSS": function() { return /* binding */ RGBtoCSS; },
/* harmony export */   "RGBAtoHex": function() { return /* binding */ RGBAtoHex; },
/* harmony export */   "HexToRGBA": function() { return /* binding */ HexToRGBA; },
/* harmony export */   "HexToHSVA": function() { return /* binding */ HexToHSVA; },
/* harmony export */   "HSVAtoHex": function() { return /* binding */ HSVAtoHex; },
/* harmony export */   "parseHex": function() { return /* binding */ parseHex; },
/* harmony export */   "parseGradient": function() { return /* binding */ parseGradient; },
/* harmony export */   "RGBtoInt": function() { return /* binding */ RGBtoInt; },
/* harmony export */   "colorToRGB": function() { return /* binding */ colorToRGB; },
/* harmony export */   "lighten": function() { return /* binding */ lighten; },
/* harmony export */   "darken": function() { return /* binding */ darken; },
/* harmony export */   "getLuma": function() { return /* binding */ getLuma; },
/* harmony export */   "getContrast": function() { return /* binding */ getContrast; }
/* harmony export */ });
/* harmony import */ var core_js_modules_es_error_cause_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.error.cause.js */ "./node_modules/core-js/modules/es.error.cause.js");
/* harmony import */ var _console_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./console.mjs */ "./node_modules/vuetify/lib/util/console.mjs");
/* harmony import */ var _helpers_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./helpers.mjs */ "./node_modules/vuetify/lib/util/helpers.mjs");
/* harmony import */ var _color_transformSRGB_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./color/transformSRGB.mjs */ "./node_modules/vuetify/lib/util/color/transformSRGB.mjs");
/* harmony import */ var _color_transformCIELAB_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./color/transformCIELAB.mjs */ "./node_modules/vuetify/lib/util/color/transformCIELAB.mjs");

// Utilities



 // Types

function isCssColor(color) {
  return !!color && /^(#|var\(--|(rgb|hsl)a?\()/.test(color);
}
function colorToInt(color) {
  let rgb;

  if (typeof color === 'number') {
    rgb = color;
  } else if (typeof color === 'string') {
    let c = color.startsWith('#') ? color.substring(1) : color;

    if (c.length === 3) {
      c = c.split('').map(char => char + char).join('');
    }

    if (c.length !== 6) {
      (0,_console_mjs__WEBPACK_IMPORTED_MODULE_1__.consoleWarn)(`'${color}' is not a valid rgb color`);
    }

    rgb = parseInt(c, 16);
  } else {
    throw new TypeError(`Colors can only be numbers or strings, recieved ${color == null ? color : color.constructor.name} instead`);
  }

  if (rgb < 0) {
    (0,_console_mjs__WEBPACK_IMPORTED_MODULE_1__.consoleWarn)(`Colors cannot be negative: '${color}'`);
    rgb = 0;
  } else if (rgb > 0xffffff || isNaN(rgb)) {
    (0,_console_mjs__WEBPACK_IMPORTED_MODULE_1__.consoleWarn)(`'${color}' is not a valid rgb color`);
    rgb = 0xffffff;
  }

  return rgb;
}
function classToHex(color, colors, currentTheme) {
  const [colorName, colorModifier] = color.toString().trim().replace('-', '').split(' ', 2);
  let hexColor = '';

  if (colorName && colorName in colors) {
    if (colorModifier && colorModifier in colors[colorName]) {
      hexColor = colors[colorName][colorModifier];
    } else if ('base' in colors[colorName]) {
      hexColor = colors[colorName].base;
    }
  } else if (colorName && colorName in currentTheme) {
    hexColor = currentTheme[colorName];
  }

  return hexColor;
}
function intToHex(color) {
  let hexColor = color.toString(16);
  if (hexColor.length < 6) hexColor = '0'.repeat(6 - hexColor.length) + hexColor;
  return '#' + hexColor;
}
function colorToHex(color) {
  return intToHex(colorToInt(color));
}
/**
 * Converts HSVA to RGBA. Based on formula from https://en.wikipedia.org/wiki/HSL_and_HSV
 *
 * @param color HSVA color as an array [0-360, 0-1, 0-1, 0-1]
 */

function HSVAtoRGBA(hsva) {
  const {
    h,
    s,
    v,
    a
  } = hsva;

  const f = n => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  };

  const rgb = [f(5), f(3), f(1)].map(v => Math.round(v * 255));
  return {
    r: rgb[0],
    g: rgb[1],
    b: rgb[2],
    a
  };
}
/**
 * Converts RGBA to HSVA. Based on formula from https://en.wikipedia.org/wiki/HSL_and_HSV
 *
 * @param color RGBA color as an array [0-255, 0-255, 0-255, 0-1]
 */

function RGBAtoHSVA(rgba) {
  if (!rgba) return {
    h: 0,
    s: 1,
    v: 1,
    a: 1
  };
  const r = rgba.r / 255;
  const g = rgba.g / 255;
  const b = rgba.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;

  if (max !== min) {
    if (max === r) {
      h = 60 * (0 + (g - b) / (max - min));
    } else if (max === g) {
      h = 60 * (2 + (b - r) / (max - min));
    } else if (max === b) {
      h = 60 * (4 + (r - g) / (max - min));
    }
  }

  if (h < 0) h = h + 360;
  const s = max === 0 ? 0 : (max - min) / max;
  const hsv = [h, s, max];
  return {
    h: hsv[0],
    s: hsv[1],
    v: hsv[2],
    a: rgba.a
  };
}
function HSVAtoHSLA(hsva) {
  const {
    h,
    s,
    v,
    a
  } = hsva;
  const l = v - v * s / 2;
  const sprime = l === 1 || l === 0 ? 0 : (v - l) / Math.min(l, 1 - l);
  return {
    h,
    s: sprime,
    l,
    a
  };
}
function HSLAtoHSVA(hsl) {
  const {
    h,
    s,
    l,
    a
  } = hsl;
  const v = l + s * Math.min(l, 1 - l);
  const sprime = v === 0 ? 0 : 2 - 2 * l / v;
  return {
    h,
    s: sprime,
    v,
    a
  };
}
function RGBAtoCSS(rgba) {
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
}
function RGBtoCSS(rgba) {
  return RGBAtoCSS({ ...rgba,
    a: 1
  });
}
function RGBAtoHex(rgba) {
  const toHex = v => {
    const h = Math.round(v).toString(16);
    return ('00'.substr(0, 2 - h.length) + h).toUpperCase();
  };

  return `#${[toHex(rgba.r), toHex(rgba.g), toHex(rgba.b), toHex(Math.round(rgba.a * 255))].join('')}`;
}
function HexToRGBA(hex) {
  const rgba = (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_2__.chunk)(hex.slice(1), 2).map(c => parseInt(c, 16));
  return {
    r: rgba[0],
    g: rgba[1],
    b: rgba[2],
    a: Math.round(rgba[3] / 255 * 100) / 100
  };
}
function HexToHSVA(hex) {
  const rgb = HexToRGBA(hex);
  return RGBAtoHSVA(rgb);
}
function HSVAtoHex(hsva) {
  return RGBAtoHex(HSVAtoRGBA(hsva));
}
function parseHex(hex) {
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }

  hex = hex.replace(/([^0-9a-f])/gi, 'F');

  if (hex.length === 3 || hex.length === 4) {
    hex = hex.split('').map(x => x + x).join('');
  }

  if (hex.length === 6) {
    hex = (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_2__.padEnd)(hex, 8, 'F');
  } else {
    hex = (0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_2__.padEnd)((0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_2__.padEnd)(hex, 6), 8, 'F');
  }

  return `#${hex}`.toUpperCase().substr(0, 9);
}
function parseGradient(gradient, colors, currentTheme) {
  return gradient.replace(/([a-z]+(\s[a-z]+-[1-5])?)(?=$|,)/gi, x => {
    return classToHex(x, colors, currentTheme) || x;
  }).replace(/(rgba\()#[0-9a-f]+(?=,)/gi, x => {
    return 'rgba(' + Object.values(HexToRGBA(parseHex(x.replace(/rgba\(/, '')))).slice(0, 3).join(',');
  });
}
function RGBtoInt(rgba) {
  return (rgba.r << 16) + (rgba.g << 8) + rgba.b;
}
function colorToRGB(color) {
  const int = colorToInt(color);
  return {
    r: (int & 0xFF0000) >> 16,
    g: (int & 0xFF00) >> 8,
    b: int & 0xFF
  };
}
function lighten(value, amount) {
  const lab = _color_transformCIELAB_mjs__WEBPACK_IMPORTED_MODULE_3__.fromXYZ(_color_transformSRGB_mjs__WEBPACK_IMPORTED_MODULE_4__.toXYZ(value)); // TODO: why this false positive?
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands

  lab[0] = lab[0] + amount * 10;
  return _color_transformSRGB_mjs__WEBPACK_IMPORTED_MODULE_4__.fromXYZ(_color_transformCIELAB_mjs__WEBPACK_IMPORTED_MODULE_3__.toXYZ(lab));
}
function darken(value, amount) {
  const lab = _color_transformCIELAB_mjs__WEBPACK_IMPORTED_MODULE_3__.fromXYZ(_color_transformSRGB_mjs__WEBPACK_IMPORTED_MODULE_4__.toXYZ(value));
  lab[0] = lab[0] - amount * 10;
  return _color_transformSRGB_mjs__WEBPACK_IMPORTED_MODULE_4__.fromXYZ(_color_transformCIELAB_mjs__WEBPACK_IMPORTED_MODULE_3__.toXYZ(lab));
}
/**
 * Calculate the relative luminance of a given color
 * @see https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */

function getLuma(color) {
  const rgb = colorToInt(color);
  return _color_transformSRGB_mjs__WEBPACK_IMPORTED_MODULE_4__.toXYZ(rgb)[1];
}
/**
 * Returns the contrast ratio (1-21) between two colors.
 * @see https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */

function getContrast(first, second) {
  const l1 = getLuma(first);
  const l2 = getLuma(second);
  const light = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (light + 0.05) / (dark + 0.05);
}

/***/ }),

/***/ "./node_modules/vuetify/lib/util/console.mjs":
/*!***************************************************!*\
  !*** ./node_modules/vuetify/lib/util/console.mjs ***!
  \***************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "consoleInfo": function() { return /* binding */ consoleInfo; },
/* harmony export */   "consoleWarn": function() { return /* binding */ consoleWarn; },
/* harmony export */   "consoleError": function() { return /* binding */ consoleError; },
/* harmony export */   "deprecate": function() { return /* binding */ deprecate; },
/* harmony export */   "breaking": function() { return /* binding */ breaking; },
/* harmony export */   "removed": function() { return /* binding */ removed; }
/* harmony export */ });
/* eslint-disable no-console */
// import Vuetify from '../framework'
function createMessage(message, vm, parent) {
  // if (Vuetify.config.silent) return
  if (parent) {
    vm = {
      _isVue: true,
      $parent: parent,
      $options: vm
    };
  }

  if (vm) {
    // Only show each message once per instance
    vm.$_alreadyWarned = vm.$_alreadyWarned || [];
    if (vm.$_alreadyWarned.includes(message)) return;
    vm.$_alreadyWarned.push(message);
  }

  return `[Vuetify] ${message}` + (vm ? generateComponentTrace(vm) : '');
}

function consoleInfo(message, vm, parent) {
  const newMessage = createMessage(message, vm, parent);
  newMessage != null && console.info(newMessage);
}
function consoleWarn(message, vm, parent) {
  const newMessage = createMessage(message, vm, parent);
  newMessage != null && console.warn(newMessage);
}
function consoleError(message, vm, parent) {
  const newMessage = createMessage(message, vm, parent);
  newMessage != null && console.error(newMessage);
}
function deprecate(original, replacement, vm, parent) {
  consoleWarn(`[UPGRADE] '${original}' is deprecated, use '${replacement}' instead.`, vm, parent);
}
function breaking(original, replacement, vm, parent) {
  consoleError(`[BREAKING] '${original}' has been removed, use '${replacement}' instead. For more information, see the upgrade guide https://github.com/vuetifyjs/vuetify/releases/tag/v2.0.0#user-content-upgrade-guide`, vm, parent);
}
function removed(original, vm, parent) {
  consoleWarn(`[REMOVED] '${original}' has been removed. You can safely omit it.`, vm, parent);
}
/**
 * Shamelessly stolen from vuejs/vue/blob/dev/src/core/util/debug.js
 */

const classifyRE = /(?:^|[-_])(\w)/g;

const classify = str => str.replace(classifyRE, c => c.toUpperCase()).replace(/[-_]/g, '');

function formatComponentName(vm, includeFile) {
  if (vm.$root === vm) {
    return '<Root>';
  }

  const options = typeof vm === 'function' && vm.cid != null ? vm.options : vm._isVue ? vm.$options || vm.constructor.options : vm || {};
  let name = options.name || options._componentTag;
  const file = options.__file;

  if (!name && file) {
    const match = file.match(/([^/\\]+)\.vue$/);
    name = match == null ? void 0 : match[1];
  }

  return (name ? `<${classify(name)}>` : `<Anonymous>`) + (file && includeFile !== false ? ` at ${file}` : '');
}

function generateComponentTrace(vm) {
  if (vm._isVue && vm.$parent) {
    const tree = [];
    let currentRecursiveSequence = 0;

    while (vm) {
      if (tree.length > 0) {
        const last = tree[tree.length - 1];

        if (last.constructor === vm.constructor) {
          currentRecursiveSequence++;
          vm = vm.$parent;
          continue;
        } else if (currentRecursiveSequence > 0) {
          tree[tree.length - 1] = [last, currentRecursiveSequence];
          currentRecursiveSequence = 0;
        }
      }

      tree.push(vm);
      vm = vm.$parent;
    }

    return '\n\nfound in\n\n' + tree.map((vm, i) => `${i === 0 ? '---> ' : ' '.repeat(5 + i * 2)}${Array.isArray(vm) // eslint-disable-next-line sonarjs/no-nested-template-literals
    ? `${formatComponentName(vm[0])}... (${vm[1]} recursive calls)` : formatComponentName(vm)}`).join('\n');
  } else {
    return `\n\n(found in ${formatComponentName(vm)})`;
  }
}

/***/ }),

/***/ "./node_modules/vuetify/lib/util/defineComponent.mjs":
/*!***********************************************************!*\
  !*** ./node_modules/vuetify/lib/util/defineComponent.mjs ***!
  \***********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "defineComponent": function() { return /* binding */ defineComponent; },
/* harmony export */   "genericComponent": function() { return /* binding */ genericComponent; }
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _console_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./console.mjs */ "./node_modules/vuetify/lib/util/console.mjs");
/* harmony import */ var _helpers_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers.mjs */ "./node_modules/vuetify/lib/util/helpers.mjs");
/* harmony import */ var _composables_defaults_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../composables/defaults.mjs */ "./node_modules/vuetify/lib/composables/defaults.mjs");
// Utils



 // Types

function propIsDefined(vnode, prop) {
  var _vnode$props, _vnode$props2;

  return ((_vnode$props = vnode.props) == null ? void 0 : _vnode$props.hasOwnProperty(prop)) || ((_vnode$props2 = vnode.props) == null ? void 0 : _vnode$props2.hasOwnProperty((0,_helpers_mjs__WEBPACK_IMPORTED_MODULE_1__.toKebabCase)(prop)));
}

const defineComponent = function defineComponent(options) {
  var _options$_setup;

  options._setup = (_options$_setup = options._setup) != null ? _options$_setup : options.setup;

  if (!options.name) {
    (0,_console_mjs__WEBPACK_IMPORTED_MODULE_2__.consoleWarn)('The component is missing an explicit name, unable to generate default prop value');
    return options;
  }

  if (options._setup) {
    options.setup = function setup(props, ctx) {
      const vm = (0,vue__WEBPACK_IMPORTED_MODULE_0__.getCurrentInstance)();
      const defaults = (0,_composables_defaults_mjs__WEBPACK_IMPORTED_MODULE_3__.useDefaults)();

      const _props = (0,vue__WEBPACK_IMPORTED_MODULE_0__.shallowReactive)({ ...(0,vue__WEBPACK_IMPORTED_MODULE_0__.toRaw)(props)
      });

      (0,vue__WEBPACK_IMPORTED_MODULE_0__.watchEffect)(() => {
        const globalDefaults = defaults.value.global;
        const componentDefaults = defaults.value[options.name];

        for (const prop of Object.keys(props)) {
          let newVal;

          if (propIsDefined(vm.vnode, prop)) {
            newVal = props[prop];
          } else {
            var _ref, _componentDefaults$pr;

            newVal = (_ref = (_componentDefaults$pr = componentDefaults == null ? void 0 : componentDefaults[prop]) != null ? _componentDefaults$pr : globalDefaults == null ? void 0 : globalDefaults[prop]) != null ? _ref : props[prop];
          }

          if (_props[prop] !== newVal) {
            _props[prop] = newVal;
          }
        }
      });
      return options._setup(_props, ctx);
    };
  }

  return options;
};
function genericComponent() {
  let exposeDefaults = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  return options => (exposeDefaults ? defineComponent : vue__WEBPACK_IMPORTED_MODULE_0__.defineComponent)(options);
}

/***/ }),

/***/ "./node_modules/vuetify/lib/util/getCurrentInstance.mjs":
/*!**************************************************************!*\
  !*** ./node_modules/vuetify/lib/util/getCurrentInstance.mjs ***!
  \**************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getCurrentInstance": function() { return /* binding */ getCurrentInstance; },
/* harmony export */   "getCurrentInstanceName": function() { return /* binding */ getCurrentInstanceName; }
/* harmony export */ });
/* harmony import */ var core_js_modules_es_error_cause_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.error.cause.js */ "./node_modules/core-js/modules/es.error.cause.js");
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./index.mjs */ "./node_modules/vuetify/lib/util/helpers.mjs");

// Utilities


function getCurrentInstance(name, message) {
  const vm = (0,vue__WEBPACK_IMPORTED_MODULE_1__.getCurrentInstance)();

  if (!vm) {
    throw new Error(`[Vuetify] ${name} ${message || 'must be called from inside a setup function'}`);
  }

  return vm;
}
function getCurrentInstanceName() {
  var _getCurrentInstance$t;

  let name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'composables';
  return (0,_index_mjs__WEBPACK_IMPORTED_MODULE_2__.toKebabCase)((_getCurrentInstance$t = getCurrentInstance(name).type) == null ? void 0 : _getCurrentInstance$t.name);
}

/***/ }),

/***/ "./node_modules/vuetify/lib/util/globals.mjs":
/*!***************************************************!*\
  !*** ./node_modules/vuetify/lib/util/globals.mjs ***!
  \***************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "IS_NODE": function() { return /* binding */ IS_NODE; },
/* harmony export */   "IN_BROWSER": function() { return /* binding */ IN_BROWSER; },
/* harmony export */   "IS_DEBUG": function() { return /* binding */ IS_DEBUG; },
/* harmony export */   "IS_PROD": function() { return /* binding */ IS_PROD; },
/* harmony export */   "SUPPORTS_INTERSECTION": function() { return /* binding */ SUPPORTS_INTERSECTION; },
/* harmony export */   "SUPPORTS_TOUCH": function() { return /* binding */ SUPPORTS_TOUCH; },
/* harmony export */   "SUPPORTS_FOCUS_VISIBLE": function() { return /* binding */ SUPPORTS_FOCUS_VISIBLE; }
/* harmony export */ });
const IS_NODE = typeof process !== 'undefined';
const IN_BROWSER = typeof window !== 'undefined';
const IS_DEBUG = IS_NODE && ({"NODE_ENV":"development","VUE_APP_I18N_LOCALE":"en","VUE_APP_I18N_FALLBACK_LOCALE":"en","VUE_APP_VERSION":"0.1.0","VUE_APP_VUE_VERSION":"3.2.31","VUE_APP_DEBUG":"undefined","VUE_APP_NODE_ENV":"development","BASE_URL":"/doc-bundle/"}).DEBUG === 'true';
const IS_PROD = IS_NODE && "development" === 'production';
const SUPPORTS_INTERSECTION = IN_BROWSER && 'IntersectionObserver' in window;
const SUPPORTS_TOUCH = IN_BROWSER && ('ontouchstart' in window || window.navigator.maxTouchPoints > 0);
const SUPPORTS_FOCUS_VISIBLE = IN_BROWSER && CSS.supports('selector(:focus-visible)');

/***/ }),

/***/ "./node_modules/vuetify/lib/util/helpers.mjs":
/*!***************************************************!*\
  !*** ./node_modules/vuetify/lib/util/helpers.mjs ***!
  \***************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getNestedValue": function() { return /* binding */ getNestedValue; },
/* harmony export */   "deepEqual": function() { return /* binding */ deepEqual; },
/* harmony export */   "getObjectValueByPath": function() { return /* binding */ getObjectValueByPath; },
/* harmony export */   "getPropertyFromItem": function() { return /* binding */ getPropertyFromItem; },
/* harmony export */   "createRange": function() { return /* binding */ createRange; },
/* harmony export */   "getZIndex": function() { return /* binding */ getZIndex; },
/* harmony export */   "escapeHTML": function() { return /* binding */ escapeHTML; },
/* harmony export */   "filterObjectOnKeys": function() { return /* binding */ filterObjectOnKeys; },
/* harmony export */   "convertToUnit": function() { return /* binding */ convertToUnit; },
/* harmony export */   "isObject": function() { return /* binding */ isObject; },
/* harmony export */   "isComponentInstance": function() { return /* binding */ isComponentInstance; },
/* harmony export */   "keyCodes": function() { return /* binding */ keyCodes; },
/* harmony export */   "keyValues": function() { return /* binding */ keyValues; },
/* harmony export */   "keys": function() { return /* binding */ keys; },
/* harmony export */   "pick": function() { return /* binding */ pick; },
/* harmony export */   "filterInputAttrs": function() { return /* binding */ filterInputAttrs; },
/* harmony export */   "arrayDiff": function() { return /* binding */ arrayDiff; },
/* harmony export */   "groupItems": function() { return /* binding */ groupItems; },
/* harmony export */   "wrapInArray": function() { return /* binding */ wrapInArray; },
/* harmony export */   "sortItems": function() { return /* binding */ sortItems; },
/* harmony export */   "defaultFilter": function() { return /* binding */ defaultFilter; },
/* harmony export */   "searchItems": function() { return /* binding */ searchItems; },
/* harmony export */   "debounce": function() { return /* binding */ debounce; },
/* harmony export */   "throttle": function() { return /* binding */ throttle; },
/* harmony export */   "getPrefixedSlots": function() { return /* binding */ getPrefixedSlots; },
/* harmony export */   "clamp": function() { return /* binding */ clamp; },
/* harmony export */   "padEnd": function() { return /* binding */ padEnd; },
/* harmony export */   "chunk": function() { return /* binding */ chunk; },
/* harmony export */   "humanReadableFileSize": function() { return /* binding */ humanReadableFileSize; },
/* harmony export */   "camelizeObjectKeys": function() { return /* binding */ camelizeObjectKeys; },
/* harmony export */   "mergeDeep": function() { return /* binding */ mergeDeep; },
/* harmony export */   "fillArray": function() { return /* binding */ fillArray; },
/* harmony export */   "getUid": function() { return /* binding */ getUid; },
/* harmony export */   "flattenFragments": function() { return /* binding */ flattenFragments; },
/* harmony export */   "randomHexColor": function() { return /* binding */ randomHexColor; },
/* harmony export */   "toKebabCase": function() { return /* binding */ toKebabCase; },
/* harmony export */   "wrapInRef": function() { return /* binding */ wrapInRef; },
/* harmony export */   "findChildren": function() { return /* binding */ findChildren; },
/* harmony export */   "findChildrenWithProvide": function() { return /* binding */ findChildrenWithProvide; },
/* harmony export */   "CircularBuffer": function() { return /* binding */ CircularBuffer; }
/* harmony export */ });
/* harmony import */ var core_js_modules_es_error_cause_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.error.cause.js */ "./node_modules/core-js/modules/es.error.cause.js");
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");


function _classPrivateFieldInitSpec(obj, privateMap, value) {
  _checkPrivateRedeclaration(obj, privateMap);

  privateMap.set(obj, value);
}

function _checkPrivateRedeclaration(obj, privateCollection) {
  if (privateCollection.has(obj)) {
    throw new TypeError("Cannot initialize the same private elements twice on an object");
  }
}

function _classPrivateFieldSet(receiver, privateMap, value) {
  var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set");

  _classApplyDescriptorSet(receiver, descriptor, value);

  return value;
}

function _classApplyDescriptorSet(receiver, descriptor, value) {
  if (descriptor.set) {
    descriptor.set.call(receiver, value);
  } else {
    if (!descriptor.writable) {
      throw new TypeError("attempted to set read only private field");
    }

    descriptor.value = value;
  }
}

function _classPrivateFieldGet(receiver, privateMap) {
  var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get");

  return _classApplyDescriptorGet(receiver, descriptor);
}

function _classExtractFieldDescriptor(receiver, privateMap, action) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to " + action + " private field on non-instance");
  }

  return privateMap.get(receiver);
}

function _classApplyDescriptorGet(receiver, descriptor) {
  if (descriptor.get) {
    return descriptor.get.call(receiver);
  }

  return descriptor.value;
} // Utilities


 // Types

function getNestedValue(obj, path, fallback) {
  const last = path.length - 1;
  if (last < 0) return obj === undefined ? fallback : obj;

  for (let i = 0; i < last; i++) {
    if (obj == null) {
      return fallback;
    }

    obj = obj[path[i]];
  }

  if (obj == null) return fallback;
  return obj[path[last]] === undefined ? fallback : obj[path[last]];
}
function deepEqual(a, b) {
  if (a === b) return true;

  if (a instanceof Date && b instanceof Date && a.getTime() !== b.getTime()) {
    // If the values are Date, compare them as timestamps
    return false;
  }

  if (a !== Object(a) || b !== Object(b)) {
    // If the values aren't objects, they were already checked for equality
    return false;
  }

  const props = Object.keys(a);

  if (props.length !== Object.keys(b).length) {
    // Different number of props, don't bother to check
    return false;
  }

  return props.every(p => deepEqual(a[p], b[p]));
}
function getObjectValueByPath(obj, path, fallback) {
  // credit: http://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key#comment55278413_6491621
  if (obj == null || !path || typeof path !== 'string') return fallback;
  if (obj[path] !== undefined) return obj[path];
  path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties

  path = path.replace(/^\./, ''); // strip a leading dot

  return getNestedValue(obj, path.split('.'), fallback);
}
function getPropertyFromItem(item, property, fallback) {
  if (property == null) return item === undefined ? fallback : item;
  if (item !== Object(item)) return fallback === undefined ? item : fallback;
  if (typeof property === 'string') return getObjectValueByPath(item, property, fallback);
  if (Array.isArray(property)) return getNestedValue(item, property, fallback);
  if (typeof property !== 'function') return fallback;
  const value = property(item, fallback);
  return typeof value === 'undefined' ? fallback : value;
}
function createRange(length) {
  let start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return Array.from({
    length
  }, (v, k) => start + k);
}
function getZIndex(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return 0;
  const index = +window.getComputedStyle(el).getPropertyValue('z-index');
  if (!index) return getZIndex(el.parentNode);
  return index;
}
const tagsToReplace = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
};
function escapeHTML(str) {
  return str.replace(/[&<>]/g, tag => tagsToReplace[tag] || tag);
}
function filterObjectOnKeys(obj, keys) {
  const filtered = {};

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (typeof obj[key] !== 'undefined') {
      filtered[key] = obj[key];
    }
  }

  return filtered;
}
function convertToUnit(str) {
  let unit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'px';

  if (str == null || str === '') {
    return undefined;
  } else if (isNaN(+str)) {
    return String(str);
  } else if (!isFinite(+str)) {
    return undefined;
  } else {
    return `${Number(str)}${unit}`;
  }
}
function isObject(obj) {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}
function isComponentInstance(obj) {
  return obj == null ? void 0 : obj.$el;
} // KeyboardEvent.keyCode aliases

const keyCodes = Object.freeze({
  enter: 13,
  tab: 9,
  delete: 46,
  esc: 27,
  space: 32,
  up: 38,
  down: 40,
  left: 37,
  right: 39,
  end: 35,
  home: 36,
  del: 46,
  backspace: 8,
  insert: 45,
  pageup: 33,
  pagedown: 34,
  shift: 16
});
const keyValues = Object.freeze({
  enter: 'Enter',
  tab: 'Tab',
  delete: 'Delete',
  esc: 'Escape',
  space: 'Space',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  end: 'End',
  home: 'Home',
  del: 'Delete',
  backspace: 'Backspace',
  insert: 'Insert',
  pageup: 'PageUp',
  pagedown: 'PageDown',
  shift: 'Shift'
});
function keys(o) {
  return Object.keys(o);
}
function pick(obj, paths) {
  const found = Object.create(null);
  const rest = Object.create(null);

  for (const key in obj) {
    if (paths.some(path => path instanceof RegExp ? path.test(key) : path === key)) {
      found[key] = obj[key];
    } else {
      rest[key] = obj[key];
    }
  }

  return [found, rest];
}
/**
 * Filter attributes that should be applied to
 * the root element of a an input component. Remaining
 * attributes should be passed to the <input> element inside.
 */

function filterInputAttrs(attrs) {
  return pick(attrs, ['class', 'style', 'id', /^data-/]);
}
/**
 * Returns the set difference of B and A, i.e. the set of elements in B but not in A
 */

function arrayDiff(a, b) {
  const diff = [];

  for (let i = 0; i < b.length; i++) {
    if (!a.includes(b[i])) diff.push(b[i]);
  }

  return diff;
}
function groupItems(items, groupBy, groupDesc) {
  const key = groupBy[0];
  const groups = [];
  let current;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const val = getObjectValueByPath(item, key, null);

    if (current !== val) {
      current = val;
      groups.push({
        name: val != null ? val : '',
        items: []
      });
    }

    groups[groups.length - 1].items.push(item);
  }

  return groups;
}
function wrapInArray(v) {
  return v == null ? [] : Array.isArray(v) ? v : [v];
}
function sortItems(items, sortBy, sortDesc, locale, customSorters) {
  if (sortBy === null || !sortBy.length) return items;
  const stringCollator = new Intl.Collator(locale, {
    sensitivity: 'accent',
    usage: 'sort'
  });
  return items.sort((a, b) => {
    for (let i = 0; i < sortBy.length; i++) {
      const sortKey = sortBy[i];
      let sortA = getObjectValueByPath(a, sortKey);
      let sortB = getObjectValueByPath(b, sortKey);

      if (sortDesc[i]) {
        [sortA, sortB] = [sortB, sortA];
      }

      if (customSorters != null && customSorters[sortKey]) {
        const customResult = customSorters[sortKey](sortA, sortB);
        if (!customResult) continue;
        return customResult;
      } // Check if both cannot be evaluated


      if (sortA === null && sortB === null) {
        continue;
      } // Dates should be compared numerically


      if (sortA instanceof Date && sortB instanceof Date) {
        return sortA.getTime() - sortB.getTime();
      }

      [sortA, sortB] = [sortA, sortB].map(s => (s || '').toString().toLocaleLowerCase());

      if (sortA !== sortB) {
        if (!isNaN(sortA) && !isNaN(sortB)) return Number(sortA) - Number(sortB);
        return stringCollator.compare(sortA, sortB);
      }
    }

    return 0;
  });
}
function defaultFilter(value, search, item) {
  return value != null && search != null && typeof value !== 'boolean' && value.toString().toLocaleLowerCase().indexOf(search.toLocaleLowerCase()) !== -1;
}
function searchItems(items, search) {
  if (!search) return items;
  search = search.toString().toLowerCase();
  if (search.trim() === '') return items;
  return items.filter(item => Object.keys(item).some(key => defaultFilter(getObjectValueByPath(item, key), search, item)));
}
function debounce(fn, delay) {
  let timeoutId = 0;
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
function throttle(fn, limit) {
  let throttling = false;
  return function () {
    if (!throttling) {
      throttling = true;
      setTimeout(() => throttling = false, limit);
      return fn(...arguments);
    }
  };
}
/**
 * Filters slots to only those starting with `prefix`, removing the prefix
 */

function getPrefixedSlots(prefix, slots) {
  return Object.keys(slots).filter(k => k.startsWith(prefix)).reduce((obj, k) => {
    obj[k.replace(prefix, '')] = slots[k];
    return obj;
  }, {});
}
function clamp(value) {
  let min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  let max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  return Math.max(min, Math.min(max, value));
}
function padEnd(str, length) {
  let char = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '0';
  return str + char.repeat(Math.max(0, length - str.length));
}
function chunk(str) {
  let size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  const chunked = [];
  let index = 0;

  while (index < str.length) {
    chunked.push(str.substr(index, size));
    index += size;
  }

  return chunked;
}
function humanReadableFileSize(bytes) {
  let base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;

  if (bytes < base) {
    return `${bytes} B`;
  }

  const prefix = base === 1024 ? ['Ki', 'Mi', 'Gi'] : ['k', 'M', 'G'];
  let unit = -1;

  while (Math.abs(bytes) >= base && unit < prefix.length - 1) {
    bytes /= base;
    ++unit;
  }

  return `${bytes.toFixed(1)} ${prefix[unit]}B`;
}
function camelizeObjectKeys(obj) {
  if (!obj) return {};
  return Object.keys(obj).reduce((o, key) => {
    o[(0,vue__WEBPACK_IMPORTED_MODULE_1__.camelize)(key)] = obj[key];
    return o;
  }, {});
}
function mergeDeep() {
  let source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  let target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  let out = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  for (const key in source) {
    out[key] = source[key];
  }

  for (const key in target) {
    const sourceProperty = source[key];
    const targetProperty = target[key]; // Only continue deep merging if
    // both properties are objects

    if (isObject(sourceProperty) && isObject(targetProperty)) {
      out[key] = mergeDeep(sourceProperty, targetProperty);
      continue;
    }

    out[key] = targetProperty;
  }

  return out;
}
function fillArray(length, obj) {
  return Array(length).fill(obj);
}
function getUid() {
  return getUid._uid++;
}
getUid._uid = 0;
function flattenFragments(nodes) {
  return nodes.map(node => {
    if (node.type === vue__WEBPACK_IMPORTED_MODULE_1__.Fragment) {
      return flattenFragments(node.children);
    } else {
      return node;
    }
  }).flat();
}
const randomHexColor = () => {
  const n = (Math.random() * 0xfffff * 1000000).toString(16);
  return '#' + n.slice(0, 6);
};
function toKebabCase() {
  let str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return str.replace(/[^a-z]/gi, '-').replace(/\B([A-Z])/g, '-$1').toLowerCase();
}
function wrapInRef(x) {
  return (0,vue__WEBPACK_IMPORTED_MODULE_1__.isRef)(x) ? x : (0,vue__WEBPACK_IMPORTED_MODULE_1__.ref)(x);
}
function findChildren(vnode) {
  if (!vnode || typeof vnode !== 'object') {
    return [];
  }

  if (Array.isArray(vnode)) {
    return vnode.map(child => findChildren(child)).filter(v => v).flat(1);
  } else if (Array.isArray(vnode.children)) {
    return vnode.children.map(child => findChildren(child)).filter(v => v).flat(1);
  } else if (vnode.component) {
    var _vnode$component;

    return [vnode.component, ...findChildren((_vnode$component = vnode.component) == null ? void 0 : _vnode$component.subTree)].filter(v => v).flat(1);
  }

  return [];
}
function findChildrenWithProvide(provide, vnode) {
  return findChildren(vnode).slice(1) // First one is group component itself
  .filter(cmp => !!cmp.provides[provide]); // TODO: Fix in TS 4.4?
}

var _arr = /*#__PURE__*/new WeakMap();

var _pointer = /*#__PURE__*/new WeakMap();

class CircularBuffer {
  constructor(size) {
    _classPrivateFieldInitSpec(this, _arr, {
      writable: true,
      value: []
    });

    _classPrivateFieldInitSpec(this, _pointer, {
      writable: true,
      value: 0
    });

    this.size = size;
  }

  push(val) {
    _classPrivateFieldGet(this, _arr)[_classPrivateFieldGet(this, _pointer)] = val;

    _classPrivateFieldSet(this, _pointer, (_classPrivateFieldGet(this, _pointer) + 1) % this.size);
  }

  values() {
    return _classPrivateFieldGet(this, _arr).slice(_classPrivateFieldGet(this, _pointer)).concat(_classPrivateFieldGet(this, _arr).slice(0, _classPrivateFieldGet(this, _pointer)));
  }

}

/***/ }),

/***/ "./node_modules/vuetify/lib/util/propsFactory.mjs":
/*!********************************************************!*\
  !*** ./node_modules/vuetify/lib/util/propsFactory.mjs ***!
  \********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "propsFactory": function() { return /* binding */ propsFactory; }
/* harmony export */ });
/**
 * Creates a factory function for props definitions.
 * This is used to define props in a composable then override
 * default values in an implementing component.
 *
 * @example Simplified signature
 * (props: Props) => (defaults?: Record<keyof props, any>) => Props
 *
 * @example Usage
 * const makeProps = propsFactory({
 *   foo: String,
 * })
 *
 * defineComponent({
 *   props: {
 *     ...makeProps({
 *       foo: 'a',
 *     }),
 *   },
 *   setup (props) {
 *     // would be "string | undefined", now "string" because a default has been provided
 *     props.foo
 *   },
 * }
 */
function propsFactory(props, source) {
  return defaults => {
    return Object.keys(props).reduce((obj, prop) => {
      const isObjectDefinition = typeof props[prop] === 'object' && props[prop] != null && !Array.isArray(props[prop]);
      const definition = isObjectDefinition ? props[prop] : {
        type: props[prop]
      };

      if (defaults && prop in defaults) {
        obj[prop] = { ...definition,
          default: defaults[prop]
        };
      } else {
        obj[prop] = definition;
      }

      if (source) {
        obj[prop].source = source;
      }

      return obj;
    }, {});
  };
}

/***/ }),

/***/ "./node_modules/vuetify/lib/util/useRender.mjs":
/*!*****************************************************!*\
  !*** ./node_modules/vuetify/lib/util/useRender.mjs ***!
  \*****************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "useRender": function() { return /* binding */ useRender; }
/* harmony export */ });
/* harmony import */ var _getCurrentInstance_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./getCurrentInstance.mjs */ "./node_modules/vuetify/lib/util/getCurrentInstance.mjs");
// Utilities
 // Types

function useRender(render) {
  const vm = (0,_getCurrentInstance_mjs__WEBPACK_IMPORTED_MODULE_0__.getCurrentInstance)('useRender');
  vm.render = render;
}

/***/ })

});
//# sourceMappingURL=chunk-vendors.dd6099373a01120d.hot-update.js.map