<template>
<v-snackbar ref="container" v-model="state.visible" v-bind="{...$props, ...$attrs}" :color="message.type">
  {{ message.payload }}
  <slot></slot>
  <template v-slot:actions>
    <v-btn color="cyan" variant="text" @click="close">
      {{ t('close') }}
    </v-btn>
  </template>
</v-snackbar>
</template>


<script>
export default {
  name: 'n-notify-snackbar',
  //inheritAttrs: false
}
</script>
<script setup>
import {
  ref,
  watch,
  onMounted,
  onUnmounted,
  computed,
  reactive,
  useAttrs,
  useSlots,
  inject,
  toRefs,
  getCurrentInstance
} from 'vue'

import {
  useI18n
} from 'vue-i18n'

import {
  useParsePdu
} from './composition/pdu.js'

const attrs = useAttrs()
const slots = useSlots()
const emit = defineEmits(["close"])
const nodefony = inject('nodefony')
const {
  parsePdu
} = useParsePdu()

/*const context = getCurrentInstance().appContext;
console.log(context, context.logger)*/

const {
  t
} = useI18n({
  inheritLocale: true,
  useScope: 'local'
})

const state = reactive({
  visible: false,
  stacked: 0
})

watch(state, (newValue, oldValue) => {
  if (!newValue.visible) {
    emit("close", message.value);
    nodefony.fire("closeNotify", message.value)
  }
})

const container = ref(null);

const props = defineProps({
  pdu: {
    type: Object,
    default: {}
  },
  offset: {
    type: Number,
    default: 0
  }
})


// a computed ref
const margin = computed(() => {
  return props.offset + (state.stacked * 68) + 'px'
})
// a computed ref
const message = computed(() => {
  if (props.pdu)
    return parsePdu(props.pdu);
  return null
})

const pduToString = computed(() => {
  return message.value.toString()
})
// lifecycle hooks
onMounted(() => {
  //console.log("Snackbar passs Mounted ", state.visible)
  state.visible = true
})

onUnmounted(() => {
  //console.log("Snackbar passs onUnMounted ", state.visible)
})

function close() {
  state.visible = false;
}
</script>


<i18n>
{
  "en": {
    "close" : "close",

  },
  "fr": {
    "close" : "fermer",
  }
}
</i18n>
