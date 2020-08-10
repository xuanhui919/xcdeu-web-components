<template>
  <div>
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="100px"
      style="margin: 20px auto; width: 1000px;"
    >
      <el-form-item label="选人" prop="users">
        <chooseUser
          v-model="form.users"
          :allow-write="false"
          :select-role="roles"
          :get-user="getUser"
          :get-search-list="getSearchList"
          @input="validateField('users')"
        />
      </el-form-item>
      <el-form-item label="上传图片" prop="pictures">
        <FileUp
          ref="pictures"
          v-model="form.pictures"
          upload-type="image"
          domain-id="0"
          dir="component"
          @input="validateField('pictures')"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">立即创建</el-button>
        <el-button>取消</el-button>
        <el-button @click="onTest">测试</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getChooseUserDataByParams, getSearchListByValue } from '@/api/index'
export default {
  name: 'app',
  data () {
    return {
      form : {
        users: [],
        pictures: '13051d29943248b19d232bcfd727bc9c'
      },
      rules: {
        users: [
          { type: 'array', required: true, message: '请选择人员' }
        ],
        pictures: [
          { required: true, message: '请上传图片' }
        ]
      },
      roles: ['orgUser']
    }
  },
  methods: {
    getUser: getChooseUserDataByParams,
    getSearchList: getSearchListByValue,
    validateField (type) {
      this.$refs.form.validateField(type)
    },
    onSubmit () {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (!this.$refs.pictures.validateFinished()) {
            this.$message.warning('正在上传，请稍后再提交！')
            return
          }
          this.$message.success('submit!')
        }
      })
    },
    onTest () {
      this.form.pictures = '13051d29943248b19d232bcfd727bc9c'
      this.$refs.form.validateField('pictures')
    }
  }
}
</script>

