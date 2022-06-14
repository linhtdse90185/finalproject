import React, { Component } from 'react'
import { Link, Route, Router, Switch } from 'react-router-dom'
import { Grid, Menu, Segment } from 'semantic-ui-react'

import Auth from './auth/Auth'
import { EditTodo } from './components/EditTodo'
import { LogIn } from './components/LogIn'
import { NotFound } from './components/NotFound'
import { Todos } from './components/Todos'

export interface AppProps {}

export interface AppProps {
  auth: Auth
  history: any
}

export interface AppState {}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
  }

  handleLogin() {
    this.props.auth.login()
  }

  handleLogout() {
    this.props.auth.logout()
  }

  render() {
    return (
      <div className="app">
        <header>
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container">
            <div className="collapse navbar-collapse" id="navbarText">
              <ul className="navbar-nav mr-auto">
                <li className="nav-item active">
                  <Link to="/">Home</Link>
                </li>
              </ul>
              <div className="navbar-text">
                {this.logInLogOutButton()}
              </div>
            </div>
            </div>
          </nav>
        </header>
        <div className="container">
          <main>
            <Router history={this.props.history}>
              {/* {this.generateMenu()} */}

              {this.generateCurrentPage()}
            </Router>
          </main>
          <footer></footer>
        </div>
      </div>
    )
  }

  generateMenu() {
    return (
      <Menu>
        <Menu.Item name="home">
          <Link to="/">Home</Link>
        </Menu.Item>

        <Menu.Menu position="right">{this.logInLogOutButton()}</Menu.Menu>
      </Menu>
    )
  }

  logInLogOutButton() {
    if (this.props.auth.isAuthenticated()) {
      return (
        <Menu.Item name="logout" onClick={this.handleLogout}>
          Log Out
        </Menu.Item>
      )
    } else {
      return (
        <Menu.Item name="login" onClick={this.handleLogin}>
          Log In
        </Menu.Item>
      )
    }
  }

  generateCurrentPage() {
    if (!this.props.auth.isAuthenticated()) {
      return <LogIn auth={this.props.auth} />
    }

    return (
      <Switch>
        <Route
          path="/"
          exact
          render={(props) => {
            return <Todos {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/todos/:todoId/edit"
          exact
          render={(props) => {
            return <EditTodo {...props} auth={this.props.auth} />
          }}
        />

        <Route component={NotFound} />
      </Switch>
    )
  }
}
