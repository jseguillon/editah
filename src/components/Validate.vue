<template>
  <div>
    <!-- <div class="messages ">
      <ul class="overflow" style="max-height: 110;overflow: scroll;overflow-x: hidden; outline:solid">
          <li v-for="(result,index) in parseErrors" :key="`result-${index}`" v-html="result.dataPath"> </li>
      </ul>
    </div> -->
        <div class="myicon">
        <i class="bigger icons"  @click="toggleInfoBox()">
            <i class="round-bubble circular inverted thumbs link icon" v-bind:class="{ 'up': parseErrors.length == 0, 'green': parseErrors.length == 0, 'red': parseErrors.length != 0, 'down': parseErrors.length != 0}"  style="box-shadow: 5px 10px 5px 0px rgba(0,0,0,0.75);"></i>
        </i>
        </div>
            <div class="bubble  circular" >
    <transition name="slide-fade">
      <div id="infobox" v-if="showInfoBox"  v-bind:class="{ 'background-brick': parseErrors.length > 0 || invalid, 'green': ( parseErrors.length == 0 && !invalidYaml) }" >

        <div id="quickMessage" v-if="parseErrors.length > 0">errors:
          <ul id="errors" class="overflow" style=" ">
            <li v-for="(result,index) in parseErrors" :key="`result-${index}`" v-html="result.dataPath + ': ' +  result.message + '<br/> (line: ' + result.line.relativeLine + '/' + result.line.absoluteLine + ') (from: ' + result.schemaPath + ')'" />
          </ul>
        </div>
        <p id="quickMessage" v-if="( parseErrors.length == 0)">Document is valid against schema TODO show version + give chance to change <br/> Good job !</p>
      </div>
      </transition>

      </div>

     <!--{{ apiLabel }}-->
     <!-- need hover -->
     <!-- need click -->
     <!-- need way to change api version -->

  </div>
</template>

<script>
const axios = require('axios');
const Ajv = require("ajv").default
const _ajv = new Ajv( {removeAdditional: "all",   strict: false, allErrors: true,       schemaId: 'auto', format: 'full',  coerceTypes: true, unknownFormats: 'ignore',
      useDefaults: true})
const jsonpatch = require('fast-json-patch');
const yaml = require('js-yaml');
const nunjucks = require('nunjucks')

import parseCST from 'yaml/parse-cst'
import YAML from 'yaml'
import ParseError from '../components/ParseError.js'

