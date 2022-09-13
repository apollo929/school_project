import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import accountReducer from './accountReducer';
import notificationsReducer from './notificationsReducer';
import chatReducer from './chatReducer';
import mailReducer from './mailReducer';
import kanbanReducer from './kanbanReducer';
import customerReducer from './customerReducer';
import studentReducer from './studentReducer';
import scoreReducer from './scoreReducer';

const rootReducer = combineReducers({
  account: accountReducer,
  notifications: notificationsReducer,
  chat: chatReducer,
  mail: mailReducer,
  kanban: kanbanReducer,
  customer: customerReducer,
  student: studentReducer,
  score: scoreReducer,
  form: formReducer,
});

export default rootReducer;
