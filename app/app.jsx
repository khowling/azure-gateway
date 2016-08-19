'use strict;'

import React, {Component} from 'react';
import update from 'react-addons-update';
import Server from './modules/server.es6'
import {Glass, ToDoList} from './components/glass.jsx'
import Immutable from 'immutable';

//import ReactDOM from 'react-dom';

export default class App extends Component {

   constructor (props) {
     super(props);
     console.log ('App: constructor');
     this.server = new Server(props.buildprops.server_url);
     this.state = { 
       booted: false, 
       booterr: false,  
       bootmsg: "not booted", 
       eventlists: {current_instance_stats: [], current_client: []},
       alldatafromserver: [],
       connections: new Map()};
   }

   // checkout https://facebook.github.io/react/docs/update.html
  componentWillMount() {
    let looptimes = 0, 
        pollLoop = (ptime) => {

          this.server.longPoll(ptime).then((server_data) => {
            looptimes++
            console.log (`longPollLoop: got ${JSON.stringify(server_data)}`);
            let eventlists = this.state.eventlists;
            if (server_data.data) {
              console.log ('got ping data')
              for (let inst of server_data.data) {
                //inst.key === 'current_instance_stats')
                // remove any existing record of this id in the array
                let existing_idx = eventlists[inst.key].findIndex((e) => e.id === inst.id);
                if (existing_idx >=0) {// perform 1 splice, at position existing_idx, remove 1 element
                  eventlists = update (eventlists, {[inst.key]: {$splice: [[existing_idx, 1]]}})
                }
                if (inst.op === 'update') {// add it to the top of the array
                  eventlists = update (eventlists, {[inst.key]: {$push:[inst]}})
                }
                console.log (`got ${inst.key}:${inst.id} ${inst.op} ${existing_idx}`)
              }
            }
            this.setState({ping: this.state.ping, looptimes: looptimes, eventlists: eventlists, alldatafromserver: update(this.state.alldatafromserver, {$push: [server_data]})}, pollLoop);

          }, (err) => this.setState({ "booted": false, booterr: true, bootmsg: `disconnected from server ${err}`}))
        }

    this.server.connectClient().then ((ptime) => {
      this.setState({booted: true, ping: ptime, looptimes: looptimes});
      pollLoop(ptime)
    }, (err) => this.setState({ "booted": false, booterr: true, bootmsg: `disconnected from server ${err}`}))
  }

  _joingame() {

  }


   render () {
     console.log ('app render');
     if (this.state.booted)  return (
         <div className="col-sm-12  col-lg-12 main">
            <div>Connected received ping: {this.state.ping} ({this.state.looptimes})</div>

            <div className="row">
            {false && this.state.alldatafromserver.map ((v,i) => {
              return <div key={ 'a'+i }> val {JSON.stringify(v)}</div>;
            })}

            </div>
            <div className="row">
              <div className="col-xs-10 col-md-5">
                <Glass title="keith"/>
              </div>
              <div className="col-xs-10 col-md-5">
                <ToDoList title="Server Instances" conns={this.state.eventlists['current_instance_stats']} columns={['hostname']}/>
              </div>
              <div className="col-xs-10 col-md-5">
                <ToDoList title="Client Connections" conns={this.state.eventlists['current_client']} columns={['useragent']}/>
              </div>
              <div className="col-xs-10 col-md-5">
                <button className="btn btn-primary" onClick={this._joingame}>Join Game</button>
              </div>
            </div>
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

