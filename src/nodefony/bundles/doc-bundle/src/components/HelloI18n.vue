<template>
<p>{{ t('hello') }}</p>
<p>{{ t('message') }}</p>
</template>

<script>
import {
  defineComponent
} from 'vue'
import {
  useI18n
} from 'vue-i18n'

export default defineComponent({
  name: 'HelloI18n',
  setup() {
    const {
      t
    } = useI18n({
      inheritLocale: true,
      useScope: 'local'
    })

    // Something todo ..

    return {
      t
    }
  },
  mounted() {}
})
</script>

<i18n>
{
  "en": {
    "hello": "Hello i18n in SFC!"
  }
}
</i18n>
