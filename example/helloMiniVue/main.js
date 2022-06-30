import { App } from "./App";
import { createApp } from '../../lib/mini-vue.esm.js'

const container = document.querySelector('#div')
createApp(App).mount(container)
