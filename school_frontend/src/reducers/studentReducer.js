/* eslint-disable no-param-reassign */
import produce from 'immer';
import {
  SET_STUDENTS,
} from 'src/actions/studentActions';

const initialState = {
  students: [],
  totalCount: 0,
};

const studentReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_STUDENTS: {
      const { students, totalCount } = action.payload;
      return produce(state, (draft) => {
        draft.students = students;
        draft.totalCount = totalCount;
      });
    }

    default: {
      return state;
    }
  }
};

export default studentReducer;
