const monaco = require('monaco-editor')
import CstUtils from '../components/CstUtils.js'

export default class ParseError {
  message = null
  type = null
  doc_id = null
  cstDoc = null
  postion = null

  constructor(t, msg, id, cst_doc, full_string_doc)
  {
    this.type = t
    this.message = msg
    this.doc_id = id
    this.cstDoc = cst_doc
    this.position = this.getPosition(cst_doc, full_string_doc )
  }

  static getFilteredErrors(parsedErrors) {
    //kind: { "message": "neeed remove", "dataPath": "/spec/limits/0/min/cpu" }

    //kind: ResourceQuota  { "message": "neeed remove", "dataPath": "/spec/hard/services.nodeports" }

    var filteredErrors = []

    for (var i =0; i < parsedErrors.length; i++){
      var currErr = parsedErrors[i]
      //TODO : case when a structure of match and profit to test OK or not for any missing or "unknown" definition
      try {
        if (currErr.type === "schema" ) {
          if (currErr.message.schemaPath === "#/definitions/io.k8s.apimachinery.pkg.util.intstr.IntOrString/type"){
            console.log("time to test #/definitions/io.k8s.apimachinery.pkg.util.intstr.IntOrString/type")
            //filteredErrors.push(currErr)
          }
          else if (currErr.message.schemaPath === "#/definitions/io.k8s.apimachinery.pkg.apis.meta.v1.Time/type") {
            //test if  ISO 8601 compliant and only Warn if not ?
            console.log("time to test #/definitions/io.k8s.apimachinery.pkg.apis.meta.v1.Time/type")
            //filteredErrors.push(currErr)
          } else {
            //TODO : may be able to find defintion of schema path and print doc !
            filteredErrors.push(currErr)
          }
        }
        else if (currErr.type === "unkownRef" ) {
          filteredErrors.push(currErr)
        }
        else if (currErr.type === "remove" ) {
          //TODO : set a hover for base64 decode proposal for data secrets
          //FIXME : should not ignore all but test resources named cpu and memory
          var matches = [...currErr.message.dataPath.matchAll(/\/data\/.*|\/spec\/selector.*|.*\/spec\/clusterIPs.*|.*\/metadata\/labels.*|.*\/metadata\/annotations.*|.*\/spec\/nodeSelector.*|.*\/resources\/limits.*|.*\/resources\/requests.*|.*\/spec\/limits\/.*|.*\/spec\/hard\/.*|.*\/podSelector\/matchLabels\/.*|.*\/namespaceSelector\/matchLabels\/.*|\/stringData\/.*|.*\/labelSelector\/matchLabels\/.*/g)]
          if (matches.length == 0){
            filteredErrors.push(currErr)
          }
        }
        else {
          filteredErrors.push(currErr)
        }
      }
      catch (e) { console.error("could not deal with parse error", parsedErrors[i], e) }
    }

    return filteredErrors
    //Enumeration members //Error  Hint Info  Warning <= Warn if ok on N but errors on N-1 or N-2 ? (test N-1 and N-2 only if N is ok)
  }

  getSmartMessage(){
    if (this.type === "yaml" ) {
      return this.message.message
    } else if (this.type === "schema" ) {
      return this.message.dataPath + " " + this.message.message
    } else if (this.type === "remove" ) {
      return this.message.dataPath + " " + "unknown field must be removed"
    } else if (this.type === "unknownRef" ) {
      return this.message.message
    }
  }

  getSmartSource(){
    if (this.type === "yaml" ) {
      return this.type
    } else if (this.type === "api" ) {
      return this.type + " " + this.message.schemaPath
    } else if (this.type === "remove" ) {
      return "api"
    } else if (this.type === "unknownRef" ) {
      return "api"
    }
  }

  getMarker()
  {
    var message = this.getSmartMessage()
    var source = this.getSmartSource()

    if (this.position !== undefined) {
      return {
        //code: { target: "internal/1", value: "otot" },
        startLineNumber: this.position.absoluteLine,
        endLineNumber: this.position.absoluteLine,
        startColumn: this.position.startColumn,
        endColumn: this.position.endColumn,
        message: message,
        severity: monaco.MarkerSeverity.Error,
        source: source
      }
    }
    else {
      return {
        startLineNumber: 0,
        endLineNumber: 0,
        startColumn: 0,
        endColumn: 0,
        message: message,
        severity: monaco.MarkerSeverity.Error,
        source: source
      }
    }
  }

  convertJsonPath(jsonPath){
    return jsonPath.replace("[", "").replace("]", "").slice(1)
  }

  getBubbleMessage()
  {
    return "--" + this.type
  }

  getPosition(cstDoc, fullStringDoc) {
    if (this.type !== "yaml" ) {
      try {
        console.log("<hat",CstUtils.findNode(CstUtils.convertJsonPath(this.message.dataPath),cstDoc)[0].range, cstDoc, fullStringDoc)
        return CstUtils.getCharPosition(CstUtils.findNode(CstUtils.convertJsonPath(this.message.dataPath),cstDoc)[0].range, cstDoc, fullStringDoc)
      } catch(e) {console.log("could not find path for: ", e)}
    }
    else {
      return  CstUtils.getCharPosition(this.message.source.range, cstDoc, fullStringDoc)
    }
  }
}
