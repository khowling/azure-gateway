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
    this.server.reportClient().then((s => {
      this.setState({ booted: true});
    }));
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

