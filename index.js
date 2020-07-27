import main from './src/components/chooseUser'

const install = Vue => {
  Vue.component(main.name, main)
}

export default install;
