<template>
<div>
  <v-alert v-model="alert" v-if="pdu.payload" dense outlined :type="pdu.type" :color="pdu.color">
    <strong>{{pdu.msgid}}</strong>
    {{pdu.payload}}
  </v-alert>
</div>
</template>

<script>
export default {
  name: 'Alert',
  props: {
    type: {
      type: String,
      default: "warning"
    },
    color: {
      type: String,
      default: "green"
    },
    pdu: {
      type: Object,
      default: function() {
        return {
          payload: "No Content",
          type: "warning",
          msgid: "Alert"
        }
      }
    }
  },
  data(vm) {
    return {
      alert: true
    }
  }
}
</script>
