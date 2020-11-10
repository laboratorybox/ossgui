import React from 'react';
import { Provider } from 'react-redux';
import './App.css';
import AddSortingJob from './containers/AddSortingJob';
import Initialize from './containers/Initialize';
import SortingJobList from './containers/SortingJobList';
import store from './store';

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <Initialize />
        <AddSortingJob />
        <SortingJobList />
      </Provider>
    </div>
  );
}

export default App;
