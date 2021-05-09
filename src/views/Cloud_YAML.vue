<template>
  <div class="ui long ">
    <div class="ui segment">

        <div class="one column row " style="">
          <div class="two column">
                <div class="input-auto">
                  <AutoComplete ref="autocomplete"
                  :items="templateKeys()"
                  placeholder="example: 'pod ini', 'config env', 'api access', etc..."
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
              <input ref="name" placeholder="Name" class="name ui input"  v-model="name" type="text">
            </div>
          </div>
          <div class="column">
                <div class="namespace ui input small">
                  <input ref="namespace" placeholder="Namespace" class="ui input" v-model="namespace" type="text">
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
        <button class="ui black toggle button big icon" v-bind:class="{ active: isCopyLinuxActive }" @click="linuxClipboard">
          <i class="check icon" v-if="isCopyLinuxActive"></i>
          Copy clipboad
        </button>

        <button class="ui blue toggle button big icon" data-tooltip="`cat <<EOF | kubectl apply -f - ... EOF`" v-bind:class="{ active: isHeredocActive }" @click="heredocClipboard">
          <i class="check icon" v-if="isHeredocActive"></i>
          <i class="linux icon" v-if="! isHeredocActive"></i>
          kubectl apply clipboard
        </button>
      </div>
      <TwitterFeed style="margin-left:25%;width:50%" src="https://twitter.com/IoEditah?ref_src=twsrc%5Etfw"></TwitterFeed>
  </div>
</template>

<script>
import MonacoEditor from '../components/MonacoEditor.js'
import AutoComplete from "@/components/AutoComplete.vue"
// Only dev
//import testsV1 from '@/assets/jsons/templates/tests.json'
import v1 from '@/assets/jsons/templates/v1.json'
import appsV1 from '@/assets/jsons/templates/apps.v1.json'
import Validate from '../components/Validate.vue'
import ParseError from '../components/ParseError.js'
import CstUtils from '../components/CstUtils.js'
import parseCST from 'yaml/parse-cst'

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
    //TODO : tell list of items is not yet supported
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
    heredocClipboard: function () {
      var code = "cat <<EOF | kubectl apply -f - \n" + this.code.replaceAll('$','\\$') + "\nEOF"
      this.$copyText(code).then(function () {
      }, function () {
        alert('Can not copy')
      })

      this.isHeredocActive = true
      setTimeout(() => this.isHeredocActive = false, 1500)
    },
    //TODO : a "download" + a "download archive" would be cool
    templateKeys() {
      return this.templates.map(x => x.name)
    },
    filterName(name) {
      return this.templates.filter(x => x.name.indexOf(name) !== -1)
    },
    update: function (event) {
      if (event) {
        //alert(event)
        this.$refs.autocomplete.focusout()
        this.$refs.editor.getEditor().setValue(this.filterName(event)[0].content)
        this.editor.revealPosition({ lineNumber: 1, column: 1 });
        this.editor.setPosition({ lineNumber: 2, column: 1 })
        this.$refs.editor.focus()
        this.name="myapp"
      }
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
    },
    name(neww, old) {
      neww = neww.trim()
      var parsed=parseCST(this.code)

      for (var i=0; i < parsed.length; i++) {
        try {
          //TODO : if new is empty : empty whole name and keep after (- ?
          //FIXME : /spec/containers[*]/env/[*]/valueFrom/configMapKeyRef/name to replace for 📚 v1.Pod configmap - env var valueFrom
          const [element, idFromParent ] = CstUtils.findNode(CstUtils.convertJsonPath("/metadata/name"), parsed[i])
          const regex = new RegExp("^(:?)( *)(" + old + "[ ]*)([-|\\w]*)$", "gm");
          element.context.parent.items[idFromParent+1].value = element.context.parent.items[idFromParent+1].rawValue.replace(regex, "$1$2" + neww +"$4") +"\n"
        }
        catch (e) {
          console.log("Could not change name for document ", i , e)
        }
      }

      this.code = ""
      for (i=0; i < parsed.length; i++) {
        var code = parsed[i].toString()
        //enforce ("---") on first line
        if (! code.startsWith("---")){
          code = "---\n" + code
        }
        this.code += code
      }

    },
    namespace(neww) {
      neww = neww.trim()

      var parsed=parseCST(this.code)
      for (var i=0; i < parsed.length; i++) {
        try {
          //want to remove ? Mark as comment, will be deleted when rendering result
          if (neww.length == 0){
            const [element, idFromParent ] = CstUtils.findNode(CstUtils.convertJsonPath("/metadata/namespace"), parsed[i])
            element.context.parent.items[idFromParent].value = "#EDITAH_TO_BE_DELETED"
          }
          else {
            const [element, idFromParent ] = CstUtils.findNode(CstUtils.convertJsonPath("/metadata/namespace"), parsed[i])
            // found path : change
            if (element !== undefined) {
              const regex = new RegExp("^(:?)(.*)$", "gm");
              element.context.parent.items[idFromParent+1].value = element.context.parent.items[idFromParent+1].rawValue.replace(regex, "$1 " + neww)  +"\n"
            }
            // not found path : add after name (ugly)
            else {
              const [element, idFromParent ] = CstUtils.findNode(CstUtils.convertJsonPath("/metadata/name"), parsed[i])
              element.context.parent.items[idFromParent+1].value = element.context.parent.items[idFromParent+1].rawValue + "\n  namespace: " + neww + "\n"
            }
          }
        }
        catch (e) {
          console.log("Could not change namespace for document ", i , e)
        }
      }

      this.code = ""
      for (i=0; i < parsed.length; i++) {
        var code = parsed[i].toString()
        //enforce ("---") on first line
        if (! code.startsWith("---")){
          code = "---\n" + code
        }
        const regex = new RegExp("^.*#EDITAH_TO_BE_DELETED.*\\n?", "gm");
        this.code += code.replace(regex,"")
      }
    },
  },
  data() {
    // Create an array with for input auto select via concact plus name extraction
    var templates = v1.concat(appsV1)
    return {
      code: "---\napiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: myapp-welcome\ndata:\n  message: |\n    Welcome to editah.io, best online Kubernetes editor, powered by Monaco editor\n    Follow https://twitter.com/IoEditah to stay tuned 👀\n  features: |\n    * As you type validation against API schema ⭐\n    * No backend to keep your data private 🔒\n    * Fast search for examples, discover with random 📚\n    * Multiple YAML documents support 🦄\n  hints: |\n    * Use F8 key to navigate from one error to another\n    * Shift+F8 to navigate backward \n    * Use F1 key to learn more about Monaco Editor feaures\n  incoming: |\n    * CRD support, Internal Kubernetes validator mockup or anything you'd suggest\n---\n# Uncomment (Ctrl + K, Ctrl + U) to see some error samples\nkind: ConfigMap\n# wrong: wrong\n# immutable: yes\nmetadata:\n  name: myapp-error-samples\napiVersion: v1\n",
      debouncedCode: "",
      isCopyLinuxActive: false,
      isHeredocActive: false,
      monOptions: { tabSize: 2 },
      templates: templates,
      yamlCodeAsJson: {},
      name: 'myapp',
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
