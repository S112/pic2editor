# vue 图片编辑器功能

## 功能
- 裁剪：✅
- 下载：✅
- 上传：✅
- 图形：长方形、圆形
- 绘画：直线、箭头
- 文字：大小、样式（加粗、斜体、下划线）
- 方向：旋转+90、旋转-90、水平颠倒、垂直颠倒

## 安装
`npm install pic2editor` or `yarn add pic2editor`

## 引用
`import pic2editor from 'pic2editor'`

## 属性
|字段名|描述|值类型|默认值|
|-|-|-|-|
|config|编辑功能的配置|Object|请参照config.js|
|picPath|初始的默认图片的路径|String|空字符串|
|checkPic|对选完后的图片做校验，判断是否加载该图片，参数（File对象和Image对象）|Function|空函数|

## 事件
|字段名|描述|回调参数
|-|-|-|
|edit-pic-finish|图片编辑完成后，回调|imageEditor对象

## 使用范例
通过 `npm run dev` 查看使用范例

## 参考
感谢 [tui.image-editor](https://github.com/nhn/tui.image-editor "tui.image-editor")

## 样式
![](https://github.com/S112/pic2editor/blob/master/static/img/demo.png)
