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
            <li v-for="(result,index) in parseErrors" :key="`result-${index}`" v-html="result.dataPath + ': ' +  result.message + '<br/> (from: ' + result.schemaPath + ')'" />
          </ul>
        </div>
        <p id="quickMessage" v-if="( parseErrors.length == 0  && !invalid)">Document is valid against schema <br/> Good job !</p>
      <!-- <div class="ui inverted segment" style="margin-top: 5px; margin-bottom: 10px; background: inherit;"> -->
        <!-- <h4 class="ui horizontal white divider header" style="margin-bottom:2px;"></h4> -->
        <div class="ui styled accordion configuration" style="margin-bottom:10px; border:1px white solid;  width: auto; margin-right: -30px">

        <div class="title" @click="toggleConfig()" >
          <i class="dropdown icon" v-bind:class="{ 'active': showConfig }"></i> Configuration
        </div>
        <div class="content" v-bind:class="{ 'active': showConfig }" style="width: 100%;  background: white ; color: black;" >
          <div><label>JsonSchemaURL TODO replace with array [apiVersion: url /ref compute]</label>
          <textarea ref="schemaUrl" placeholder="Json Schema" style="width: 100%;  background: inherit; color: inherit;" class="name ui input" v-model="jsonSchemaURL" id="textareaURL" type="textarea" rows="2" />
          </div>
          <!-- <div><label>update schema when choosing from template list</label>
          TODO
          </div> -->
          <div><label>Json Schema Refs:</label>
          <textarea ref="schemaRefs" placeholder="Json Schema Ref" style="width: 100%;  background: inherit; color: inherit;" class="name ui input" v-model="jsonSchemaRef" id="textareaURL" type="textarea" rows="2" />
          </div>
        </div>

        </div>
      <!-- </div> -->


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
const _ajv = new Ajv( {removeAdditional: "all",   strict: false, allErrors: true})
const jsonpatch = require('fast-json-patch');
const yaml = require('js-yaml');

import parseCST from 'yaml/parse-cst'

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
      showInfoBox: false
    }
  },
  computed: {
  },
  methods: {
    findNode(key, elements, parent) {
      if (elements === undefined || elements === null) {
          return
      }

      let parsedKeys = key.split("/")

      if (elements.type === "PLAIN") {
          return elements
      }
      if (elements.type === "MAP") {
          let items = elements.items
          for (let i=0; i < items.length; i++) {
              if (items[i].strValue === parsedKeys[0]) {
                  if (items.length == 1) {
                    return items[i]
                  }
                  console.log(items[i].toString())
                  if (items[i+1].type === "MAP_VALUE") {
                      return this.findNode(parsedKeys.slice(1).join("/"), items[i+1].node, elements)
                  }
                  return
              }
          }
          return
      }
      if (elements.type === "SEQ") {
          const index = parseInt(parsedKeys[0], 10)
          let items = elements.items

          if (items[index] !== undefined){
            return this.findNode(parsedKeys.slice(1).join("/"), items[index].node, elements)
          } else {
            return parent
          }
      }
    },
    toggleInfoBox: function() {
      this.showInfoBox = ! this.showInfoBox;
    },
    toggleConfig: function() {
      this.showConfig = ! this.showConfig;
    },
    parse: function (doc, vm) {
      console.log("1"); console.log(doc)
      var docAsJson;
      try {
        docAsJson = yaml.loadAll(doc)[0] //FIXME multi doc (CST first?)
        //FIXME :
        //=> in Template (or Editor ? : decorator update) this.decorator = this.editor.deltaDecorations([ this.decorator ], [ this.getGlyph() ]);
      }
      catch (error) {
        this.parseErrors = [{"type": "yaml", "message": error.reason, "line": error.mark.line+1, "column": error.mark.colum}]
        this.showInfoBox=true
        return
        //this.decorator = this.editor.deltaDecorations([ this.decorator ], [ this.getGlyph() ]);
      }

      var parsed=parseCST(doc)
      try {
      //find will be called on each error after reformat path FIXME : multi doc + doc begins with comment block
        console.log(this.findNode("spec/containers",parsed[0].contents[0]).range.start)
      } catch(e){
        console.log(e) //will only have no line if exception on solving path via CST
      }

      var oldDocAsJson=JSON.parse(JSON.stringify(docAsJson))

      //FIXME : nunjucks config detection
      const valid = vm.ajv.validate({ $ref: 'schema#' + '/definitions/io.k8s.api.core.' + docAsJson.apiVersion + '.' + docAsJson.kind }, docAsJson) //eval(this.jsonSchemaRef)

      //TODO : at end of treatment : emit new errors event for futur glyphs update
      //this.$emit('parsed', this.errors, e)

      //need the findNode function to be a common module => need it to resolve

      if (!valid) {
        this.invalid=true
        this.parseErrors = vm.ajv.errors //TODO add a {"type": "schema", "errors": ajvErr }
        this.showInfoBox=true
        console.log(this.parseErrors)
      }
      else {
        this.invalid=false
        this.showInfoBox=false
        this.parseErrors = []
      }
      //FIXME : add removed fields as errors => write a function to that and override /metadata
      var jsonDiffs = jsonpatch.compare(oldDocAsJson, JSON.parse(JSON.stringify(docAsJson)), true)
      for (var i=0; i < jsonDiffs.length; i++){
        if (jsonDiffs[i].op === "remove") {
          this.parseErrors.push({"type": "unknown", "message": "neeed remove", "path": jsonDiffs[i].path})
          this.showInfoBox=true
        }
      }
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
    code: function(newVal, oldVal) {
      this.parse(newVal, this, oldVal)
    },
    jsonSchemaURL: function(newVal) {
      console.log(newVal)
      axios
        .get(newVal)
        .then(response => {
          this.ajv.removeSchema("schema")
          this.ajv.addSchema(response.data, "schema")
          console.log(response.data)
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