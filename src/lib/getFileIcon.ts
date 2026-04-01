export const getFileIcon = (extension : string) => {
  switch(extension) {
    case "html" :
      return "/html.png"
    case "css" :
      return "/css.png"
    case "js" :
      return "/js.png"
    default :
      return "/unknown.png"
  }
}