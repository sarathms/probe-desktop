const webpack = require('webpack')
const glob = require('glob')
const { basename, resolve } = require('path')
const csvParse = require('csv-parse/lib/sync');
const { readFileSync, writeFileSync } = require('fs')

const supportedLanguages = glob.sync('./lang/*.json').map((f) => basename(f, '.json'))

const localeDataFilesContent = supportedLanguages
  .map(lang => require.resolve(`react-intl/locale-data/${lang}`))
  .map(path => readFileSync(path, 'utf8'))

writeFileSync('static/locale-data.js', localeDataFilesContent.join('\n'))
console.log("> Wrote locale-data to: ./static/locale-data.js")

const lang = csvParse(readFileSync('./data/lang-en.csv'), {from: 2})
  .reduce((messages, row) => {
    const id = row[0]
    const text = row[1]

    if (messages.hasOwnProperty(id)) {
      throw new Error(`Duplicate message id: ${id}`)
    }
    messages[id] = text
    return messages
  }, {})

writeFileSync('./lang/en.json', JSON.stringify(lang, null, 2))
console.log("> Wrote messages to: ./lang/en.json")

const translationsMap = supportedLanguages
  .reduce((t, lang) => {
    t[lang] = JSON.parse(readFileSync(`./lang/${lang}.json`))
    return t
  }, {})

const translationsContent = `window.OONITranslations = ${JSON.stringify(translationsMap)}`
writeFileSync('./static/translations.js', translationsContent)
console.log("> Wrote translations to: ./static/translations.js")