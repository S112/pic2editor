<template>
<div class="pic2editor">
  <div class="header">
    <div class="icon-wrap">
      <div class="icon">
        <i class="iconfont iconpicture__easy"></i>
        <input type="file" accept="image/*" @change="selectPic($event)" />
      </div>
      <div class="icon" @click.stop="undoBtnClick" :class="{disabled: undoDisabled}"><i class="iconfont iconbiaoge-chehui"></i></div>
      <div class="icon" @click.stop="redoBtnClick" :class="{disabled: redoDisabled}"><i class="iconfont iconbiaoge-zhongzhi"></i></div>
      <div class="icon" @click.stop="removeBtnClick"><i class="iconfont iconbiaoge-shanchu"></i></div>
      <div class="icon" @click.stop="editPicFinish" :class="{disabled: !picName}"><i class="iconfont iconbiaoge-qiyong"></i></div>
      <div class="icon" @click.stop="downloadPic" :class="{disabled: !picName}"><i class="iconfont iconbiaoge-xiazai"></i></div>
    </div>
  </div>
  <!-- Image editor area -->
  <div class="editor-wrap"></div>
  <!-- Image editor controls - bottom area -->
  <div class="controls-wrap">
    <ul class="scrollable">
      <li class="menu-item" v-for="(atom, key) in config" :key="`config_${key}`">
        <button class="menu-button" @click="menuBtnClick(key)">{{key}}</button>
        <template v-if="key === '裁剪'">
          <div v-show="showCrop" class="submenu">
            <div class="btn-prev" @click="prevBtnClick(key)"><i class="iconfont iconshangyibu"></i></div>
            <ul class="scrollable">
              <li class="menu-item">
                <button class="submenu-button" @click="doCrop">应用</button>
              </li>
            </ul>
          </div>
        </template>
        <template v-if="key === '方向'">
          <div v-show="showOrientation" class="submenu">
            <div class="btn-prev" @click="prevBtnClick(key)"><i class="iconfont iconshangyibu"></i></div>
            <ul class="scrollable">
              <li class="menu-item" v-for="(type, idx) in atom._1stType" :key="`atom_${type}`">
                <button class="submenu-button" @click="doOrientation(type)">{{type}}</button>
              </li>
            </ul>
          </div>
        </template>
        <template v-if="key === '图形'">
          <div v-show="showShape" class="submenu">
            <div class="btn-prev" @click="prevBtnClick(key)"><i class="iconfont iconshangyibu"></i></div>
            <ul class="scrollable">
              <li class="menu-item" v-for="(type, idx) in atom._1stType" :key="`atom_${type}`">
                <button class="submenu-button" @click="doShape(type)">{{type}}</button>
              </li>
            </ul>
          </div>
        </template>
        <template v-if="key === '绘画'">
          <div v-show="showDraw" class="submenu">
            <div class="btn-prev" @click="prevBtnClick(key)"><i class="iconfont iconshangyibu"></i></div>
            <ul class="scrollable">
              <li class="menu-item" v-for="(type, idx) in atom._1stType" :key="`atom_${type}`">
                <button class="submenu-button" @click="doDraw(type)">{{type}}</button>
              </li>
            </ul>
          </div>
        </template>
        <template v-if="key === '文字'">
          <div v-show="showText" class="submenu">
            <div class="btn-prev" @click="prevBtnClick(key)"><i class="iconfont iconshangyibu"></i></div>
            <ul class="scrollable">
              <li class="menu-item" v-for="(type, idx) in atom._1stType" :key="`atom_${type}`">
                <button class="submenu-button" @click="doText(type)">{{type}}</button>
                <div v-if="type === '大小'" v-show="showTextSize" class="textSize-box">
                  <input ref="textSize" type="range" min="80" max="240" step="10" value="120" @change="doTextSize($event)" />
                </div>
                <div v-if="type === '样式'" v-show="showTextStyle" class="textStyle-box">
                  <button class="hiddenmenu-button" v-for="style in atom._2ndType" :key="`style_${style}`" @click="doTextStyle(style)">{{style}}</button>
                </div>
              </li>
            </ul>
          </div>
        </template>
      </li>
    </ul>
  </div>
</div>
</template>

<script>
// 配置图片编辑功能
import defConfig from './config.js'
import { base64ToBlob } from '../../../assets/js/tool.js'
const supportFileAPI = !!(window.File && window.FileList && window.FileReader)
const Red = 'rgba(255,0,0,0.5)' // 红色
const LineWidth = 5

