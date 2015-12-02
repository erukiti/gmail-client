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

var Rx = require('rx')
var wx = require('../../node_modules/webrx/dist/web.rx')

var shell = require('electron').shell
var ipc = require('ipc')
var remote = require('remote')
var uuidv4 = require('uuid-v4')


class MainViewModel {
	constructor() {
		this.views = wx.list()
		this.createView()
		this.newWindow = (ctx, ev) => {
			shell.openExternal(ev.url)
		}
	}

	createView() {
		let uuid = uuidv4()
		let partition = `persist: ${uuid}`
		ipc.send('uuid', uuid)
		this.views.push({uuid: uuid, partition: partition})
	}
}

let mainViewModel = new MainViewModel()

wx.applyBindings(mainViewModel)


