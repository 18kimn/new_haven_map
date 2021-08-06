import marked from 'marked'
import * as fs from 'fs'

const text = fs.readdirSync('src/assets/text/md').map((filename) => {
  if (!filename.match(/md/)) return null
  const parsed = fs.readFileSync('src/assets/text/md/' + filename, 'utf8')
  return marked(parsed)
})

fs.writeFile('src/assets/text/posts.json', 
  JSON.stringify(text), 
  (err) => {
    if (err) throw err
  })