export default {
  name: "ValidateOnSchemaVersionItem",
  data() {
    return {
      ready: false,
      valid: null,
      jsonSchema: null,
      jsonSchemaURL: "https://raw.githubusercontent.com/kubernetes/kubernetes/release-1.18/api/openapi-spec/swagger.json",
      jsonSchemaRef: "'/definitions/io.k8s.api.core.' + doc.apiVersion + '.' + doc.kind", // https://raw.githubusercontent.com/kubevirt/kubevirt/master/api/openapi-spec/swagger.json =>  '/definitions/v1' +  '.' + doc.kind
      error: null,
      unRefedSchema: null,
      invalidYaml: null,
      invalid: null,
      parseErrors: [],
      showConfig: false,
      showInfoBox: false,
      refsSchema: {
        k8s_schemas: {
          "k8s.io": {
            "url": "https://raw.githubusercontent.com/kubernetes/kubernetes/release-1.20/api/openapi-spec/swagger.json",
            "prefix": "/definitions/io.k8s.api.",
            "default": "core."
          },
          "kubevirt.io": {
            "url": "https://raw.githubusercontent.com/kubevirt/kubevirt/master/api/openapi-spec/swagger.json",
            "prefix": "/definitions/",
            "default": ""
          }
        }
      },
      refsDetection: `{%- set is_k8s = (apiVersion | default("") |length > 0) and (kind | default("") |length > 0) %}
{%- if is_k8s %}
# it's a k8s object
  {%- set is_k8s_crd = apiVersion.split("/")[0].includes(".") %}
# is this a CRD: {{ is_k8s_crd }}
  {%- set doc_refs = k8s_schemas[apiVersion.split("/")[0]] if is_k8s_crd else k8s_schemas["k8s.io"] %}
  {%- set api_ns = apiVersion.split("/") %}
  {%- set api_ns = api_ns.slice(1) if is_k8s_crd else api_ns  %}
  {%- set api_ns = api_ns.join('.') if (api_ns | length > 1) else doc_refs.default + api_ns  %}
# api namespace: {{ api_ns }}
ref: {{ doc_refs.prefix }}{{ api_ns }}.{{ kind }}
url: {{ doc_refs.url }}
{% else %}
# it's not a k8s object
{% endif %}`
    }
  },
    convertJsonPath(jsonPath){
      return jsonPath.replace("[", "").replace("]", "").slice(1)
    },
    getCharPosition(position, doc, fullStringDoc){
      //seach first \n after position.start
      var endOfLine = fullStringDoc.toString().indexOf("\n", position.start)
      //stop the doc at line of error
      var slicedDoc=fullStringDoc.toString().slice(0,endOfLine).split(/\n/)

      //Search for non whitespace chars
      var lastLine=slicedDoc[slicedDoc.length-1]
      var matches = [...lastLine.matchAll(/\S|$/g)];

      //compute
      var startColumn
      var endColumn
      if (matches.length > 0){
        startColumn = matches[0].index
        endColumn = matches[matches.length-1].index
      } else {
        startColumn = 0
        endColumn = lastLine.length
      }

      return { "relativeLine": doc.toString().slice(0,position.start-doc.valueRange.start+1).split(/\n/).length,
               "absoluteLine": slicedDoc.length,
               "startLine": slicedDoc.length,
               "startColumn": startColumn+1,
               "endColumn": endColumn+1
              }
    },
    toggleInfoBox: function() {
      this.showInfoBox = ! this.showInfoBox
    },
    toggleConfig: function() {
      this.showConfig = ! this.showConfig;
    },
    parse: function (cstDoc, vm, doc_id, full_string_doc) {
      var docAsJson;
      var parseErrors = []


      try {
        const doc = new YAML.Document()
        doc.parse(cstDoc)

        if (doc.errors.length >0 ) {
          for (var x=0; x < doc.errors.length; x++) {
            var pe = new ParseError("yaml", doc.errors[x], doc_id, cstDoc, full_string_doc)
            parseErrors.push(pe)
          }
          return parseErrors
        }
      }
      catch (e) { console.error("error while parsing YAML", e) }

      try {
        docAsJson = yaml.loadAll(cstDoc.toString())[0]
      }
      catch (e) {
        console.error("error while loading yaml as Json", e)
        return
      }

      var oldDocAsJson=JSON.parse(JSON.stringify(docAsJson))


      var refDetect = yaml.loadAll(nunjucks.renderString(this.refsDetection, Object.assign({}, docAsJson, this.refsSchema)))[0]
      console.log(refDetect)
      if (refDetect !== undefined && refDetect !== null ) {
        var ref = refDetect.ref //refsDetection  'schema#' + '/definitions/io.k8s.api.core.' + docAsJson.apiVersion + '.' + docAsJson.kind
        try {
          //FIXME : ref detection may change schema !
          const valid = vm.ajv.validate({ $ref: 'schema#' +ref }, docAsJson)
          if (!valid) {
            this.invalid=true
            for (var j=0; j < vm.ajv.errors.length; j++){
              parseErrors.push(new ParseError("schema", vm.ajv.errors[j], doc_id, cstDoc, full_string_doc))
            }
          }
        }
        catch (e) {
          console.error("error while validating agains jsonc schema:", e)
        }
        //FIXME : filter some diffs to be considered as normal (metadata)
        var jsonDiffs = jsonpatch.compare(oldDocAsJson, JSON.parse(JSON.stringify(docAsJson)), true)
        // Iterate over diffs and solve line position
        for (var i=0; i < jsonDiffs.length; i++){
          if (jsonDiffs[i].op === "remove") {
            //some new errors in the parsing result :)
            parseErrors.push(new ParseError("remove", { "message": "neeed remove", "dataPath": jsonDiffs[i].path}, doc_id, cstDoc, full_string_doc))
          }
        }
      }
    //FIXME : need to send special ParseError : uknown Api if no ref found
    return parseErrors
    }
  },
  created() {
    this.ajv=_ajv
    axios
      .get(this.jsonSchemaURL)
      .then(response => {
        this.ajv.addSchema(response.data, "schema")
      })
  },
  props: {
    code: String
  },
  watch: {
    code: function(newVal) {
      var parsed=parseCST(newVal)
      //FIXME  : real hardcase ---\n one :one\n      --- (spaces before --- breaks eveything)
      this.parseErrors=[]
      var allErrors=[]

      this.showInfoBox=true
      this.invalid=true
      // FIXME :           this.showInfoBox=true -         this.showInfoBox=false
      for (var i=0; i < parsed.length; i++) {
        allErrors=allErrors.concat(this.parse(parsed[i], this, i, newVal)) //=> should return bunch of errors
      }
      this.parseErrors = allErrors
      this.$emit('parseErrors', this.parseErrors)
    },
    jsonSchemaURL: function(newVal) {
      axios
        .get(newVal)
        .then(response => {
          this.ajv.removeSchema("schema")
          this.ajv.addSchema(response.data, "schema")
        })
    }
  }
};
</script>

