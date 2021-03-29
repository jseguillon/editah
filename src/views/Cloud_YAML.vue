<template>
  <div class="ui long ">
    <div class="ui segment">

        <div class="one column row " style="">
          <div class="two column">
                <div class="input-auto">
                  <AutoComplete ref="autocomplete"
                  :items="templateKeys()"
                  placeholder="example: 'Pod mini', 'Serv ful', etc."
                  v-on:selected="update"/>
                </div>
          </div>
        </div>
    </div>

    <div class="ui  segment">
      <div class="ui stackable two column grid">
                <div class="two column row rowCompact" style="">
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
      <div class="ui divider"></div>

      <MonacoEditor class="editor ui" ref="editor" v-model="code" language="yaml" v-bind:options="{monOptions}"  @editorDidMount="editorDidMount" />
      <Validate :code="debouncedCode" @parseErrors="parseErrors"  />
    </div>
    <br/>

      <div class="ui">
        <button class="ui black toggle button big icon" data-tooltip="Copy to clipboard with Linux End Of Line (='LF' ='\n')" v-bind:class="{ active: isCopyLinuxActive }" @click="linuxClipboard">
          <i class="check icon" v-if="isCopyLinuxActive"></i>
          <i class="linux icon" v-if="! isCopyLinuxActive"></i>
          Copy Linux
        </button>

        <button class="ui blue toggle button big icon" data-tooltip="Copy to clipboard with Window End Of Line (='CRLF' ='\r\n')" v-bind:class="{ active: isCopyWindowsActive }" @click="windowsClipboard">
          <i class="check icon" v-if="isCopyWindowsActive"></i>
          <i class="windows icon" v-if="! isCopyWindowsActive"></i>
          Copy windows
        </button>
      </div>
  </div>
</template>

<script>
import MonacoEditor from '../components/MonacoEditor.js'
import AutoComplete from "@/components/AutoComplete.vue"
// Only dev
import testsV1 from '@/assets/jsons/templates/tests.json'
import v1 from '@/assets/jsons/templates/v1.json'
import appsV1 from '@/assets/jsons/templates/apps.v1.json'
import Validate from '../components/Validate.vue'
import ParseError from '../components/ParseError.js'

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
  components: {
    MonacoEditor,
    AutoComplete,
    Validate
  },
  created() {

  },
  mounted() {

  },
  computed: {

  },
  methods: {
    //FIXME : tell list of items is not yet supported
    setDebouncedCode: debounce( (vm)  => {
      //enforce ("---") on first line
      if (! vm.code.startsWith("---")){
        vm.code = "---\n" + vm.code
      }
      vm.debouncedCode=vm.code
      } , 500 ),
    getCode() {
      return this.code
    },
    linuxClipboard: function () {
      this.$copyText(this.code).then(function () {
      }, function () {
        alert('Can not copy')
      })

      this.isCopyLinuxActive = true
      setTimeout(() => this.isCopyLinuxActive = false, 1500)
    },
    windowsClipboard: function () {
      //beware : CRLF inivsible in string :)
      var code = this.code.split( "\n" ).join( `
` )
      this.$copyText(code).then(function () {
      }, function () {
        alert('Can not copy')
      })

      this.isCopyWindowsActive = true
      setTimeout(() => this.isCopyWindowsActive = false, 1500)
    },
    //FIXME : need Windows Copy
    //TODO : a "download" + a "download archive" would be cool
    templateKeys() {
      return this.templates.map(x => x.name)
    },
    filterName(name) {
      return this.templates.filter(x => x.name.indexOf(name) !== -1)
    },
    //FIXME : check event => if previous val != '' => use previous val when searching name
    replaceTokensInString(code) {
      if ( this.name != '' ) {
        code = code.replace('name: myname', 'name: ' + this.name )
      }
      if ( this.namespace != '' ) {
        code = code.replace('namespace: default', 'namespace: ' + this.namespace )
      }
      return code
    },
    update: function (event) {
      if (event) {
        //alert(event)
        this.$refs.autocomplete.focusout()
        this.$refs.editor.getEditor().setValue(this.replaceTokensInString(this.filterName(event)[0].content))
        this.editor.revealPosition({ lineNumber: 1, column: 1 });
        this.editor.setPosition({ lineNumber: 2, column: 1 })
        this.$refs.editor.focus()
      }
    },
    replaceTokens: function (){
      this.$refs.editor.getEditor().setValue(this.replaceTokensInString(this.code))
    },
    editorDidMount(editor) {
      // Listen to `scroll` event
      editor.getModel().updateOptions({ tabSize: 2 }),
      this.editor = editor
    },
    parseErrors(parseErrors){
      const monaco = require('monaco-editor')
      const model = this.editor.getModel()
      monaco.editor.setModelMarkers(model, 'parser', [])

      var markers = []
      var filteredErrors=ParseError.getFilteredErrors(parseErrors)
      for (var i = 0; i < filteredErrors.length; i++ ){
        markers.push(filteredErrors[i].getMarker())
      }
      monaco.editor.setModelMarkers(model, 'parser', markers)
    }
  },
  watch: {
    code: function() {
      this.setDebouncedCode(this)
          //       if (this.listToSearch[i].match(new RegExp('(?=.*' + this.inputSplitted.join(')(?=.*') + ').+', "gi"))) {
          //   this.searchMatch.push(this.listToSearch[i])
          // }
    }
  },
  data() {
    // Create an array with for input auto select via concact plus name extraction
    var templates = v1.concat(appsV1, testsV1)
    return {
      code: "---\nwelcome: |\n  Wecome\n  Paste your yaml or select one above",
      debouncedCode: "",
      isCopyLinuxActive: false,
      isCopyWindowsActive: false,
      monOptions: { tabSize: 2 },
      templates: templates,
      yamlCodeAsJson: {},
      name: '',
      namespace: '',
      decorations: Array,
      editor: Object,
      yamlErr: undefined,
      glyphs: []
    }
  }
}
</script>

<style>
.filename {
  visibility: hidden !important;
}
</style>

<style scoped>

.editor {
  height: 60%;
  margin-top: 10px;
  margin-bottom: 10px;
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

.schemaUrl {
  width: 93%;
}
.namespace {
  min-width: 80%;
}
.name {
  min-width: 80%;
}
.long {
  width: 86%;
  margin-left: 7%;
}
</style>
