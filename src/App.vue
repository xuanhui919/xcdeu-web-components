<template>
  <div>
    <chooseUser v-model="plateAdminJson" :allow-write="allowWrite" :select-role="roles" :get-user="getUser" :get-search-list="getSearchList" />
    <FileUp :value="imgs" upload-type="image" readonly />
  </div>
</template>

<script>
import { getChooseUserDataByParams, getSearchListByValue } from '@/api/index'
export default {
  name: 'app',
  data () {
    return {
      plateAdminJson: [],
      allowWrite: false,
      roles: ['orgUser'],
      imgs: '13051d29943248b19d232bcfd727bc9c'
    }
  },
  methods: {
    getUser: getChooseUserDataByParams,
    getSearchList: getSearchListByValue,
  }
}
</script>

