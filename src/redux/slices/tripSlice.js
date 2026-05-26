import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  origin: null,
  destination: null,
  distance: null,
  duration: null,
  price: null,
};

const tripSlice = createSlice({
  name: 'trip',

  initialState,

  reducers: {

    setTripData: (state, action) => {
      state.origin = action.payload.origin;
      state.destination = action.payload.destination;
      state.distance = action.payload.distance;
      state.duration = action.payload.duration;
      state.price = action.payload.price;
    },

    clearTrip: state => {
      state.origin = null;
      state.destination = null;
      state.distance = null;
      state.duration = null;
      state.price = null;
    },
  },
});

export const {setTripData, clearTrip} = tripSlice.actions;

export default tripSlice.reducer;