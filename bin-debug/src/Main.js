var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var __egretProto__ = Main.prototype;
    __egretProto__.onAddToStage = function (event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/resource.json", "resource/");
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    __egretProto__.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    __egretProto__.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            this.createGameScene();
        }
    };
    /**
     * 创建游戏场景
     * Create a game scene
     */
    __egretProto__.createGameScene = function () {
        this.creatSocket();
    };
    __egretProto__.creatSocket = function () {
        this.socket = new egret.WebSocket();
        //设置数据格式为二进制，默认为字符串
        this.socket.type = egret.WebSocket.TYPE_BINARY;
        //添加收到数据侦听，收到数据会调用此方法
        this.socket.addEventListener(egret.ProgressEvent.SOCKET_DATA, this.onReceiveMessage, this);
        //添加链接打开侦听，连接成功会调用此方法
        this.socket.addEventListener(egret.Event.CONNECT, this.onSocketOpen, this);
        //添加链接关闭侦听，手动关闭或者服务器关闭连接会调用此方法
        this.socket.addEventListener(egret.Event.CLOSE, this.onSocketClose, this);
        //添加异常侦听，出现异常会调用此方法
        this.socket.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onSocketError, this);
        //连接服务器
        this.socket.connect("echo.websocket.org", 80);
    };
    __egretProto__.sendData = function () {
        var proto = RES.getRes("common_proto"); //加载PB数据结果定义字符
        var builder = dcodeIO.ProtoBuf.loadProto(proto); //解析PB数据定义文件，生成PB对象构造器 (loadProtoFile用这个可以代替RES的功能，自己选）
        var clazz = builder.build("Common"); //构建一个PB数据结构（messageName为PB中定义的结果名）
        var data = new clazz();
        //创建一个数据结构
        //data.set("id",1);//可以使用data.id=1;
        data.id = 1; //赋值
        data.set("text", "oops"); //可以使用data.text=oops; 
        console.log("id=" + data.get("id"));
        console.log("oops=" + data.get("text"));
        var arraybuffer = data.toArrayBuffer();
        var len = arraybuffer.byteLength;
        var btyearray = new egret.ByteArray(arraybuffer);
        if (len > 0) {
            this.socket.writeBytes(btyearray);
            this.socket.flush();
        }
    };
    __egretProto__.onSocketOpen = function () {
        this.trace("WebSocketOpen");
        this.sendData();
    };
    __egretProto__.onSocketClose = function () {
        this.trace("WebSocketClose");
    };
    __egretProto__.onSocketError = function () {
        this.trace("WebSocketError");
    };
    __egretProto__.onReceiveMessage = function (e) {
        var msgBuff;
        var btyearray = new egret.ByteArray();
        this.socket.readBytes(btyearray);
        var len = btyearray.buffer.byteLength;
        var dataView = new DataView(btyearray.buffer);
        var pbView = new DataView(new ArrayBuffer(len));
        for (var i = 0; i < len; i++) {
            pbView.setInt8(i, dataView.getInt8(i));
        }
        msgBuff = pbView.buffer;
        var proto = RES.getRes("common_proto"); //加载PB数据结果定义字符
        var builder = dcodeIO.ProtoBuf.loadProto(proto); //解析PB数据定义文件，生成PB对象构造器 (loadProtoFile用这个可以代替RES的功能，自己选）
        var clazz = builder.build("Common"); //构建一个PB数据结构（messageName为PB中定义的结果名）
        var data = clazz.decode(msgBuff);
        console.log("decodeData id=" + data.get("id"));
        console.log("decodeData oops=" + data.get("text"));
    };
    __egretProto__.trace = function (msg) {
        console.log(msg);
    };
    return Main;
})(egret.DisplayObjectContainer);
Main.prototype.__class__ = "Main";
//# sourceMappingURL=Main.js.map