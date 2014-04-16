/**
 * HTML5桌面通知
 * 支持浏览器：chrome22+  firefox21+  safari6.0+(Mac OSX 10.8+)
 * @version 1.0.1
 * @author civerzhu
 * @public
 * 使用方法：
 * notific.show({text: "test"}, {onclick: function(){}});
 *
 * @modifyed 2014/03/21 取消对webikitNotification和mozNotification的支持
 *
 * @todo 未来要去掉对jQuery的依赖
 */

(function(global, undefined) {
    'use strict';

    // 默认数据
    var pDefaultData = {
        text: "",
        title: "",
        icon: ""
    };

    // 默认的其他配置
    var pDefaultSettings = {
        dir: "auto",
        timeout: 5000, // 5秒
        isCover: true, // 默认是覆盖的
        ignoreInFocus: false, // 当前窗口显示时，是否要显示通知，默认为false要显示@info 该参数暂时不用
        onshow: function(_data, _evt) {},
        onclick: function(_data, _evt) {},
        onclose: function(_data, _evt) {}
    };

    var MsgIdCount = 0; // 用于标记不同的消息

    // 用于控制台输出
    var $Profiler = {
        info: function() {
            if(global.console) {
                global.console.info.apply(global.console, arguments);
            }else{
                global.alert(arguments[0] || null);
            }
        }
    };

    var Notific = {
        /**
         * 初始化
         * @return {void}
         */
        init: function() {
            var that = this;
            // 类初始化的时候只执行一次
            that.useable = that._checkSupported(); // 检查这个功能是否得到浏览器支持
            that.isWindowFocus = true; // 判断当前窗口是否在显示状态
            that.initOthers();
        },
        /**
         * 创建HTML5 Web Notifications对象
         * @return {void}
         */
        create: function(_data, _settings) {
            var that = this;
            if (!that.isSupported()) {
                return null;
            }

            if (!that.checkPermission()) {
                // 如果没有获得授权，就发起一次授权请求
                that.requestPermission(function() {
                    // 授权成功后的回调, 创建Notification对象
                    that._createNotificationObj(_data, _settings);
                }, function() {
                    $Profiler.info("创建Notification对象失败，用户未授权");
                });

            } else {
                // 创建Notification对象（创建之后就会显示）
                that._createNotificationObj(_data, _settings);
            }
        },
        /**
         * 创建Notification对象，具体操作
         * @param  {Object} _data     内容
         * @param  {Object} _settings 设置
         * @return {void}
         */
        _createNotificationObj: function(_data, _settings) {
            var that = this;
            var count = 0;
            // 当tag相同时，后面的消息会覆盖前面的消息
            if (_settings.isCover) {
                // 覆盖
                count = MsgIdCount;
            } else {
                // 不覆盖
                count = ++MsgIdCount;
            }

            
            // 创建Notification对象
            var notification = new Notification(_data.title, {
                dir: _settings.dir,
                body: _data.text,
                icon: _data.icon,
                tag: count.toString()
            });

            // 绑定事件
            that.bindEvents(notification, _data, _settings);

            that.notification = notification; // 传递对象
        },
        /**
         * 显示一次桌面通知
         * @param  {Object} _data     内容
         *                        {String} text 文字内容
         *                        {String} title 标题内容
         *                        {String} icon 图标的url地址
         * @param  {Object} _settings 其他配置
         *                        {String}   dir 内容排列的方向，可取值为“auto”(自动), “ltr”(left to right), “rtl”(right to left)
         *                        {Integer}  timeout 显示的时间，默认为5000ms，如果为0则会一直显示直至用户关闭
         *                        {Boolean}  isCover 是否要覆盖之前的消息，默认为要覆盖true
         *                        {Function} onshow 在显示时操作 onshow(data, evt)
         *                        {Function} onclick 点击时操作 onclick(data, evt)
         *                        {Function} onclose 关闭时操作 onclose(data, evt)
         */
        show: function(_data, _settings) {
            var that = this;
            var data = $.extend({}, pDefaultData, _data);
            var settings = $.extend({}, pDefaultSettings, _settings);

            if (!that.isSupported()) {
                // 浏览器不支持HTML5 Web Notifications
                $Profiler.info("浏览器不支持HTML5 Web Notifications");
                return;
            }

            // 如果设置了忽略当前显示窗口的弹窗，并且当前窗口正在显示，则不提示消息
            // if(settings.ignoreInFocus && that.isWindowFocus){
            //  $Profiler.info("当前窗口正在显示，忽略消息提示");
            //  return;
            // }

            // 创建Notification对象并显示
            that.create(data, settings);
        },
        /**
         * 绑定事件
         * @param  {Object} msgObj   HTML5 Web Notifications对象
         * @param  {Object} data     数据
         * @param  {Object} settings 其他配置
         * @return {void}
         */
        bindEvents: function(msgObj, data, settings) {
            var that = this;
            // onshow 事件
            msgObj.addEventListener('show', function(evt) {
                settings.onshow(data, evt);

                if(settings.timeout !== 0){
                    // 如果timeout为0，则一直显示直至用户关闭
                    setTimeout(function() {
                        // 定时关闭消息
                        msgObj.close();
                    }, settings.timeout);
                }
            });

            // onclick 事件
            msgObj.addEventListener('click', function(evt) {
                settings.onclick(data, evt);
            });

            // onclose 事件
            msgObj.addEventListener('close', function(evt) {
                settings.onclose(data, evt);
                // 关闭后解绑函数并注销对象
                that.unbindEvents();
                that.notification = null; // 注销对象
            });
        },
        /**
         * 其他的初始化内容
         * @return {[type]} [description]
         */
        initOthers: function() {
            var that = this;

            // 绑定focus事件，更新isWindowFocus状态
            // that.windowFocusHandle = function(){
            //     that.isWindowFocus = true;
            // };
            // $(window).bind('focus', that.windowFocusHandle);

            // that.windowBlurHandle = function(){
            //     that.isWindowFocus = false;
            // };
            // $(window).bind('blur', that.windowBlurHandle);
        },
        /**
         * 检查浏览器是否支持HTML5的Web Notifications
         * @return {Boolean}
         */
        _checkSupported: function() {
            var that = this;
            // 目前HTML5的Web Notifications的浏览器支持情况如下（截至2014/03/01，数据来源：http://caniuse.com/）：
            // chrome > 21 (ps: chrome在5.0到21的版本需要加上webkit的前缀)
            // firefox > 21
            // safari >= 6.0
            // ie & opera 呵呵
            return !!("Notification" in global);
        },
        /**
         * 向用户请求获得通知的权限
         * @param {Function} _grantedCallback 用户同意后的回调
         * @param {Function} _deniedCallback  用户拒绝后的回调
         * @return {void}
         */
        requestPermission: function(_grantedCallback, _deniedCallback) {
            var that = this;
            
            if (that.isSupported()) {
                // 向用户请求获得通知的权限
                global.Notification.requestPermission(function(perm) {
                    switch(perm) {
                        case 'granted':
                            if (_grantedCallback && typeof _grantedCallback === 'function') {
                                _grantedCallback();
                            }
                            break;
                        case 'denied':
                            if (_grantedCallback && typeof _deniedCallback === 'function') {
                                _deniedCallback();
                            }
                            break;
                    }
                });
            }
            // 结果是浏览器会弹出一个提示条，询问用户是否要允许这个网址向他发送通知
        },
        /**
         * 检查桌面通知是否获得了用户的许可
         * @return {Boolean}
         */
        checkPermission: function() {
            var that = this;

            var status = 1;
            if (that.isSupported()) {
                // firefox 直接使用premission对象
                status = global.Notification.permission;
            }
            // “granted”（旧版chrome状态值：0）表示用户同意消息提醒
            // “default”（旧版chrome状态值：1）表示默认状态，用户既未拒绝，也未同意
            // “denied”（旧版chrome状态值：2）表示用户拒绝消息提醒
            if (status === 0 || status === "granted") {
                return true;
            } else {
                return false;
            }
        },
        /**
         * HTML5的Web Notifications 是否在该浏览器可用
         * @return {Boolean}
         */
        isSupported: function() {
            var that = this;
            return that.useable;
        },
        /**
         * 检查桌面通知是否开启
         * @return {Boolean}
         */
        isNotificationOn: function() {
            var that = this;
            return that.isSupported() && that.checkPermission();
        },

        /**
         * 解绑事件，回收内存
         * @return {void}
         */
        unbindEvents: function() {
            var that = this;
            if (that.notification) {
                // 移除事件
                that.notification.removeEventListener("show", that, false);
                that.notification.removeEventListener("click", that, false);
                that.notification.removeEventListener("close", that, false);

                // 注销对象
                that.notification = null;
            }
        },
        /**
         * 销毁，内存回收
         * @return {void}
         */
        destroy: function() {
            var that = this;

            // 解绑事件
            // $(window).unbind('focus', that.windowFocusHandle);

            // $(window).unbind('blur', that.windowBlurHandle);
        }
    };

    // 简单的class包装器
    // @copy from JY.base.js
    var Clazz = function(_proto) {
        var clazz = function() {
            if (this.init) {
                return this.init.apply(this, arguments);
            }
        };
        // 获取单例的方法
        clazz.getInstance = function(_config) {
            if (!this.instance) {
                this.instance = new this(_config);
            }
            return this.instance;
        };
        // 扩展prototype
        clazz.prototype = _proto || {};

        return clazz;
    };

    // 单例模式，暴露给global对象
    var notific = global.notific = Clazz(Notific).getInstance();

})(this);