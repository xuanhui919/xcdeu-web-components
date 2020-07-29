import chooesUser from './src/components/chooseUser'

const XcComponents = {}
XcComponents.install = Vue => {
  Vue.component(chooesUser.name, chooesUser)
}
if (typeof Vue !== 'undefined') {
  Vue.use(XcComponents)
}

export default XcComponents;