export default {
  name: 'pic2editor',
  props: {
    picPath: {
      type: String,
      default: ''
    },
    checkPic: {
      type: Function,
      default: () => () => {}
    },
    config: {
      type: Object,
      default: () => defConfig
    }
  },
  mounted () {
    const self = this
    const scriptArr = document.body.querySelectorAll('script')
    const some = [].some.call(scriptArr, (v => v.getAttribute('mark') === 'pic2editor'))
    if (some) {
      this.init()
    } else {
      readJsFiles().then(rsp => {
        let allDone = rsp.every(v => v === 'done')
        if (allDone) {
          this.init()
        }
      })
    }

    async function readJsFiles() {
      const promise5 = self.readJsAsync('static/js/fileSaver.min.js')
      const p1 = await self.readJsAsync('static/js/fabric-v4.2.0.min.js')
      const promise2 = self.readJsAsync('static/js/tui-code-snippet.min.js')
      const promise3 = self.readJsAsync('static/js/tui-color-picker.min.js')
      const p2 = await promise2
      const p3 = await promise3
      const p4 = await self.readJsAsync('static/js/tui-image-editor.min.js')
      const p5 = await promise5
      return [p1, p2, p3, p4, p5]
    }
  },
  computed: {
    plus () {
      return 1 // window.devicePixelRatio
    }
  },
  data () {
    return {
      showCrop: false, // 裁剪
      showOrientation: false, // 方向
      showShape: false, // 图形
      showDraw: false, // 绘画
      showText: false, // 文字
      showTextSize: false, // 文字大小
      showTextStyle: false, // 文字样式

      undoDisabled: true,
      redoDisabled: true,

      activeObjectId: null,
      imageEditor: null,
      picName: null
    }
  },
  methods: {
    init () {
      // Create image editor
      this.imageEditor = new tui.ImageEditor('.editor-wrap', {
        cssMaxWidth: document.documentElement.clientWidth,
        cssMaxHeight: document.documentElement.clientHeight,
        usageStatistics: false,
        selectionStyle: {
          cornerStyle: 'circle',
          cornerSize: 30*this.plus,
          cornerColor: Red,
          transparentCorners: true
        }
      })

      // Bind custom event of image editor
      this.imageEditor.on({
        undoStackChanged: len => {
          this.undoDisabled = !len
        },
        redoStackChanged: len => {
          this.redoDisabled = !len
        },
        objectActivated: obj => {
          this.activeObjectId = obj.id
          if (obj.type === 'rect' || obj.type === 'circle') {
            this.imageEditor.stopDrawingMode()
          }
        },
        objectScaled: obj => {
          if (obj.type === 'text') {
            this.$refs['textSize'].style.value = obj.fontSize
          }
        }
      })

      if (this.picPath) {
        this.imageEditor.loadImageFromURL(this.picPath, 'demo.png').then(result => {
          this.picName = 'demo.png'
          this.imageEditor.clearUndoStack()
        })
      }
    },
    readJsAsync (path) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.mark = 'pic2editor'
        script.onload = () => {
          resolve('done')
        }
        script.onerror = () => {
          reject()
        }
        script.src= path
        document.body.appendChild(script)
      })
    },
    undoBtnClick () {
      if (!this.undoDisabled) {
        this.imageEditor.undo()
      }
    },
    redoBtnClick () {
      if (!this.redoDisabled) {
        this.imageEditor.redo()
      }
    },
    removeBtnClick () {
      this.imageEditor.removeObject(this.activeObjectId)
    },
    menuBtnClick (key) {
      const imageName = this.imageEditor.getImageName()
      if (!imageName) {
        return
      }

      if (key === '裁剪') {
        this.showCrop = true
        this.imageEditor.startDrawingMode('CROPPER')
      } else if (key === '方向') {
        this.showOrientation = true
      } else if (key === '图形') {
        this.showShape = true
      } else if (key === '绘画') {
        this.showDraw = true
      } else if (key === '文字') {
        this.showText = true
        let initText = '标记'
        let val = this.$refs['textSize'][0].value
        this.imageEditor.startDrawingMode('TEXT')
        this.imageEditor.addText(initText, {
          styles: {
            fontSize: 120,
            fill: Red
          }
        })
      }
    },
    prevBtnClick (key) {
      if (key === '裁剪') {
        this.showCrop = false
      } else if (key === '方向') {
        this.showOrientation = false
      } else if (key === '图形') {
        this.showShape = false
      } else if (key === '绘画') {
        this.showDraw = false
      } else if (key === '文字') {
        this.showText = false
        this.showTextSize = false
        this.showTextStyle = false
      }

      this.imageEditor.stopDrawingMode()
    },
    doCrop () { // 处理裁剪
      this.imageEditor.crop(this.imageEditor.getCropzoneRect()).then(() => {
        this.imageEditor.stopDrawingMode()
        this.showCrop = false
      });
    },
    doOrientation (type) { // 处理方向
      if (type === '旋转+90') {
        this.imageEditor.rotate(90)
      } else if (type === '旋转-90') {
        this.imageEditor.rotate(-90)
      } else if (type === '水平颠倒') {
        this.imageEditor.flipX()
      } else if (type === '垂直颠倒') {
        this.imageEditor.flipY()
      }
    },
    doShape (type) { // 处理图形
      if (type === '长方形') {
        this.imageEditor.addShape(
          'rect',
          tui.util.extend({width: 400*this.plus, height: 400*this.plus, isRegular: false}, {
            fill: 'rgba(0,0,0,0)', // 透明
            stroke: Red,
            strokeWidth: LineWidth*this.plus
          })
        )
      } else if (type === '圆形') {
        this.imageEditor.addShape(
          'circle',
          tui.util.extend({rx: 200*this.plus, ry: 200*this.plus, isRegular: true}, {
            fill: 'rgba(0,0,0,0)', // 透明
            stroke: Red,
            strokeWidth: LineWidth*this.plus
          })
        )
      }
    },
    doDraw (type) { // 处理绘画
      const setting = {
        width: LineWidth*this.plus,
        color: Red
      }
      this.imageEditor.stopDrawingMode()

      if (type === '直线') {
        this.imageEditor.startDrawingMode('LINE_DRAWING', setting)
      } else if (type === '箭头') {
        setting.arrowType = {
          tail: 'chevron'
        }
        this.imageEditor.startDrawingMode('LINE_DRAWING', setting)
      }
    },
    doText (type) { // 处理文字
      if (type === '大小') {
        this.showTextSize = true
        this.showTextStyle = false
      } else if (type === '样式') {
        this.showTextSize = false
        this.showTextStyle = true
      }
    },
    doTextSize (event) {
      this.imageEditor.changeTextStyle(this.activeObjectId, {
        fontSize: parseInt(event.target.value || 100, 10)
      })
    },
    doTextStyle (style) {
      let obj = {}
      if (style === '加粗') {
        obj['fontWeight'] = 'bold'
      } else if (style === '斜体') {
        obj['fontStyle'] = 'italic'
      } else if (style === '下划线') {
        obj['underline'] = 'underline'
      }
      this.imageEditor.changeTextStyle(this.activeObjectId, obj)
    },
    selectPic (event) {
      let file, img, resolution;

      file = event.target.files[0]

      if (file) {
        img = new Image()
        img.onload = () => {
          if (this.checkPic(file, img)) {
            this.imageEditor.loadImageFromFile(file, file.name).then((result) => {
              this.picName = file.name
              this.imageEditor.clearUndoStack()
            })
          }

          URL.revokeObjectURL(file)
        }

        img.src = URL.createObjectURL(file)
      }
    },
    downloadPic () {
      let picName = this.picName
      let dataURL = this.imageEditor.toDataURL()
      let blob, type, w;

      if (!this.picName) {
        return
      }
      if (supportFileAPI) {
        blob = base64ToBlob(dataURL)
        type = blob.type.split('/')[1]
        if (picName.split('.').pop() !== type) {
          picName += '.' + type
        }

        saveAs(blob, picName) // FileSaver - saveAs
      } else {
        w = window.open()
        w.document.body.innerHTML = '<img src=' + dataURL + '>'
      }
    },
    editPicFinish () {
      if (!this.picName) {
        return
      }
      this.$emit('edit-pic-finish', this.imageEditor)
    }
  }
}
</script>

<style lang="stylus">
.pic2editor {
  .tui-image-editor-canvas-container {
    margin: 0 auto;
    top: 50%;
    transform: translateY(-50%);
    overflow: hidden;
  }
}
</style>

<style lang="stylus" scoped>
@import '../../../static/iconfont/iconfont.css';
@import '../../../assets/stylus/func.styl';
@import "./editor.styl";
</style>
