<template>
<!--  -->
  <div class="ui container">
    <div>
      <div class="ui stackable two column grid">
        <div class="one column row">
          <div class="two column">
                <div class="input-auto">
                  <AutoComplete ref="autocomplete"
                  :items="templateKeys()"
                  placeholder="example: 'Pod mini', 'Serv ful', etc."
                  v-on:selected="update"/>
                </div>
          </div>
        </div>
        <div class="two column row">
          <div class="column">
            <div class="name ui input small">
              <input ref="name" placeholder="Name (default: myname)" class="name ui input" @change="replaceTokens" v-model="name" type="text">
            </div>
          </div>
          <div class="column">
                <div class="namespace ui input small">
                  <input ref="namespace" placeholder="Namespace (default: default)" class="ui input" @change="replaceTokens" v-model="namespace" type="text">
                </div>
          </div>
        </div>
      </div>
    </div>
    <p></p>
    <div><MonacoEditor class="editor" ref="editor" v-model="code" language="yaml"  v-bind:options="{monOptions}"  @editorDidMount="editorDidMount" /></div>

  </div>
</template>

<script>
import MonacoEditor from 'vue-monaco'
import AutoComplete from "@/components/AutoComplete.vue"
import templateList from '@/assets/jsons/templates/apps.v1.json'

export default {
  components: {
    MonacoEditor,
    AutoComplete
  },
  mounted() {

  },
  computed: {

  },
  methods: {

    templateKeys() {
      return Object.keys(this.templates)
    },
    replaceTokensInString(code) {
      console.log(this.name);
      if ( this.name != '' ) {
        code = code.replace('name: myname', 'name: ' + this.name )
      }
      if ( this.namespace != '' ) {
        code = code.replace('namespace: default', 'namespace: ' + this.namespace )
      }

      console.log(code)
      return code
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
        this.$refs.editor.getEditor().setValue(this.replaceTokensInString(this.templates[event]))
        this.$refs.editor.focus()
      }
    },
    replaceTokens: function (event){

      console.log(event)
      this.$refs.editor.getEditor().setValue(this.replaceTokensInString(this.code))
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
      templates: templateList,
      name: '',
      namespace: ''
    }
  }
}
</script>

<style scoped>
.editor {
  height: 60%;
  width: 100%;
  font-family: monospace;
  font-size: unset;
  text-align: left;
}
.autocomplete {
  width: 100%;
}
.input-auto {
  padding-left: 30px;
  padding-right: 10px;
}

.namespace {
  min-width: 80%;
}
.name {
  min-width: 80%;
}
</style>
