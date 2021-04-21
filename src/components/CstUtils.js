export default class CstUtils {
  static convertJsonPath(jsonPath){
    return jsonPath.replace("[", "").replace("]", "").slice(1)
  }
  static findNode(key, elements, parent, index) {
    if (elements === undefined || elements === null) {
        return [parent, index]
    }

    // Very first level : can only be an array
    if (elements.type === "DOCUMENT") {
      //only deal with Collections (Ignore comments and others)
      for (var i=0; i < elements.contents.length; i++){
        if (elements.contents[i].type === "MAP" ){
          return CstUtils.findNode(key, elements.contents[i], elements, i)
        }
      }
    }

    let parsedKeys = key.split("/")

    // went at end of tree => return
    if (elements.type === "PLAIN") {
        return [elements, index]
    }
    //Iterate the MAP ensuring staying on the path we search
    if (elements.type === "MAP") {
        let items = elements.items
        for (let i=0; i < items.length; i++) {
            if (items[i].strValue === parsedKeys[0]) {
                // end on the jsonpath
                if (parsedKeys.length == 1) {
                  return [items[i], i]
                }
                // still some part of path to solve
                if (items[i+1].type === "MAP_VALUE" ) { // && items[i+1].node !== undefined
                    return CstUtils.findNode(parsedKeys.slice(1).join("/"), items[i+1].node, elements, i+1)
                 }
                return [undefined, undefined]
            }
        }
        return  [undefined, undefined]
    }
    if (elements.type === "SEQ") {
        const index = parseInt(parsedKeys[0], 10)
        let items = elements.items

        if (items[index] !== undefined){
          return CstUtils.findNode(parsedKeys.slice(1).join("/"), items[index].node, elements)
        } else {
          return [parent, index]
        }
    }
  }

  static getPosition(type, cstDoc, fullStringDoc, cstPath, range) {
    if (type !== "yaml" ) {
      try {
        return CstUtils.getCharPosition(CstUtils.findNode(CstUtils.convertJsonPath(cstPath),cstDoc).range, cstDoc, fullStringDoc)

      } catch(e) {console.log("could not find path for: ", e)}
    }
    else {
      return CstUtils.getCharPosition(range, cstDoc, fullStringDoc)
    }
  }

  static getCharPosition(position, doc, fullStringDoc){
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
}
