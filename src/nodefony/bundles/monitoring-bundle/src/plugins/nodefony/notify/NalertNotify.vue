<template>
<div>
  <v-alert ref="container" v-model="state.visible" v-bind="{...$props, ...$attrs}" :type="message.type" :color="message.color">
    <strong>{{message.msgid}}</strong>
    {{message.payload}}
    <template v-slot:append>
      <v-btn color="cyan" variant="text" @click="close">
        {{ t('close') }}
      </v-btn>
    </template>
  </v-alert>
</div>
</template>

<script>
export default {
  name: 'n-alert-notify',
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
  t
} = useI18n({
  inheritLocale: true,
  useScope: 'local'
})
const container = ref(null);
const {
  parsePdu
} = useParsePdu()


const state = reactive({
  visible: false,
  stacked: 0
})

watch(state, (newValue, oldValue) => {
  if (!newValue.visible) {
    emit("close", props.pdu);
    nodefony.fire("closeNotify", message.value)
  }
})


// a computed ref
const message = computed(() => {
  if (props.pdu)
    return parsePdu(props.pdu);
  return null
})



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
// lifecycle hooks
onMounted(() => {
  //notify(props.pdu)
  //console.log("passs alert ", props.pdu)
  state.visible = true
})
onUnmounted(() => {
  //console.log("Alert passs onUnMounted ", state.visible)
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
