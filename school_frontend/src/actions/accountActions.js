import axios from 'axios';
import authService from 'src/services/authService';
import { API_BASE_URL } from 'src/config';

export const LOGIN_REQUEST = '@account/login-request';
export const LOGIN_SUCCESS = '@account/login-success';
export const LOGIN_FAILURE = '@account/login-failure';
export const SILENT_LOGIN = '@account/silent-login';
export const LOGOUT = '@account/logout';
export const REGISTER = '@account/register';
export const REGISTER_FAILURE = '@account/register-failure';
export const UPDATE_PROFILE = '@account/update-profile';

//export const UPDATE_AVATAR = '@account/update-avatar';
export const SET_AVATAR = '@account/set-avatar';

export function login(email, password) {
  return async (dispatch) => {
    try {
      dispatch({ type: LOGIN_REQUEST });

      const user = await authService.loginWithEmailAndPassword(email, password);

      dispatch({
        type: LOGIN_SUCCESS,
        payload: {
          user
        }
      });
    } catch (error) {
      dispatch({ type: LOGIN_FAILURE });
      throw error;
    }
  };
}

export function setUserData(user) {
  return (dispatch) => dispatch({
    type: SILENT_LOGIN,
    payload: {
      user
    }
  });
}

export function logout() {
  return async (dispatch) => {
    authService.logout();

    dispatch({
      type: LOGOUT
    });
  };
}

export function register(user) {
  return async (dispatch) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/user`, user);

      if (response.status) {
        console.log('>>> register, ', response.data);

        dispatch({
          type: REGISTER,
          payload: {
            user: response.data.user
          }
        });
      }
    } catch (error) {
      dispatch({ type: REGISTER_FAILURE });
      throw error;
    }
  };
}

export function updateProfile(update) {
  // console.log('firstName=>'+update.firstName+' lastName=>'+update.lastName+' email=>'+update.email+' phone=>'+update.phone+' country=>'+update.country);
  
  const request = axios.post(`${API_BASE_URL}/user/me`, update);
  console.log(request);
  return (dispatch) => {
    request.then((response) => dispatch({
      type: UPDATE_PROFILE,
      payload: response.data
    }));
  };
}

export function setAvatar(value) {
  console.log('setAvatar in');
  console.log(value);
  const request = axios.post(`${API_BASE_URL}/user/setavatar`, value);
  console.log(request);
  return (dispatch) => {
    request.then((response) => dispatch({
      type: UPDATE_PROFILE,
      payload: response.data
    }));
  };
}

// export function updateAvatar(update) {

//   return async (dispatch) => {
//    dispatch({
//       type: UPDATE_AVATAR,
//       payload: update
//     });
//   };
// }

