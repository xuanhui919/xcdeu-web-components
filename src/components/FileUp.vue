<template>
  <section class="xc-file-up">
    <el-upload
      v-if="!readonly"
      class="upload-demo"
      action=""
      :accept="fileAccept"
      :multiple="isMutiple"
      :show-file-list="isShowList"
      :disabled="isDisabled"
      :before-upload="beforeUpload"
      :http-request="fileUpLoad"
      :on-change="fileChange"
    >
      <el-button type="primary" size="small">上传<i class="el-icon-upload el-icon--right" /></el-button>
    </el-upload>
    <em v-if="!readonly" class="size-small">{{ tip }}</em>
    <div class="file-container el-row">
      <template v-if="uploadType === 'file'">
        <div v-for="(file, index) in fileList" :key="file.id" class="file-item">
          <img :src="publicPath + 'public/file/unknown.png'">
          <div class="file-info">
            <p>
              <span :title="file.displayName">{{ file.displayName }}</span>
              <strong>{{ getFileSize(file.fileSize) }}</strong>
            </p>
            <p v-if="file.status !== 'ready'">
              <a href="javascript:void(0)" class="color" @click="download(file)">下载</a>
              <a :href="file.url" class="color">预览</a>
              <a v-if="!readonly" href="javascript:void(0)" class="color" @click="delFile(index)">删除</a>
            </p>
          </div>
          <span v-if="file.progress !== -1" :style="{ width: file.progress + '%' }" class="file-process-bar" />
        </div>
      </template>
      <template v-else>
        <div v-for="(file, index) in fileList" :key="file.id" class="image-item">
          <el-image ref="imageBox" :src="file.url" :preview-src-list="[file.url]" />
          <div class="image-info">
            <div v-if="file.status !== 'ready'">
              <a href="javascript:void(0)" class="color" @click="download(file)">下载</a>
              <a href="javascript:void(0)" class="color" @click="previewImage(index)">预览</a>
              <a v-if="!readonly" href="javascript:void(0)" class="color" @click="delFile(index)">删除</a>
            </div>
          </div>
          <span v-if="file.progress !== -1" :style="{ width: file.progress + '%' }" class="file-process-bar" />
        </div>
      </template>
    </div>
  </section>
