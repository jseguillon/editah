<template>
    <a class="item" @click="showLogs()"><i class="red dont icon"></i>{{ apiLabel }} <div class="floating ui red label">22</div>  <!-- <i class="thumbs up outline icon"></i> --> </a>
</template>

<script>
const axios = require('axios');

export default {
  name: "ValidateOnSchemaVersionItem",
  data() {
    return {
      ready: false,
      valid: null,
      jsonSchema: null,
      error: null,
      unRefedSchema: null
    }
  },
  methods: {
    showLogs: function (newVal, vm) { //debounce((newVal, vm) => {
      console.log("fu !!!")
      console.log(newVal)
      const valid = vm.ajv.validate({ $ref: vm.apiCode + '#' + '/definitions/io.k8s.api.core.v1.Pod' }, newVal)
      console.log(vm.apiCode)

      if (!valid) console.log(vm.ajv.errors)
      } //, 500 )
  },
  created() {
    axios
      .get(this.$props.apiURL)
      .then(response => {
        this.ajv.addSchema(response.data, this.apiCode)
      })
  },
  props: {
    apiCode: String,
    apiLabel: String,
    apiURL: String,
    yamlCode: Object,
    ajv: Object
  },
  watch: {
    yamlCode: function(newVal, oldVal) {
       this.showLogs(newVal, this, oldVal)
    }
  }
};
</script>

<style scoped>

</style>
