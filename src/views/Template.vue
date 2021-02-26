<template>
  <div class="ui container">
    <div class="ui container segment compact">

        <div class="one column row rowCompact" style="">
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

    <div class="ui container segment">
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
      <div class="ui">
          <div class="ui">
            <Menu :yamlCode="yamlCodeAsJson" />
          </div>
          <div class="ui myEdit">
            <MonacoEditor class="editor ui" ref="editor" v-model="code" language="yaml" v-bind:options="{monOptions}"  @editorDidMount="editorDidMount" />
        </div>
      </div>
    </div>
    <br/>

      <div class="ui">
        <button class="ui black toggle button big icon" data-tooltip="Copy to clipboard with Linux End Of Line (='LF' ='\n')" v-bind:class="{ active: isCopyLinuxActive }" @click="linuxClipboard">
          <i class="check icon" v-if="isCopyLinuxActive"></i>
          <i class="linux icon" v-if="! isCopyLinuxActive"></i>
          Copy Linux
        </button>

        <button class="ui blue toggle button big icon" data-tooltip="Copy to clipboard with Window End Of Line (='CRLF' ='\r\n')" v-bind:class="{ active: isCopyWindowsActive }">
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
import v1 from '@/assets/jsons/templates/v1.json'
import appsV1 from '@/assets/jsons/templates/apps.v1.json'
import Menu from '../components/Menu.vue'

const yaml = require('js-yaml');

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
    Menu
  },
  created() {

  },
  mounted() {

  },
  computed: {

  },
  methods: {
    debouncedYamlCodeAsJson: debounce( (vm)  => {
      vm.yamlCodeAsJson=vm.getYamlCodeAsJson()
      console.log ("sa   "  +  vm.yamlCodeAsJson )
      } , 500 ),
    getYamlCodeAsJson: function () {
      //FIXME : make cleaner with reactive computed
      try {
        var result = yaml.load(this.code)
        this.yamlErr=undefined
        this.decorator = this.editor.deltaDecorations([ this.decorator ], [ this.getGlyph() ]);
        return result
      }
      catch (error) {
        this.yamlErr=error
        this.decorator = this.editor.deltaDecorations([ this.decorator ], [ this.getGlyph() ]);
        return {}
      }
    },
    getGlyph() {
      const monaco = require('monaco-editor')
      if (this.yamlErr !== undefined){
        return {
            range: new monaco.Range(this.yamlErr.mark.line+1,this.yamlErr.mark.column,this.yamlErr.mark.line+1,this.yamlErr.mark.column),
            options: {
              // isWholeLine: true,
              className: 'myContentClass2',
              glyphMarginClassName: 'myGlyphMarginClass2',
              glyphMarginHoverMessage: { value:  this.yamlErr.reason  }
            }
          }
      }
      else return {
            range: new monaco.Range(1,1,13,1),
            options: {
              // isWholeLine: true,
              className: '',
              glyphMarginClassName: '',
              glyphMarginHoverMessage: ''
            }
      }
    },
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
      this.decorator = this.editor.deltaDecorations([], [ this.getGlyph() ]);
    }
  },
  watch: {
    code: function() {
      this.debouncedYamlCodeAsJson(this)
    }
  },
  data() {
    // Create an array with for input auto select via concact plus name extraction
    var templates = v1.concat(appsV1)
    return {
      code: "sas\nds\nddza\n",
      isCopyLinuxActive: false,
      isCopyWindowsActive: false,
      monOptions: { tabSize: 2 },
      templates: templates,
      yamlCodeAsJson: {},
      name: '',
      namespace: '',
      decorations: Array,
      editor: Object,
      yamlErr: undefined
    }
  }
}
</script>

<style>
.myGlyphMarginClass2 {
	background: red;
}
.myContentClass2 {
	background: lightblue;
}
</style>

<style scoped>
.editor {
  height: 50%;
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

.namespace {
  min-width: 80%;
}
.name {
  min-width: 80%;
}
</style>
