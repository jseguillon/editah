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

  getMarker()
  {
    try {
      var message = ""
      var source = ""
      if (this.type === "yaml" ) {
        message = this.message.message
        source  = this.type
      } else if (this.type === "schema" ) {
        message = this.message.dataPath + " " + this.message.message
        source  = this.type + " " + this.message.schemaPath
      } else if (this.type === "remove" ) {
        message =  this.message.dataPath + " " + "unknown field must be removed"
        source  = "schema"
      }

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
    catch(e) {
      console.log("could not get position", e, this.message)

      return {
        //code: { target: "internal/1", value: "otot" },
        startLineNumber: 0,
        endLineNumber: 0,
        startColumn: 0,
        endColumn: 0,
        message: this.message.message,
        severity: monaco.MarkerSeverity.Error,
        source: this.type
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
