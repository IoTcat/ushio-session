# ushio-session

Cloud Storage solution for frontend webpage development.   
 
[简体中文（推荐）](./zh.md)

## Positioning
ushio-session is the predecessor of js-session, built in [iotcat/ushio-js](https://github.com/iotcat/ushio-js). On the basis of using [iotcat/fp](https://github.com/iotcat/fp) to locate the device, front-end users can use sessions like cookies. The session does not depend on cookies and uses server-side storage. Because of this feature, **session can solve cross-domain problems that cookies are difficult to solve**.


## Instructions
  + `session.get(key)`: Get according to the key name
  + `session.set(key, value)`: Create or update a session with key name and key value
  + `session.del(key)`: delete session based on key name
 
 
## Application
ushio-session has now been widely used in the ushio website system. You have ushio-session support behind many of the services on the websites supported by Ushio. such as:

  - Cross-domain and cross-device music continues to play
  - User management identification
  - Language preference record
  - Video playback position is recorded across devices
  - User ID management
  - etc..
