'use strict';

const ConnectionType = {
    Serial: 0,
    TCP:    1,
    UDP:    2,
    BLE:    3
}

class Connection {

    constructor() {       
        this._connectionId   = false;
        this._openRequested  = false;
        this._openCanceled   = false;
        this._bitrate        = 0;
        this._bytesReceived  = 0;
        this._bytesSent      = 0;
        this._transmitting   = false;
        this._outputBuffer   = [];
        this._onReceiveListeners      = [];
        this._onReceiveErrorListeners = [];
        
        if (this.constructor === Connection) {
            throw new TypeError("Abstract class, cannot be instanced.");
        }

        if (this.connectImplementation === Connection.prototype.connectImplementation) {
            throw new TypeError("connectImplementation is an abstract member and not implemented.")
        }

        if (this.disconnectImplementation === Connection.prototype.disconnectImplementation) {
            throw new TypeError("disconnectImplementation is an abstract member and not implemented.")
        }

        if (this.addOnReceiveCallback === Connection.prototype.addOnReceiveCallback) {
            throw new TypeError("addOnReceiveCallback is an abstract member and not implemented.")
        }

        if (this.removeOnReceiveCallback === Connection.prototype.removeOnReceiveCallback) {
            throw new TypeError("removeOnReceiveCallback is an abstract member and not implemented.")
        }

        if (this.addOnReceiveErrorCallback === Connection.prototype.addOnReceiveErrorCallback) {
            throw new TypeError("addOnReceiveErrorCallback is an abstract member and not implemented.")
        }

        if (this.removeOnReceiveErrorCallback === Connection.prototype.removeOnReceiveErrorCallback) {
            throw new TypeError("removeOnReceiveErrorCallback is an abstract member and not implemented.")
        }
    }

    get connectionId() {
        return this._connectionId;
    }

    get bitrate() {
        return this._bitrate;
    }

    get type() {
        switch (this.constructor.name) {
            case ConnectionSerial.name:
                return ConnectionType.Serial;
            case ConnectionTcp.name:
                return ConnectionType.TCP;
            case ConnectionUdp.name:
                return ConnectionType.UDP;
            case ConnectionBle.name:
                return ConnectionType.BLE;       
        }
    }

    static create(type) {
        if (Connection.instance && (Connection.instance.type == type || Connection.instance.connectionId)){
            return Connection.instance;
        }

        switch (type) {
            case ConnectionType.BLE:
                Connection.instance = new ConnectionBle();
                break;
            case ConnectionType.TCP:
                Connection.instance = new ConnectionTcp();
                break;
            case ConnectionType.UDP:
                Connection.instance = new ConnectionUdp();
                break;
            default:
            case ConnectionType.Serial:
                Connection.instance = new ConnectionSerial();
                break;
        }
        return Connection.instance;
    };

    connectImplementation(path, options, callback) {
        throw new TypeError("Abstract method");
    }

    connect(path, options, callback) {
        this._openRequested = true;
        this._failed = 0;
        this.connectImplementation(path, options, connectionInfo => {                   
            if (connectionInfo && !this._openCanceled) { 
                this._connectionId = connectionInfo.connectionId;
                this._bitrate = connectionInfo.bitrate;
                this._bytesReceived = 0;
                this._bytesSent = 0;    
                this._openRequested = false;
            
                this.addOnReceiveListener((info) => {
                    this._bytesReceived += info.data.byteLength;
                });

                console.log('Connection opened with ID: ' + connectionInfo.connectionId + ', Baud: ' + connectionInfo.bitrate); 

                if (callback) { 
                    callback(connectionInfo);
                }
            } else if (connectionInfo && this.openCanceled) {
                // connection opened, but this connect sequence was canceled
                // we will disconnect without triggering any callbacks
                this._connectionId = connectionInfo.connectionId;
                console.log('Connection opened with ID: ' + connectionInfo.connectionId + ', but request was canceled, disconnecting');

                // some bluetooth dongles/dongle drivers really doesn't like to be closed instantly, adding a small delay
                setTimeout(() => {
                    this._openRequested = false;
                    this._openCanceled = false;
                    this.disconnect(() => {
                        if (callback) {
                            callback(false);
                        }
                    });
                }, 150);
            } else if (this._openCanceled) {
                // connection didn't open and sequence was canceled, so we will do nothing
                console.log('Connection didn\'t open and request was canceled');
                this._openRequested = false;
                this._openCanceled = false;
                if (callback) {
                    callback(false);
                }
            } else {
                this._openRequested = false;
                console.log('Failed to open');
                googleAnalytics.sendException('FailedToOpen', false);
                if (callback) {
                    callback(false);
                }
            }
        });
    }
    
