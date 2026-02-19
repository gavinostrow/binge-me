import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Tab1 from './Tabs/Tab1';
import Tab2 from './Tabs/Tab2';
import Tab3 from './Tabs/Tab3';

const BingeApp = () => {
    return (
        <Router>
            <Switch>
                <Route path='/tab1' component={Tab1} />
                <Route path='/tab2' component={Tab2} />
                <Route path='/tab3' component={Tab3} />
                <Route path='/' exact component={Tab1} /> {/* Default route */}
            </Switch>
        </Router>
    );
};

export default BingeApp;
