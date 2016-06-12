'use strict';

import io from 'socket.io-client';



export default Class SocketServer {

    init () {
        let socket = io(this.props.buildprops.server_url);
        socket.on('connect', () => {
            socket.emit('join', 'stats');
            this.setState({booted: true, rev: ''})
        });
        socket.on('newstat', (data) => {
            console.log ('got data ' + data);
            this.setState({rev: this.state.rev + ' : ' + data});
        });
        socket.on('disconnect', () => {
            this.setState({booted: false})
        });
    }  
}