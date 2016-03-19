'use strict;'

import React, {Component} from 'react';
import io from 'socket.io-client';
//import ReactDOM from 'react-dom';

export default class App extends Component {

   constructor (props) {
     super(props);
     console.log ('App: constructor');
     this.state = { booted: false, booterr: false,  bootmsg: "not booted"};
   }

  componentWillMount() {
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


   render () {
     //console.log ("App: render");
     if (this.state.booted)  return (
         <div className="">
            Connected received {this.state.rev}
         </div>
       );
     else if (this.state.booterr) return (
         <div>
         Looks like your user is not correctly configured, please email the system ower with this message {this.state.bootmsg}
         </div>
       );
     else return (
       <div className="">
        connecting...... {'to ' + JSON.stringify(this.props.buildprops)}
      </div>
     );
   }
 }

