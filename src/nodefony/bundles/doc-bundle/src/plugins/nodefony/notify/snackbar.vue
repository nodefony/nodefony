<template>
<v-snackbar v-if="newPdu" v-bind="{...$props, ...$attrs}" v-model="visible" :color="severityColor" :style="`margin-top:${margin}`">
  {{ newPdu.payload }}
  <v-btn v-if="timeout === -1" dark text @click="close">
    {{ $t('close') }}
  </v-btn>
</v-snackbar>
</template>

<script>
export default {
  name: 'nodefonySnackBar',
  mixins: [],
  props: {
    top: null,
    absolute: {
      type: Boolean,
      default: false
    },
    right: null,
    timeout: {
      type: Number,
      default: -1
    },
    multiLine: null,
    color: {
      type: String,
      default: "primary"
    },
    pdu: {
      type: Object,
      default: null
    },
    offset: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      visible: true,
      severityColor: null,
      stacked: 0
    }
  },
  computed: {
    margin() {
      return this.offset + (this.stacked * 68) + 'px'
    },
    newPdu() {
      if (this.pdu) {
        return this.parse(this.pdu);
      }
      return null;
    }
  },
  mounted() {
    if (this.pdu) {
      this.severityColor = this.pdu.type || this.color;
    }
    /*if (this.timeout !== -1) {
      setTimeout(() => {
        this.$emit("close", this.pdu);
      }, this.timeout)
    }*/
  },
  methods: {
    close() {
      this.visible = false;
    },
    parse(pdu) {
      if (!pdu) {
        return
      }
      switch (true) {
        case pdu.severity <= 3:
          pdu.type = 'error';
          pdu.color = 'red';
          break;
        case pdu.severity === 4:
          pdu.type = 'warning';
          pdu.color = 'yellow';
          break;
        case pdu.severity === 5:
          pdu.type = 'info';
          pdu.color = 'blue';
          break;
        case pdu.severity === 6:
          pdu.type = 'success';
          pdu.color = 'green';
          break;
        case pdu.severity === 7:
          pdu.type = 'success';
          pdu.color = 'teal';
          break;
        default:
          pdu.type = 'info';
          pdu.color = 'teal';
      }
      return pdu;
    }
  },
  watch: {
    visible(value) {
      if (!value) {
        this.$emit("close", this.pdu);
      }
    }
  }
}
</script>