<style scoped>

.slide-fade-enter-active{
  animation: fadein 0.5s ease-out;
}

.slide-fade-leave-active{
  animation: fadeout 0.3s ease-out;
}

.bigger {
  font-size: 2.5em;
}

i.icons .icon:first-child{
  margin: 0 !important;
}

@keyframes fadein {
    from {
        opacity:0;
    }
    to {
        opacity:0.8;
    }
}

@keyframes fadeout {
    from {
        opacity:0.8;
    }
    to {
        opacity:0;
    }
}
#infobox{
  background: white;
  position: fixed;
  border-top-right-radius: 80%;
  border-bottom-right-radius: 30%;
  border-top-left-radius: 15%;
  border-bottom-left-radius: 0%;
  box-shadow: 5px 10px 5px 0px rgba(0,0,0,0.75);
  font-family: 'Lato', 'Helvetica Neue', Arial, Helvetica, sans-serif;
  opacity: 1;
  bottom: 13%;
  text-align: left;
  padding-top: 23px;
  padding-right: 100px;
  padding-left: 10px;
  max-width: 600px;
  opacity:0.85;
  right: 15%;
  min-width: 410px;
}
#infobox:hover{
  opacity:1.0;
}

.bubble{
  /* display: inline-block; */
  /* border: 7px solid rgba(255, 0, 0, 0.849)!important; */
  /* border-style: outset !important; */
  /* border-radius: 50%; */
  /* padding-left: 2px; */
  /* font-size: 2.6em; */
  position: relative;
  z-index: 3000;
  /* right: 90vw; */
  /* margin-top: -10%;
  margin-right: -90%; */
}

.myicon{
  position: fixed;
  /* bottom: 100px;
  right: -300; */
  right: 10%;
  bottom: 13%;
}

#errors{
  max-height: 70px;
  /* overflow: scroll; */
  margin-left: -20px;
  padding-left: 40px;
  padding-right: 15px;
  overflow-y: auto; overflow-x: hidden;
  word-break: break-all;
}

#errors::-webkit-scrollbar{
  border-radius: 10px;
  box-shadow: inset 0 0 6px rgba(0,0,0,.3);
  margin: 10px;
  background-color: #ffffff !important;
}

.schemaUrl {
  margin-bottom: 10px;
  width: 100%;
}

.background-brick{
  border-left: 5px solid rgb(255,0,0,0.9);
  border-bottom: 5px solid rgb(255,0,0,1);
  border-right: 10px solid rgb(255,0,0,0.9);
  border-top: 15px solid rgb(255,0,0,0.9);
}

.green{
  border-left: 5px solid rgba(0, 200, 0, 1);
  border-bottom: 5px solid rgba(0, 200, 0, 1);
  border-right: 10px solid rgba(0, 200, 0, 0.9);
  border-top: 15px solid rgba(0, 200, 0, 0.9);
}
#textareaURL::-webkit-scrollbar{
  border-radius: 10px;
  box-shadow: inset 0 0 6px rgba(0,0,0,.3);
  margin: 10px;
  background-color: #ffffff !important;
}

.title {
  background: inherit!important;
  color: inherit!important;
}
.configuration  {
  background: inherit!important;
  color: inherit!important;
}


</style>
