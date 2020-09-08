# ushio-session

网页前端的便捷云存储方案。    

[English Version](./README.md)

## 定位
ushio-session是js-session的前身，如今内置于[iotcat/ushio-js](https://github.com/iotcat/ushio-js)。在使用[iotcat/fp](https://github.com/iotcat/fp)定位设备的基础上，前端用户可以像使用cookie一样使用session。session不依赖与cookie，使用服务端存储。因为这个特性，**session可以解决cookie所难以解决的跨域问题**。


## 指令
 + `session.get(key)`: 根据键名获取
 + `session.set(key, value)`: 用键名和键值新建或更新一条session
 + `session.del(key)`: 根据键名删除session
 
 
## 应用
ushio-session如今已被广泛应用在ushio网站系统中。你在Ushio所支持网站的许多服务背后均有ushio-session的支持。比如：

 - 跨域跨设备音乐继续播放
 - 用户管理识别
 - 语言偏好记录
 - 视频播放位置跨设备记录
 - 用户识别码管理
 - 等等..
 
