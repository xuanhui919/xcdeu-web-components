import chooseUser from './src/components/chooseUser'
import fileUp from './src/components/FileUp'

const XcComponents = {
  path: function(){
    var jsPath = document.currentScript ? document.currentScript.src : function(){
      var js = document.scripts
        ,last = js.length - 1
        ,src;
      for(var i = last; i > 0; i--){
        if(js[i].readyState === 'interactive'){
          src = js[i].src;
          break;
        }
      }
      return src || js[last].src;
    }();
    return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
  }(),
  install: Vue => {
    Vue.component(chooseUser.name, chooseUser)
    Vue.component(fileUp.name, fileUp)
  }
}

//暴露XcComponents
window.XcComponents = XcComponents

if (typeof Vue !== 'undefined') {
  Vue.use(XcComponents)
}

export default XcComponents;
