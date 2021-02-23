<template>
    <a class="item" @click="showLogs()"><i class="red dont icon"></i>{{ apiLabel }} <div class="floating ui red label">22</div>  <!-- <i class="thumbs up outline icon"></i> --> </a>
</template>

<script>
const axios = require('axios');

const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
}

export default {
  name: "ValidateOnSchemaVersionItem",
  data() {
    return {
      ready: false,
      valid: null,
      jsonSchema: null,
      error: null
    }
  },
  methods: {
    showLogs: debounce((newVal) => {
      console.log("fu !!!")
      console.log(newVal)
    }, 500)
  },
  mounted() {
    axios
      .get(this.$props.apiURL)
      .then(response => {
        this.jsonSchema = response.data;
      });
  },
  props: {
    apiLabel: String,
    apiURL: String,
    yamlCode: String
  },
  watch: {
    yamlCode: function(newVal, oldVal) {
      this.showLogs(newVal, oldVal)
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* .segment {
  padding-left: 6px;
  padding-bottom: 3px;
  padding-right: 6px;
  padding-top: 3px;
} */

</style>
