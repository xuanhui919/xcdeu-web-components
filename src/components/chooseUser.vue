<template>
  <section>
    <div class="user-container">
      <div @click.prevent="showInput">
        <el-tag
          v-for="tag in dynamicTags"
          :key="tag"
          closable
          :disable-transitions="false"
          @close="handleClose(tag)"
        >
          {{ tag }}
        </el-tag>
        <el-autocomplete
          v-if="inputVisible && allowWrite"
          ref="saveTagInput"
          v-model="inputVal"
          class="input-new-tag"
          size="small"
          :highlight-first-item="true"
          :fetch-suggestions="querySearchAsync"
          :select-when-unmatched="true"
          @select="handleSelect"
          @change="changeSelect"
        >
          <template slot-scope="{ item }">
            <div class="name">{{ item.name }} {{ item.orgName }}</div>
          </template>
        </el-autocomplete>
      </div>
      <el-button slot="append" @click.native="chooseUser">...</el-button>
    </div>
    <el-dialog
      title="选择成员对象"
      :visible.sync="dialogVisible"
      width="1000"
      top="0"
      class="abow_dialog"
      :fullscreen="isFullScreen"
      @open="openChooseUserModal"
    >
      <!-- <span>这是一段信息</span> -->
      <div class="choose-selector">
        <el-button type="text" style="position: absolute; right: 0; top: 0; z-index: 1" @click="clearAll">全部清空</el-button>

        <el-tabs v-model="activeName">
          <el-tab-pane v-if="tabRoles.includes('orgUser')" label="组织" name="org">
            <div class="choose-selector-select-container">
              <el-autocomplete
                v-model="orgUserSearchValue"
                popper-class="my-autocomplete"
                :fetch-suggestions="treeSearch"
                :select-when-unmatched="true"
                placeholder="快速查找组织与人"
                clearable
                @select="(item) => handleTreeSelect(item, 'orgUser')"
              >
                <i
                  slot="prefix"
                  class="el-icon-search el-input__icon"
                  @click="handleIconClick"
                />
                <template slot-scope="{ item }">
                  <div>{{ item.name }}&lt;{{ item.orgName }}&gt;</div>
                </template>
              </el-autocomplete>
              <tree
                ref="orgUserNodes"
                :nodes="orgUserNodes"
                :setting="setting"
                @onCheck="onCheck"
                @onCreated="(treeObj) => handleCreated(treeObj, 'orgUserTree')"
                @onClick="(e, treeId, treeNode) => clickNode(e, treeId, treeNode, 'orgUserTree')"
              />
            </div>
          </el-tab-pane>
          <el-tab-pane v-if="tabRoles.includes('group')" label="群组" name="group">
            <div class="choose-selector-select-container">
              <tree
                ref="groupNodes"
                :nodes="groupNodes"
                :setting="setting"
                @onCheck="onCheck"
                @onCreated="(treeObj) => handleCreated(treeObj, 'groupTree')"
                @onClick="(e, treeId, treeNode) => clickNode(e, treeId, treeNode, 'groupTree')"
              />
            </div>
          </el-tab-pane>
          <el-tab-pane v-if="tabRoles.includes('myGroup')" label="我的群组" name="my">
            <div class="choose-selector-select-container">
              <tree
                ref="myGroupNodes"
                :nodes="myGroupNodes"
                :setting="setting"
                @onCheck="onCheck"
                @onCreated="(treeObj) => handleCreated(treeObj, 'myGroupTree')"
                @onClick="(e, treeId, treeNode) => clickNode(e, treeId, treeNode, 'myGroupTree')"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
        <div class="choose-selector-selected-container">
          <el-input
            v-model="selectedSearchValue"
            placeholder="快速查找"
          >
            <i slot="prefix" class="el-input__icon el-icon-search" />
          </el-input>
          <div>
            <p v-for="(item, index) in filterSelectedList" :key="index">
              <span><i :class="'icon-' + item.iconSkin " /><em>{{ item.name }}</em></span><i class="icon-close-x" @click="delItem(index, item.id)" />
            </p>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitSelectedValue">确 定</el-button>
        <i class="icon-fullscreen" />
      </span>
    </el-dialog>
  </section>
