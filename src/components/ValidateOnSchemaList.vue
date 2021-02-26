<template>
  <div class="right menu">
  <!-- v-for="layer in layers" :key="layer"-->
  <ValidateOnSchemaVersionItem  v-bind="$props" apiCode="1-18" :ajv="ajv1" apiLabel="version 1.18" apiURL="https://raw.githubusercontent.com/kubernetes/kubernetes/release-1.18/api/openapi-spec/swagger.json"/>
  <ValidateOnSchemaVersionItem  v-bind="$props" apiCode="1-19" :ajv="ajv2" apiLabel="version 1.19" apiURL="https://raw.githubusercontent.com/kubernetes/kubernetes/release-1.19/api/openapi-spec/swagger.json"/>
  <ValidateOnSchemaVersionItem  v-bind="$props" apiCode="1-20" :ajv="ajv3" apiLabel="version 1.20" apiURL="https://raw.githubusercontent.com/kubernetes/kubernetes/release-1.20/api/openapi-spec/swagger.json"/>
  </div>
</template>

<script>
import ValidateOnSchemaVersionItem from '../components/ValidateOnSchemaVersionItem.vue'
const Ajv = require("ajv").default
const ajv1 = new Ajv( {removeAdditional: true,   strict: false})
const ajv2 = new Ajv( {removeAdditional: true,   strict: false})
const ajv3 = new Ajv( {removeAdditional: true,   strict: false})

export default {
  name: "ValidateOnSchemaList",
  components: {
    ValidateOnSchemaVersionItem
  },
  data() {
    return {
      ajv1: undefined,
      ajv2: undefined,
      ajv3: undefined
    }
  },
  props: {
    msg: String,
    yamlCode: Object
  },
  mounted() {
    this.ajv1 = ajv1
    this.ajv2 = ajv2
    this.ajv3 = ajv3
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
