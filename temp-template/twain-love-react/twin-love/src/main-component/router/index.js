import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import HomeMain from '../HomeMain/index'
import Homepage from '../HomePage/index'
import Homepage2 from '../HomePage2/index'
import Homepage3 from '../HomePage3/index'
import Homepage4 from '../HomePage4/index'
import BlogPage from '../blogpage'
import BlogDetailsPage from '../BlogDetailsPage'
import Scrollbar from '../../components/scrollbar'

      

const AllRoute = () => { 

  return (
    <div className="App">
       <Router>
            <Switch>
              <Route exact path='/' component={HomeMain} />
              <Route path='/home' component={HomeMain} />
              <Route path='/home2' component={Homepage} />
              <Route path='/home3' component={Homepage2} />
              <Route path='/home4' component={Homepage4} />
              <Route path='/home5' component={Homepage3} />
              <Route path='/Blog' component={BlogPage} />
              <Route path='/Blog-details' component={BlogDetailsPage} />
            </Switch>
            <Scrollbar />
          </Router>
      
    </div>
  );
}

export default AllRoute;
