import { createStore, combineReducers, applyMiddleware } from "redux";
import { Auth } from "./../resource";
import { createLogger } from "redux-logger";
import { authReducer, notifiReducer } from "./../reducers";
import thunk from "redux-thunk";
import { authActions, notifiActions } from "./../actions";
import { routerReducer, routerMiddleware, push } from 'react-router-redux'
import history from "./history";

const customMiddleWare = store => next => action => {

    if (action.type === "@@resource/AUTH/GET" && action.status === "resolved") {
        localStorage.setItem("authData", JSON.stringify(action.body));
        store.dispatch(authActions.authLogin(action.body));
        store.dispatch(push("/home"));
    } else if (action.type === "@@resource/AUTH/SIGNUP" && action.status === "resolved") {
        store.dispatch(authActions.authPageSet("login"));
    }

    if (action.type.includes("@@resource/AUTH/") && action.status === "rejected" && "body" in action) {
        if ("message" in action.body) {
            store.dispatch(notifiActions.addNotifi(action.body.message, "error"));
        }
    } else if (action.status === "rejected") {
        store.dispatch(notifiActions.addNotifi("Could not reslove", "error"));
    }
    next(action);
}


const middleware = routerMiddleware(history)

const logger = createLogger({ predicate: 'development' });

const store = createStore(
    combineReducers({ auth: Auth.rootReducer, userAuth: authReducer, notifi: notifiReducer, router: routerReducer }),
    applyMiddleware(thunk, logger, customMiddleWare, middleware)
);

export default store;