</template>
<script>
import tree from 'vue-giant-tree'
import { getChooseUserDataByParams, gettSearchListByValue } from '@/api/index'
export default {
  components: { tree },
  props: {
    allowWrite: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array,
      default: function () {
        return []
      }
    },
    selectRole: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data () {
    return {
      orgUserSearchValue: '',
      selectedSearchValue: '',
      dialogVisible: false,
      activeName: 'org',
      orgUserNodes: [],
      orgUserSearchNodes: [],
      groupNodes: [],
      groupSearchNodes: [],
      myGroupNodes: [],
      myGroupSearchNodes: [],
      orgUserTree: null,
      groupTree: null,
      myGroupTree: null,
      inputVisible: false,
      inputVal: '',
      inputSearchList: [],
      selectedArr: [],
      selelctedFilterArr: [],
      selectedIds: '',
      tabRoles: [],
      setting: {
        dblClickExpand: false,
        check: {
          enable: true,
          chkboxType: {
            Y: '',
            N: ''
          }
        },
        data: {
          simpleData: {
            enable: true,
            pIdKey: 'pId'
          }
        },
        view: {
          showIcon: false,
          addDiyDom: this.addDiyDom
        }
      },
      isFullScreen: false
    }
  },
  computed: {
    dynamicTags: function () {
      const arr = []
      const selectArr = this.selectedArr
      for (let i = 0; i < selectArr.length; i++) {
        arr.push(selectArr[i].name + (selectArr[i].orgName ? '<' + selectArr[i].orgName + '>' : ''))
      }
      return arr
    },
    filterSelectedList: function () {
      const value = this.selectedSearchValue
      if (value) {
        return this.selelctedFilterArr.filter(function (item) {
          if (item.name.toString().indexOf(value) !== -1) {
            return item
          }
        })
      }
      return this.selelctedFilterArr
    }
  },
  watch: {
    // 正确给 cData 赋值的 方法
    value: function (newVal, oldVal) {
      this.value = newVal // newVal即是chartData
      this.selectedArr = this.value
    }
  },
  mounted () {
    this.tabRoles = this.selectRole
    this.loadTreeData()
    this.selectedArr = this.value
  },
  methods: {
    changeSelect (value) {
      // eslint-disable-next-line no-console
      console.log(value)
    },
    handleTreeSelect (item, treeName) {
      if (item.value === '') {
        this[treeName + 'Nodes'] = this[treeName + 'SearchNodes']
      } else if (item.value) {
        this[treeName + 'SearchValue'] = item.value
      } else {
        this[treeName + 'SearchValue'] = item.name + '<' + item.orgName + '>'
      }
      if (this[treeName + 'SearchValue']) {
        let value = this[treeName + 'SearchValue']
        value = value.indexOf('<') !== -1 ? value.substring(0, value.indexOf('<')) : value
        this.searchTree(value, treeName)
      }
    },
    searchTree (value, treeName) {
      const treeObj = this[treeName + 'Tree']
      this[treeName + 'Nodes'] = treeObj.getNodesByParamFuzzy('name', value, null)
    },
    handleIconClick () {

    },
    treeSearch (queryString, cb) {
      const inputSearchList = this.orgUserSearchNodes
      const results = queryString ? inputSearchList.filter(this.createFilter(queryString)) : inputSearchList
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter (queryString) {
      return (restaurant) => {
        return (restaurant.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    // 打开模态框 重新渲染已经选择的用户
    openChooseUserModal () {
      this.selelctedFilterArr = JSON.parse(JSON.stringify(this.selectedArr))
      this.canceSelectAllBtns()
      for (const role of this.tabRoles) {
        this.initTreeCheck(this[role + 'Tree'])
      }
    },
    // 全部清空
    clearAll () {
      this.canceSelectAllBtns()
      this.selelctedFilterArr = []
      if (this.orgUserTree) {
        this.orgUserTree.checkAllNodes(false)
      }
    },
    // 清除所有树节点全选
    canceSelectAllBtns () {
      const checkboxArr = document.querySelectorAll('input.selectAllBtn')
      for (const checkbox of checkboxArr) {
        checkbox.checked = false
      }
    },
    // 分别加载 所有树的数据
    loadTreeData () {
      for (const cmp of this.tabRoles) {
        const params = {
          type: cmp
        }
        getChooseUserDataByParams(params).then(res => {
          this[cmp + 'Nodes'] = res
          this[cmp + 'SearchNodes'] = JSON.parse(JSON.stringify(res))
        })
      }
    },
    // 初始化树 的全选 节点
    addDiyDom (treeId, treeNode) {
      if (treeNode.isParent) {
        // 如果该节点为父节点 则在该节点后 新增全选按钮 点击全选 下面的子节点 全部被选中
        const allSelect = document.createElement('label')
        const checkbox = document.createElement('input')
        const text = document.createElement('span')
        text.innerHTML = '全选'
        checkbox.setAttribute('type', 'checkbox')
        checkbox.setAttribute('class', 'selectAllBtn')
        allSelect.appendChild(checkbox)
        allSelect.appendChild(text)
        const selectNode = document.getElementById(treeNode.tId)
        selectNode.appendChild(allSelect)
        const _that = this
        checkbox.onclick = function () {
          const check = this.checked
          const treeNodes = treeNode.children
          if (check) {
            for (const node of treeNodes) {
              if (_that.orgUserTree) {
                _that.orgUserTree.checkNode(node, true, false, true)
              }
            }
          } else {
            for (const node of treeNodes) {
              if (_that.orgUserTree) {
                _that.orgUserTree.checkNode(node, false, false, true)
              }
            }
          }
        }
      }
    },
    // 单击节点 选中 checkbox
    clickNode (evt, treeId, treeNode, cmd) {
      if (treeNode.checked) { // 已被勾选，取消勾选
        this[cmd].checkNode(treeNode, false, false, true)
      } else { // 勾选
        this[cmd].checkNode(treeNode, true, false, true)
      }
    },
    handleCreated (ztreeObj, cmd) {
      this[cmd] = ztreeObj
      this.initTreeCheck(ztreeObj)
    },
    // 初始化ztree选项
    initTreeCheck (ztreeObj) {
      const selectArr = this.selelctedFilterArr
      if (selectArr.length > 0) {
        for (let i = 0; i < selectArr.length; i++) {
          const node = ztreeObj.getNodeByParam('id', selectArr[i].id, null)
          ztreeObj.checkNode(node, true, true)
        }
      } else {
        if (ztreeObj) {
          ztreeObj.checkAllNodes(false)
        }
      }
    },
    // 选择autocomplate 列表选项的回调
    handleSelect (item) {
      this.inputVisible = false
      if (this.selectedIds.indexOf(item.id) === -1) {
        this.selectedArr.push(item)
        this.selectedIds += item.id + ','
      }
    },
    // 返回autocomplete 的结果集
    querySearchAsync (queryString, cb) {
      let inputSearchList
      gettSearchListByValue({ searchName: queryString }).then(res => {
        inputSearchList = res
        const results = queryString ? inputSearchList.filter(this.createStateFilter(queryString)) : inputSearchList
        cb(results)
        if (results.length === 0) {
          this.inputVal = ''
        }
      })
    },
    // 创建autocomplete 的filter
    createStateFilter (queryString) {
      return (inputVal) => {
        return (inputVal.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    // tag 删除
    handleClose (tag) {
      this.selectedArr.splice(this.dynamicTags.indexOf(tag), 1)
    },
    // 搜索显示输入框
    showInput () {
      this.inputVisible = true
      this.$nextTick(function () {
        this.$refs.saveTagInput.focus()
      })
    },
    // 打开选人模态框
    chooseUser () {
      this.dialogVisible = true
    },
    // ztree checkbox 选中
    onCheck (event, treeId, treeNode) {
      if (treeNode.checked) {
        const node = {
          id: treeNode.id,
          pid: treeNode.pId,
          name: treeNode.name,
          popcode: treeNode.popcode,
          orgName: treeNode.orgName,
          iconSkin: treeNode.iconSkin,
          canSelect: treeNode.canSelect,
          open: treeNode.open
        }
        this.selelctedFilterArr.push(node)
      } else {
        for (let i = 0; i < this.selelctedFilterArr.length; i++) {
          if (treeNode.id === this.selelctedFilterArr[i].id) {
            this.selelctedFilterArr.splice(i, 1)
          }
        }
      }
    },
    // 选人列表删除选项
    delItem (index, id) {
      this.selelctedFilterArr.splice(index, 1)
      if (this.orgUserTree) {
        this.cancelTreeSelected(this.orgUserTree, id)
        return
      }
      if (this.groupTree) {
        this.cancelTreeSelected(this.groupTree, id)
        return
      }
      if (this.myGroupTree) {
        this.cancelTreeSelected(this.myGroupTree, id)
      }
    },
    cancelTreeSelected (ztreeObj, id) {
      const node = ztreeObj.getNodeByParam('id', id, null)
      ztreeObj.checkNode(node, false, false, true)
    },
    // 点击确定关闭模态框
    submitSelectedValue () {
      this.selectedArr = this.selelctedFilterArr
      this.$emit('input', this.selectedArr)
      this.dialogVisible = false
    }
  }
}
</script>
