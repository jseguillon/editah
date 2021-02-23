<template>
  <div class="right menu">
  <!-- v-for="layer in layers" :key="layer"-->
  <ValidateOnSchemaVersionItem  v-bind="$props" apiLabel="version 1.20" apiURL="https://raw.githubusercontent.com/kubernetes/kubernetes/release-1.20/api/openapi-spec/swagger.json"/>
  <ValidateOnSchemaVersionItem  v-bind="$props" apiLabel="version 1.19" apiURL="https://raw.githubusercontent.com/kubernetes/kubernetes/release-1.19/api/openapi-spec/swagger.json"/>
  <ValidateOnSchemaVersionItem  v-bind="$props" apiLabel="version 1.18" apiURL="https://raw.githubusercontent.com/kubernetes/kubernetes/release-1.18/api/openapi-spec/swagger.json"/>
  </div>
</template>

<script>
import ValidateOnSchemaVersionItem from '../components/ValidateOnSchemaVersionItem.vue'

export default {
  name: "ValidateOnSchemaList",
  components: {
    ValidateOnSchemaVersionItem
  },
  props: {
    msg: String,
    yamlCode: String
  },
  mounted() {
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
