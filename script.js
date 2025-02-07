'use strict';

// prettier-ignore


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


//let map,mapEvent;
//super class
class Workout{
  date=new Date();
  id=(Date.now()+'').slice(-10);
  constructor(coords, distance,duration)
  {
   this.coords=coords;
   this.distance=distance;
   this.duration=duration;
   
  }
  _setDiscription()
  {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.desccription=`${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
}

//running class

class Runnig extends Workout{
  type='running';
  constructor(coords, distance,duration,cadence)
  {
    super(coords, distance,duration);
    this.cadence=cadence;
    this.calcPace();
    this._setDiscription();
  }

  calcPace()
  {
    //min/km
    this.pace=this.duration/this.distance;
    return this.pace;
  }
}

//cycling class
class cycling extends Workout{
  type='cycling';
  constructor(coords, distance,duration,elevationGain)
  {
  super(coords, distance,duration);
  this.elevationGain=elevationGain;
  this.calcSpeed();
  this._setDiscription();
  }
  calcSpeed()
  {
    //km/h
    this.speed=this.distance/(this.duration/60);
  }
}

class App{
  #map;
  #mapEvent;
  #workouts=[];
  constructor(){
    //get position
this._getPosition();
//get data from local storage
this._getLocalStorage();
//handlers
form.addEventListener('submit',this._newWorkout.bind(this));

//change between cycling and running
inputType.addEventListener('change',this._toggleElevationField);


containerWorkouts.addEventListener('click',this._moveToPopup.bind(this));
  }
  _getPosition()
  {
if(navigator.geolocation)
    {navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),function()
    {
      alert('couldn`t get your position');
    });}
  }

  _loadMap(position)
  {
      const {latitude}=position.coords;
      const {longitude}=position.coords;
      const coords=[latitude,longitude];
      this.#map = L.map('map').setView(coords, 13);
    
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);

      this.#map.on('click',this._showForm.bind(this));

      this.#workouts.forEach(work=>this._renderWorkoutMarker(work));

  }

  _showForm(mapE)
  {
    this.#mapEvent=mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm()
  {
      //clear input
    inputDistance.value=inputDuration.value=inputCadence.value=inputElevation.value='';
    form.style.display='none';
    form.classList.add('hidden');
    setTimeout(()=>(form.style.display='grid'),1000);
  }

  _toggleElevationField()
  {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e)
  {
    e.preventDefault();
    //check if inputs are numbers
   const numChecker=(...inputs)=>inputs.every(input=>Number.isFinite(input));
     //check if numbers are positive

    const posChecker=(...inputs)=>inputs.every(input=>input>0);
  //get data from form
   const type=inputType.value;
   const distance=+inputDistance.value;
   const duration=+inputDuration.value;
   const {lat,lng}=this.#mapEvent.latlng;
   let workout;
   //if running, create running object
   if(type==='running')
    {
      const cadence=+inputCadence.value;
      //check data validity
      if(!numChecker(distance,duration,cadence)||!posChecker(distance,duration,cadence))return alert('Inputs have to be positive numbers');

       workout =new Runnig([lat,lng],distance,duration,cadence);
      
      }
  //if cycling, create cycling object
  if(type==='cycling')
    {
      const elevation=+inputElevation.value;
      //check data validity
      if(!numChecker(distance,duration,elevation)||!posChecker(distance,duration))return alert('Inputs have to be positive numbers');
      workout =new cycling([lat,lng],distance,duration,elevation);
    }
    
  // add new object to workout arrray
  this.#workouts.push(workout);
  console.log(workout);
  //render map
 
  this._renderWorkoutMarker(workout);
  
  //render list

this._renderWorkout(workout);
  //hide form and cleat input fields

  this._hideForm();
    
  //set local storage to all workouts

    this._setLocalStorage();
  }
  _renderWorkoutMarker(workout)
  {
    L.marker(workout.coords).addTo(this.#map)
    .bindPopup(L.popup({
      maxWidth:250,
      minWidth:100,
      autoClose:false,
      closeOnClick:false,
      className:`${workout.type}-popup`,
    })).setPopupContent(`${workout.type==='running'?'🏃‍♂️':'🚴‍♀️'} ${workout.desccription}`)
    .openPopup();
  }


  _renderWorkout(workout)
  {
    let html=`<li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.desccription}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type==='running'?'🏃‍♂️':'🚴‍♀️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;
          if(workout.type==="running")
            html+=`<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
        if(workout.type==="cycling")
          html+=` <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li> `;
        form.insertAdjacentHTML('afterend',html);
  }

  _moveToPopup(e)
{
const workoutEl=e.target.closest('.workout');

if(!workoutEl)return;
const workout=this.#workouts.find(work=>work.id===workoutEl.dataset.id);

this.#map.setView(workout.coords,15,{
  Animation:true,
  pan:{
    duration:1,
  }
});
}
_setLocalStorage()
{
  localStorage.setItem('workouts',JSON.stringify(this.#workouts));
}

_getLocalStorage()
{
  const data=JSON.parse(localStorage.getItem('workouts'));

  if(!data)return;
  this.#workouts=data;
  this.#workouts.forEach(work=>{this._renderWorkout(work)});
}
reset()
{
  localStorage.removeItem('workouts');
  location.reload();
}

}
const app=new App();