    disconnectImplementation(callback) {
        throw new TypeError("Abstract method");
    }

    disconnect(callback) {
        if (this._connectionId) {
            this.emptyOutputBuffer();
            this.removeAllListeners();
            
            this.disconnectImplementation(result => {           
                this.checkChromeLastError();
    
                if (result) {
                    console.log('Connection with ID: ' + this._connectionId + ' closed, Sent: ' + this._bytesSent + ' bytes, Received: ' + this._bytesReceived + ' bytes');
                } else {
                    console.log('Failed to close connection with ID: ' + this._connectionId + ' closed, Sent: ' + this._bytesSent + ' bytes, Received: ' + this._bytesReceived + ' bytes');
                    googleAnalytics.sendException('Connection: FailedToClose', false);
                }
                
                this._connectionId = false;
                if (callback) {
                    callback(result);
                }
            });
        } else {
            this._openCanceled = true;
        }
    }
    
    sendImplementation(data, callback) {
        throw new TypeError("Abstract method");
    }

    send(data, callback) {
        this._outputBuffer.push({'data': data, 'callback': callback});

        var send = () => {
            // store inside separate variables in case array gets destroyed
            var data = this._outputBuffer[0].data,
                callback = this._outputBuffer[0].callback;

                this.sendImplementation(data, sendInfo => {
                    // track sent bytes for statistics
                    this._bytesSent += sendInfo.bytesSent;

                    // fire callback
                    if (callback) {
                         callback(sendInfo);
                    }

                    // remove data for current transmission form the buffer
                    this._outputBuffer.shift();

                    // if there is any data in the queue fire send immediately, otherwise stop trasmitting
                    if (this._outputBuffer.length) {
                        // keep the buffer withing reasonable limits
                        if (this._outputBuffer.length > 100) {
                            var counter = 0;

                            while (this._outputBuffer.length > 100) {
                                this._outputBuffer.pop();
                                counter++;
                            }

                            console.log('Send buffer overflowing, dropped: ' + counter + ' entries');
                        }
                        send();
                    } else {
                        this._transmitting = false;
                    }
                });
        }

        if (!this._transmitting) {
            this._transmitting = true;
            send();
        }
    }
    
    abort() {
        if (GUI.connected_to || GUI.connecting_to) {
            $('a.connect').trigger('click');
        } else {
            this.disconnect();
        }
    }

    checkChromeLastError() {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
        } 
    }

    addOnReceiveCallback(callback) {
        throw new TypeError("Abstract method");
    }

    removeOnReceiveCallback(callback) {
        throw new TypeError("Abstract method");
    }

    addOnReceiveListener(callback) {
        this._onReceiveListeners.push(callback);
        this.addOnReceiveCallback(callback)
    }

    addOnReceiveErrorCallback(callback) {
        throw new TypeError("Abstract method");
    }

    removeOnReceiveErrorCallback(callback) {
        throw new TypeError("Abstract method");
    }

    addOnReceiveErrorListener(callback) {
        this._onReceiveErrorListeners.push(callback);
        this.addOnReceiveErrorCallback(callback)
    }

    removeAllListeners() {
        this._onReceiveListeners.forEach(listener => this.removeOnReceiveCallback(listener));
        this._onReceiveListeners = [];

        this._onReceiveErrorListeners.forEach(listener => this.removeOnReceiveErrorCallback(listener));
        this._onReceiveErrorListeners = [];
    }

    emptyOutputBuffer() {
        this._outputBuffer = [];
        this._transmitting = false;
    }

    /**
     * Default timeout values
     * @returns {number} [ms]
     */
    getTimeout() {
        if (this._bitrate >= 57600) {
            return 3000;
        } else {
            return 4000;
        }
    }
}
