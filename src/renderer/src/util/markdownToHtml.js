import ExportHtml from 'muya/lib/utils/exportHtml.js'

const markdownToHtml = async markdown => {
  const html = await new ExportHtml(markdown).renderHtml()
  return `<article class="markdown-body">${html}</article>`
}

export default markdownToHtml
