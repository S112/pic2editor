<template>
  <Editor :config="config" :picPath="demoPng" :checkPic="checkPic" @edit-pic-finish="editPicFinish" />
</template>

<script>
import demoPng from 'static/img/demo.png'
import Editor from 'components/editor/editor.vue'
import ajaxUpload from 'assets/js/ajax.js'
import { processFiles, base64ToFile } from 'assets/js/tool.js'
const URL = 'https://jsonplaceholder.typicode.com/photos'
const MAX_RESOLUTION = 3264 * 2448 // Pixel
const MAX_SIZE = 2 * 1024 * 1024 // 2MB
const supportFileAPI = !!(window.File && window.FileList && window.FileReader)

export default {
  name: 'demo',
  data () {
    return {
      demoPng,
      config: {
        '裁剪': {
          _1stType: ['应用']
        },
        '图形': {
          _1stType: ['长方形', '圆形']
        },
        '绘画': {
          _1stType: ['直线', '箭头']
        },
        '文字': {
          _1stType: ['大小', '样式'],
          _2ndType: ['加粗', '斜体', '下划线']
        }
      }
    }
  },
  methods: {
    checkPic (file, pic) {
      let valid = true

      if (!supportFileAPI) {
        valid = false
        alert('当前的浏览器不支持File API')
      } else if (file.size > MAX_SIZE) {
        valid = false
        alert(`图片大小不能超过2M`)
      } else if (pic.width * pic.height > MAX_RESOLUTION) {
        valid = false
        alert(`加载的图像分辨率太大\n推荐分辨率为3264 * 2448`)
      }

      return valid
    },
    editPicFinish (picObj) {
      const base64 = picObj.toDataURL()
      const picName = picObj.getImageName()
      let pic = base64ToFile(base64, picName)
      let picArr = Array.from({ length:1 }, () => pic)

      const options = { target:URL }

      processFiles(picArr, item => {
        pic = item
      }, () => {
        this.$nextTick(() => {
          ajaxUpload(pic, options, file => {
            if (file.status === 'success') {
              console.log('上传成功')
            } else {
              console.log('上传失败')
            }
          })
        })
      })
    }
  },
  components: {
    Editor
  }
}
</script>