</template>
<script>
import { uploadResource, loadDetailBatchByIds } from '@/api/index'
import { downloadAttachment } from '@/util/index'
import OSS from 'ali-oss'
import { v4 as uuidv4 } from 'uuid'
let PATH = null
export default {
  name: 'FileUp',
  props: {
    value: {
      type: String,
      default: ''
    },
    uploadType: {
      type: String,
      default: 'file'
    },
    // 是否一次可选择多个文件上传
    mutiple: {
      type: Boolean,
      default: true
    },
    // 上传接受文件的类型
    accept: {
      type: String,
      default: ''
    },
    // 上传指定目录
    dir: {
      type: String,
      default: 'anonymous'
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 允许最大上传个数
    limit: {
      type: Number,
      default: 100
    },
    // 默认不显示
    showList: {
      type: Boolean,
      default: false
    },
    acceptTips: {
      type: String,
      default: ''
    },
    domainId: {
      type: String,
      default: ''
    },
    // 如果附件不可修改 则不显示删除按钮 以及上传附件按钮
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      publicPath: window.XcComponents.path,
      client: null,
      // 文件展示列表
      fileList: [],
      // 当前上传的文件
      isMutiple: '',
      isShowList: '',
      isDisabled: '',
      fileDir: '',
      fileAccept: ''
    }
  },
  computed: {
    tip: function () {
      if (!this.acceptTips && this.uploadType === 'image') {
        return '只能上传图片格式的文件'
      } else {
        return this.acceptTips
      }
    }
  },
  watch: {
    value: {
      immediate: true,
      handler: function (val) {
        if (val) {
          var list = val.split(',')
          var needRefresh = false
          if (list.length !== this.fileList.length) {
            needRefresh = true
          }
          if (!needRefresh) {
            for (var i = 0; i < list.length; i++) {
              var hasFound = false
              for (var j = 0; j < this.fileList.length; j++) {
                if (list[i] === this.fileList[j].id) {
                  hasFound = true
                  break
                }
              }
              if (!hasFound) {
                needRefresh = true
                break
              }
            }
          }
          if (needRefresh) {
            loadDetailBatchByIds({ idList: val }).then(data => {
              for (var i = 0; i < data.length; i++) {
                data[i].status = 'success'
                data[i].progress = -1
              }
              this.fileList = data
            })
          }
        } else {
          if (this.fileList.length) {
            this.fileList = []
          }
        }
      }
    }
  },
  mounted: function () {
    this.isMutiple = this.mutiple
    this.isShowList = this.showList
    this.isDisabled = this.disabled
    this.fileDir = this.dir

    this.fileAccept = (!this.accept && this.uploadType === 'image') ? 'image/*' : this.accept
  },
  beforeDestroy () {
    this.fileList.forEach(file => {
      if (file.url && file.url.indexOf('blob:') === 0) {
        URL.revokeObjectURL(file.url)
      }
    })
  },
  methods: {
    getClient () {
      if (!this.client) {
        this.client = new OSS({
          region: 'oss-cn-shenzhen',
          accessKeyId: 'LTAI4G2nbEWcDi9djnDY8tvJ',
          accessKeySecret: 'ZZN02tVv7BpJEhc5bWa2NlNIdL6Vvp',
          bucket: 'gtyzfile'
        })
      }
      return this.client
    },
    delFile (index) {
      this.$confirm('是否确认删除该' + (this.uploadType === 'image' ? '图片？' : '附件？'), '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.fileList.splice(index, 1)
        var value = []
        for (var i = 0; i < this.fileList.length; i++) {
          value.push(this.fileList[i].id)
        }
        this.$emit('input', value.join(','))
      })
    },
    fileChange (file, fileList) {
      // 获取文件流
    },
    // 文件添加
    beforeUpload (file) {
      if (file.name.indexOf('.') === -1) {
        this.$message.error('禁止上传无格式的文件！')
        return false
      }
    },
    // 附件上传
    fileUpLoad (http) {
      if (!PATH) {
        PATH = this.domainId + '/' + (this.dir || 'anonymous') + '/'
      }
      const id = uuidv4().replace(/-/g, '')
      const rawFile = http.file
      const file = {
        displayName: rawFile.name,
        fileSize: rawFile.size,
        id: id,
        url: URL.createObjectURL(rawFile),
        status: 'ready',
        progress: 0
      }
      this.fileList.push(file)
      const fileName = id + rawFile.name.substring(rawFile.name.lastIndexOf('.'))
      this.getClient().multipartUpload(PATH + fileName, rawFile, {
        progress: p => {
          file.progress = p * 100
        }
      }).then(res => {
        this.uploadOnSuccess(res, file)
      }).catch(err => {
        window.console.log(err)
      })
    },
    uploadOnSuccess (res, file) {
      uploadResource({
        displayName: file.displayName,
        fileSize: file.fileSize,
        id: file.id,
        relativePath: PATH,
        storageLocation: 'ALIYUN'
      }).then(res2 => {
        file.status = 'success'
        file.progress = -1
        this.$emit('input', this.value ? this.value + ',' + file.id : file.id)
      })
    },
    getFileSize (size) {
      if (size / 1024 < 1) {
        return '1KB'
      } else if (size / 1024 / 1024 < 1) {
        return (size / 1024).toFixed(1) + 'KB'
      } else if (size / 1024 / 1024 / 1024 < 1) {
        return (size / 1024 / 1024).toFixed(1) + 'MB'
      } else {
        return '>1GB'
      }
    },
    getFileTypeImg (type) {
      if (type.indexOf('image') !== -1) {
        return 'images.png'
      } else if (type === 'text/plain') {
        return 'txt.png'
      } else if (type.indexOf('video') !== -1) {
        return 'video.png'
      } else if (type.indexOf('audio') !== -1) {
        return 'audio.png'
      } else if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || type === 'application/msword') {
        return 'word.png'
      } else if (type === 'application/x-zip-compressed') {
        return 'zip.png'
      } else if (type === 'application/pdf') {
        return 'pdf.png'
      } else if (type === 'application/x-rar-compressed') {
        return 'rar.png'
      } else if (type === 'application/x-xls' || type === 'application/vnd.ms-excel' || type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        return 'excel.png'
      } else if (type === 'application/x-ppt' || type === 'application/vnd.ms-powerpoint' || type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        return 'ppt.png'
      }
    },
    previewImage (index) {
      this.$refs.imageBox[index].clickHandler()
    },
    download (file) {
      if (file.url.indexOf('blob:') === 0) {
        downloadAttachment(file.url, file.displayName)
      } else {
        const result = this.getClient().signatureUrl(file.url.replace(/.*\.com\//, ''), {
          response: {
            'content-disposition': 'attachment; filename="' + file.displayName + '"'
          }
        })
        window.location = result
      }
    },
    // 是否还有未完成的上传（提供外部使用）
    validateFinished () {
      for (var i = 0; i < this.fileList.length; i++) {
        if (this.fileList[i].progress !== -1) {
          return false
        }
      }
      return true
    }
  }
}
</script>
<style lang="scss" scoped>
  .xc-file-up {
    line-height: 23px;
    .file-container {
      .file-item {
        padding: 8px;
        img {
          width: 46px;
          height: 46px;
          margin-right: 8px;
        }
        .file-info {
          width: 280px;
        }
      }
      .image-item {
        position: relative;
        float: left;
        width: 94px;
        height: 94px;
        border: 1px solid #eee;
        margin: 10px 110px 10px 0;
        ::v-deep .el-image {
          width: 100%;
          height: 100%;
        }
        .image-info {
          position: absolute;
          left: 103px;
          bottom: 0;
          white-space: nowrap;
        }
        .file-process-bar {
          bottom: -3px;
        }
      }
    }
  }
</style>
