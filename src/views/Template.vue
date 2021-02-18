<template>
<!--  -->
  <div class="ui container">
    <div><AutoComplete ref="autocomplete" label="Custom items:"
      :items="templateKeys()"
      placeholder="all, auto..."
      v-on:selected="update"/>
    </div>
    <br/>
    <br/>
    <br/>
    <br/>
    <div><MonacoEditor class="editor" ref="editor" v-model="code" language="yaml"  v-bind:options="{monOptions}"  @editorDidMount="editorDidMount" /></div>
    </div>
</template>

<script>
import MonacoEditor from 'vue-monaco'
import AutoComplete from "@/components/AutoComplete.vue";

export default {
  components: {
    MonacoEditor,
    AutoComplete
  },
  computed: {

  },
  methods: {
    templateKeys() {
      return Object.keys(this.templates)
    },
    update: function (event) {
      // `this` inside methods points to the Vue instance
      // alert('Hello ' + this )
      // console.log(this)
      // `event` is the native DOM event
      if (event) {
        console.log(event)
        //alert(event)
        this.$refs.autocomplete.focusout()
        this.$refs.editor.getEditor().setValue(this.templates[event])
        this.$refs.editor.focus()
      }
    },
    editorDidMount(editor) {
      // Listen to `scroll` event
      editor.getModel().updateOptions({ tabSize: 2 })
    }
  },
  data() {
    return {
      code: "---\nKind: Pod",
      monOptions: { tabSize: 2},
      templates: { 'apps.v1.Pod minimal': "---\nkind: Pod", 'apps-v1-Deployement minimal': '---\nkind: Deployement', 'apps-v1-Pod complete': '---\nkind: Pod', 'rook-v1-CephCluster complete': '---\nkind: rook-v1-CephCluster' }
    }
  }
}
</script>

<style scoped>
.editor {
  height: 60%;
  font-family: monospace;
  font-size: unset;
  text-align: left;
}
</style>
