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
var ipc = require('electron').ipcRenderer
var remote = require('remote')
var uuidv4 = require('uuid-v4')

class AddButtonViewModel {
	constructor(append) {
		this.title = "　+　"
		this.click = append
		this.isActive = false
		this.css = "tab-item tab-item-fixed"
	}
}

class MailerViewModel {
	constructor(current, uuid) {
		let re = /^.* - (.*)@gmail.com - Gmail$/ 

		this.uuid = uuid || uuidv4()
		ipc.send('uuid', this.uuid)
		this.partition = wx.property(`persist:${this.uuid}`)
		console.log(this.partition())
		this.title = wx.property('未ログイン')
		this.isActive = wx.whenAny(current, (current) => {
			return current == this.uuid
		}).toProperty()

		this.css = wx.whenAny(current, (current) => {
			if (current == this.uuid) {
				return 'tab-item active'
			} else {
				return 'tab-item'
			}
		})

		this.originalTitle = ''
		this.intervalId = null
		this.setTitle = (ctx, ev) => {
			this.intervalId = window.setInterval(() => {
				this.webview = document.getElementById(this.uuid)
				if (!this.webview) {
					if (this.intevalId) {
						window.clearInterval(this.intervalId)
						this.intervalId = null
					}
					return
				}
				if (this.originalTitle !== this.webview.getTitle()) {
					this.originalTitle = this.webview.getTitle()
					let res = re.exec(this.originalTitle.trim())
					if (res && res.length > 0) {
						this.title(res[1])
					} else {
						console.log(`set title: ${this.originalTitle}`)
					}
				}
			}, 1000)
		}
		this.click = wx.command(() => {
			current(this.uuid)
		})
	}
}

class MainViewModel {
	constructor() {
		this.title = "gmail client"
		this.views = wx.list()
		this.tabs = wx.list([this.addButton])
		this.views.listChanged.subscribe(() => {
			let list = this.views.toArray()
			list = list.concat(this.addButton)
			this.tabs.clear()
			list.forEach((viewModel) => {
				this.tabs.push(viewModel)
			})

			console.log(this.views.length())
			console.log(this.tabs.length())

		})
		this.current = wx.property(null)
		this.newWindow = (ctx, ev) => {
			shell.openExternal(ev.url)
		}
		this.append = wx.command(() => {
			this.createView()
		})
		this.addButton = new AddButtonViewModel(this.append)
		ipc.on('init', (ev, uuids) => {
			uuids.forEach((uuid) => {
				console.dir(uuid)
				this.createView(uuid)
			})
		})
		ipc.on('open', (ev) => {
			this.createView()
		})
		ipc.on('close', (ev) => {
			this.removeView()
		})
		// this.createView('b068dcd6-d78c-43a8-aa8e-539d73ef15fb')
	}

	createView(uuid) {
		console.log(`append: ${uuid}`)
		const mailerViewModel = new MailerViewModel(this.current, uuid)
		this.views.push(mailerViewModel)
		this.current(uuid)
	}

	removeView(uuid) {
		if (this.views.length() == 1) {
			return
		}

		if (!uuid) {
			uuid = this.current()
		}
		this.views.filter((view) => {return view.uuid == uuid}).forEach((viewModel) => {
			this.views.remove(viewModel)
			ipc.send('remove', viewModel.uuid)
		})

		let viewModel = this.views.get(this.views.length() - 1)
		this.current(viewModel.uuid)
	}
}

let mainViewModel = new MainViewModel()

wx.applyBindings(mainViewModel)


