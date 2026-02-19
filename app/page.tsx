import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LoginPage from './LoginPage'; // Make sure to create this component
import MainApp from './MainApp'; // Make sure to create this component

const App = () => {
    return (
        <Router>
            <Switch>
                <Route path="/login" component={LoginPage} />
                <Route path="/" component={MainApp} />
            </Switch>
        </Router>
    );
};

export default App;