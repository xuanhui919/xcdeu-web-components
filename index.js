import main from './src/components/chooseUser'
import _Vue from 'vue'

main.install = Vue => {
if (!Vue) {
window.Vue = Vue = _Vue
}
Vue.component(main.name, main)
}
export default main;
