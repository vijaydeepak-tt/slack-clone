import React from "react";
import { connect } from "react-redux";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  withRouter,
} from "react-router-dom";

import firebase from "./firebase";

import { setUser } from "./store/actions";

import App from "./components/App";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import { Spinner } from "./components/Spinner";

class Root extends React.Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.props.setUser(user);
        this.props.history.push("/");
      } else {
        this.props.history.push("/login");
      }
    });
  }
  render() {
    return this.props.isLoading ? (
      <Spinner />
    ) : (
      <Switch>
        <Route exact path="/" component={App} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
      </Switch>
    );
  }
}

const mapStateFromProps = (state) => {
  return {
    isLoading: state.user.isLoading,
  };
};

const RootWithAuth = withRouter(connect(mapStateFromProps, { setUser })(Root));

export const Routes = () => (
  <Router>
    <RootWithAuth />
  </Router>
);
