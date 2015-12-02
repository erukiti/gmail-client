/* global __dirname */
/*
Copyright 2015 SASAKI, Shunsuke. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var app = require('electron').app
var BrowserWindow = require('electron').BrowserWindow
var ipc = require('ipc')

app.on('window-all-closed', () => {
  app.quit()
})

var dirname = __dirname

var openBrowser = (packet) => {
  var win = new BrowserWindow({
    width: packet.width,
    height: packet.height,
  })
  win.loadURL(`file://${dirname}/../renderer/index.html`)
  win.webContents.on('did-finish-load', () => {
    // win.webContents.send 'open', packet
  })
  win.webContents.on('console-message', (level) => {
    console.log('message')
  })

  return win
}

app.on('ready', () => {
  openBrowser({
    width: 1024,
    height: 800,  
  })

  ipc.on('uuid', (ev, uuid) => {
    console.dir(arg)
  })
})
