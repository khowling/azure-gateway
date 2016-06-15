'use strict;'

import React, {Component} from 'react';
import Server from './modules/server.es6'
import {Glass, ToDoList} from './components/glass.jsx'

//import ReactDOM from 'react-dom';

export default class App extends Component {

   constructor (props) {
     super(props);
     console.log ('App: constructor');
     this.server = new Server(props.buildprops.server_url);
     this.state = { booted: false, booterr: false,  bootmsg: "not booted"};
   }

  componentWillMount() {
    let looptimes = 0, 
        longPollLoop = () => {
          looptimes++;
          this.server.connectClient().then((response) => {
            let {ping, connection} = response;
            this.setState({ "booted": true, "ping": ping, "looptimes": looptimes});

            connection.then((server_data) => {
              console.log (`longPollLoop: got server_data`);
              if (server_data.keepalive == true) {
                longPollLoop();
              }
            }, (err) => this.setState({ "booted": false, booterr: true, bootmsg: "disconnected from server"}));
          }, (err) => this.setState({ "booted": false, booterr: true, bootmsg: "disconnected from server"}));
        }
    longPollLoop();
  }


   render () {
     if (this.state.booted)  return (
         <div className="col-sm-12  col-lg-12 main">
            Connected received ping: {this.state.ping} ({this.state.looptimes})
            <Glass title="keith"/>
            <ToDoList/>
         </div>
       );
     else if (this.state.booterr) return (
         <div>
         {this.state.bootmsg}, refresh to try again
         </div>
       );
     else return (
       <div className="">
        connecting...... {'to ' + JSON.stringify(this.props.buildprops)}
      </div>
     );
   }
 }

