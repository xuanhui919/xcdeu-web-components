import chooseUser from './src/components/chooseUser'

const install = Vue => {
  Vue.component(chooseUser.name, chooseUser)
}

export default install;
