const monaco = require('monaco-editor')

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
        else if (currErr.type === "remove" ) {
          //TODO : set a hover for base64 decode proposal for data secrets
          //TODO : should not ignore but test resources named cpu and memory
          var matches = [...currErr.message.dataPath.matchAll(/\/data\/.*|\/spec\/selector.*|.*\/spec\/clusterIPs.*|.*\/metadata\/labels.*|.*\/metadata\/annotations.*|.*\/spec\/nodeSelector.*|.*\/resources\/limits.*|.*\/resources\/requests.*/g)]
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
    }
  }

  getSmartSource(){
    if (this.type === "yaml" ) {
      return this.type
    } else if (this.type === "schema" ) {
      return this.type + " " + this.message.schemaPath
    } else if (this.type === "remove" ) {
      return "schema"
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
        return this.getCharPosition(this.findNode(this.convertJsonPath(this.message.dataPath),cstDoc).range, cstDoc, fullStringDoc)

      } catch(e) {console.log("could not find path for: ", e)}
    }
    else {
      return this.getCharPosition(this.message.source.range, cstDoc, fullStringDoc)
    }
  }

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
  }
  // if (errors.length > 0) {
  //   errors=this.setLineForErrors(errors, parsed[i], newVal)
  //   allErrors=allErrors.concat(errors)
  // }
  findNode(key, elements, parent) {
    if (elements === undefined || elements === null) {
        return parent
    }

    // Very first level : can only be an array
    if (elements.type === "DOCUMENT") {
      //only deal with Collections
      for (var i=0; i < elements.contents.length; i++){
        if (elements.contents[i].type === "MAP" ){
          return this.findNode(key, elements.contents[i], elements)
        }
      }
    }

    let parsedKeys = key.split("/")

    // went at end of tree => return
    if (elements.type === "PLAIN") {
        return elements
    }
    //Iterate the MAP ensuring staying on the path we search
    if (elements.type === "MAP") {
        let items = elements.items
        for (let i=0; i < items.length; i++) {
            if (items[i].strValue === parsedKeys[0]) {
                // end on the jsonpath
                if (parsedKeys.length == 1) {
                  return items[i]
                }
                // still some part of path to solve
                if (items[i+1].type === "MAP_VALUE" ) { // && items[i+1].node !== undefined
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
  }
}
