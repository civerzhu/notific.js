# notific.js #

一个HTML5桌面通知的工具类。主要是封装了HTML5原生的notification接口，同时加入了一些适用的小功能。

## 使用方法 ##

```javascript
notific.show({text: "test"}, {onclick: function(){
    console.log("Notification Click!");
}});
```

注意：目前需要先在页面引用jQuery。第一次运行，浏览器会弹出提示条询问用户的许可，只有点了允许才会弹出桌面提示；

详细配置如下：

```javascript
notific.show(data, settings);
```

其中data是一些内容的设置，settings主要是其他的配置和行为。
data里的内容可以是：

* `title`   [string]   显示的标题
* `text`    [string]   主要的文字内容
* `icon`    [string]   图标的icon地址

settings里的内容可以是：

* `dir`     [string]   内容的排列方向(auto||ltr||rtl)分别表示自动、从左到右、从右到左，默认为auto
* `timeout` [integer]  显示的时间长度，单位毫秒，如果为0则会一直显示直至用户关闭，默认为5000
* `isCover` [boolean]  是否要覆盖之前的消息，默认为要覆盖true
* `onshow`  [fuction]  显示时回调 onshow(data, evt)
* `onclick` [fuction]  点击时回调 onclick(data, evt)
* `onclose` [fuction]  关闭时回调 onclose(data, evt)

详细可以看源码中的demo.html。

## 其他API ##

notific.js同样也提供了其他用于管理HTML5桌面通知的api

* `notific.isSupported()` 检查浏览器是否支持HTML5桌面通知，返回true或false
* `notific.checkPermission()` 检测HTML5桌面通知是否得到了用户的许可，返回true或false
* `notific.requestPermission(_grantedCallback, _deniedCallback)` 向用户请求获得通知的权限

## 浏览器兼容性 ##

目前包括支持HTML5 Notification的浏览器：chrome22+ | firefox21+ | safari6.0+(Mac OSX 10.8+)
对于较早版本的chrome和firefox，使用的是webikitNotification和mozNotification，因为市场份额很少，所有不做支持。

## 改进 ##

这个工具类还不算很完善，未来可能优化的方向：

1. 去掉对jQuery库的依赖；
2. 对于不支持的浏览器进行优雅降级；
3. 支持只在当前窗口不可见的时候才弹出通知；
