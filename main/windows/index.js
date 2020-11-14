/* global require, module, process */

const electron = require('electron')
const osLocale = require('os-locale')

const isWinOS = process.platform === 'win32'

const windowURL = require('./windowURL')

const openAboutWindow = require('./aboutWindow')

const mainWindow = () => {
  let windowHeight = 640

  if (isWinOS) {
    windowHeight -= 12
  }

  const win = new electron.BrowserWindow({
    width: 1024,
    height: windowHeight,
    title: 'OONI Probe',
    titleBarStyle: 'hiddenInset',
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  const locale = osLocale.sync() || 'en'
  win.loadURL(windowURL(`home?lang=${locale}`))
  return win
}

module.exports = {
  mainWindow,
  openAboutWindow,
  windowURL
}
