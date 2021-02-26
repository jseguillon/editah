<template>
  <div class="ui pointing menu">
    <!-- @click="showEdit()" -->
    <a class="active item" >code</a>
    <ValidateOnSchemaList :yamlCode="yamlCode" />
  </div>
</template>

<script>
import ValidateOnSchemaList from '../components/ValidateOnSchemaList.vue'

export default {
  name: "Menu",
  components: {
    ValidateOnSchemaList
  },
  props: {
    yamlCode: Object
  },
  mounted() {
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
