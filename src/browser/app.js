/* global __dirname */
/* global process */
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
"use strict";
console.log('dummy')

var app = require('electron').app
var BrowserWindow = require('electron').BrowserWindow
var ipc = require('electron').ipcMain
var Menu = require('electron').Menu

var fs = require('fs')
var uuidv4 = require('uuid-v4')

app.setName('gmail client')

app.on('window-all-closed', () => {
  app.quit()
})

var confPath = `${app.getPath('userData')}/conf.json`
var conf = {uuids: {}, width: 1024, height: 800}

try {
  let ar = JSON.parse(fs.readFileSync(confPath))

  conf.width = ar.width || 1024
  conf.height = ar.height || 800
  for (let uuid in ar.uuids) {
    conf.uuids[uuid] = uuid
  }
} catch(e) {
  // nice catch!!!!!
}

console.dir(conf)

var win = null

var template = []

if (process.platform == 'darwin') {
  var name = app.getName();
  template.push({
    label: name,
    submenu: [
      {
        label: `About ${name}`,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide ' + name,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => app.quit()
      },
    ]
  })
}

template.push({
  label: 'File',
  submenu: [
    {
      label: 'New Tabs',
      accelerator: 'CmdOrCtrl+T',
      click: () => win.webContents.send('open')
    },
    {
      type: 'separator'
    },
    {
      label: 'Close Tabs',
      accelerator: 'CmdOrCtrl+W',
      click: () => win.webContents.send('close')
    }
  ]
})

template.push({
  label: 'Edit',
  submenu: [
    {
      label: 'Undo',
      accelerator: 'CmdOrCtrl+Z',
      role: 'undo'
    },
    {
      label: 'Redo',
      accelerator: 'Shift+CmdOrCtrl+Z',
      role: 'redo'
    },
    {
      type: 'separator'
    },
    {
      label: 'Cut',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut'
    },
    {
      label: 'Copy',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy'
    },
    {
      label: 'Paste',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste'
    },
    {
      label: 'Select All',
      accelerator: 'CmdOrCtrl+A',
      role: 'selectall'
    },
  ]
})

template.push({
  label: 'View',
  submenu: [
    {
      label: 'Toggle Full Screen',
      accelerator: (function() {
        if (process.platform == 'darwin')
          return 'Ctrl+Command+F';
        else
          return 'F11';
      })(),
      click: function(item, focusedWindow) {
        if (focusedWindow)
          focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
      }
    },
    {
      label: 'Toggle Developer Tools',
      accelerator: (function() {
        if (process.platform == 'darwin')
          return 'Alt+Command+I';
        else
          return 'Ctrl+Shift+I';
      })(),
      click: function(item, focusedWindow) {
        if (focusedWindow)
          focusedWindow.toggleDevTools();
      }
    },
  ]
})
template.push({
  label: 'Window',
  role: 'window',
  submenu: [
    {
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    },
    {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    },
  ]
})

//   // Window menu.
//   template[3].submenu.push(
//     {
//       type: 'separator'
//     },
//     {
//       label: 'Bring All to Front',
//       role: 'front'
//     }
//   );
// }

var menu = Menu.buildFromTemplate(template)


app.on('ready', () => {
  win = new BrowserWindow({
    width: conf.width,
    height: conf.height,
  })
  win.loadURL(`file://${__dirname}/../renderer/index.html`)
  win.webContents.on('did-finish-load', () => {
    var uuids = Array.from(Object.keys(conf.uuids))

    console.log("--------")
    console.dir(uuids)
    if (uuids.length == 0) {
      let uuid = uuidv4()
      console.log(uuid)
      uuids.push(uuid)
      conf.uuids[uuid] = uuid
      fs.writeFileSync(confPath, JSON.stringify(conf))
      console.dir(conf)
    }
    console.log("--------")
    win.webContents.send('init', uuids)
  })
  win.on('close', () => {
    conf.width = win.getBounds().width
    conf.height = win.getBounds().height
    fs.writeFileSync(confPath, JSON.stringify(conf))
  })

  ipc.on('uuid', (ev, uuid) => {
    console.log(`uuid: ${uuid}`)
    console.dir(conf.uuids)
    if (!conf.uuids[uuid]) {
      conf.uuids[uuid] = uuid
      console.dir(conf)
      console.log(JSON.stringify(conf))
      fs.writeFileSync(confPath, JSON.stringify(conf))
    }
  })

  ipc.on('remove', (ev, uuid) => {
    if (conf.uuids[uuid]) {
      delete conf.uuids[uuid]
      console.dir(JSON.stringify(conf))
      fs.writeFileSync(confPath, JSON.stringify(conf))
    }
  })

  Menu.setApplicationMenu(menu)

})
