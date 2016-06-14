'use strict;'

import React, {Component} from 'react';
import Server from './modules/server.es6'
//import ReactDOM from 'react-dom';

export default class App extends Component {

   constructor (props) {
     super(props);
     console.log ('App: constructor');
     this.server = new Server(props.buildprops.server_url);
     this.state = { booted: false, booterr: false,  bootmsg: "not booted"};
   }

  componentWillMount() {
    console.log ('App = componentWillMount');
    let looptimes = 0, 
        longPollLoop = () => {
          console.log ('starting longPollLoop, running ping');
          looptimes++;
          this.server.connectClient().then((response) => {
            let {ping, connection} = response;
            console.log ('got ping, updating state');
            this.setState({ "booted": true, "ping": ping, "looptimes": looptimes}, () => {
              console.log ('ok, and got long');
              connection.then((server_data) => {
                if (server_data.keepalive == true) {
                  console.log ('got keepalive');
                  longPollLoop();
                }
              })
            });
          });
        }
    longPollLoop();
  }


   render () {
     //console.log ("App: render");
     if (this.state.booted)  return (
         <div className="">
            Connected received ping: {this.state.ping} ({this.state.looptimes})
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

