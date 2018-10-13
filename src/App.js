import React, { Component } from 'react';
import './App.css';
import 'leaflet/dist/leaflet.css';

import { Map, TileLayer, Polyline } from 'react-leaflet';

const colorPerStatus = {
  good: 'lime',
  ok: 'orange',
};


const bikelanes = [
  {
    coords: [[32.078, 34.7815], [32.082, 34.7815]],
    status: 'good',
    street: 'dizengoff',
    addressStart: 100,
    addressFinish: 120,
  },
  {
    coords: [[32.074, 34.782], [32.078, 34.7815]],
    status: 'ok',
    street: 'dizengoff',
    addressStart: 80,
    addressFinish: 99,
  },
];

const endpoint = 'http://localhost:8000';

class App extends Component {

  static hooks = {
    getBikelanes: ()=> Promise.resolve({ bikelanes }),
    getLanes: ()=>
      fetch(endpoint + '/bikelane')
        .then(res => res.json())
        .then(bikelanes => ({
          bikelanes: bikelanes.map(b=> ({
            ...b,
            coords: [[ b.startLat, b.startLng ], [ b.endLat, b.endLng ]],
          }) )
        }))
        .catch(e => ({ bikelanes }) ),

    createLane: (coords)=>
      fetch(endpoint + '/bikelane', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: {
            status: 'ok',
            street: 'dizengoff',
            addressStart: 80,
            addressFinish: 99,
            startLat: coords[0][0],
            startLng: coords[0][1],
            endLat: coords[1][0],
            endLng: coords[1][1],
          }
        })
      }).then(res => res.json())
        .then(pon => ({})),
  }
  
  state = {
    lat: 32.08,
    lng: 34.78,
    zoom: 15,

    currentLane: null,
    adding: null,
  }

  componentDidMount(){
    this.props.getLanes();
    //this.props.getBikelanes();
  }
  
  clickLine = (laneIndex)=>
    this.setState({ currentLane: this.state.lanes[laneIndex] })

  onZoomend = ({ target: { _zoom } })=> this.setState({ zoom: _zoom })

  startAddLine = ()=> this.setState({ adding: [] })

  clickMap = ({ latlng: { lat, lng } })=> this.state.adding && this.setState( state => ({
    adding: state.adding.concat([[ lat, lng ]]),
  }), ()=>
    ( this.state.adding.length === 2 ) &&
         this.props.createLane( this.state.adding )
             .then(()=> this.setState({ adding: null }))
             .then(()=> this.props.getLanes())
  )
  
  render() {
    const position = [ this.state.lat, this.state.lng ];
  
    const { currentLane, zoom } = this.state;
    const { bikelanes=[] } = this.props;

    return (
      <div className="App">

        <div className='control-panel'>
          <button onClick={this.startAddLine}>+</button>
          {JSON.stringify(currentLane)}
        </div>
        
        <Map center={position}
             onZoomend={this.onZoomend}
             onClick={this.clickMap}
             zoom={zoom}>
          <TileLayer
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {
            bikelanes.map(({ coords, status }, i)=> (
              <Polyline key={i}
                        weight={Math.max(3, 6*zoom-83)}
                        color={colorPerStatus[status]}
                        positions={coords}
                        onClick={()=> this.clickLine(i)}/>   
            ))
          }
        </Map>
        
      </div>
    );
  }
}

export default App;
