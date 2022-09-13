/* eslint-disable no-param-reassign */
import produce from 'immer';
import {
  SET_SCORES,
} from 'src/actions/scoreActions';

const initialState = {
  scores: [],
  totalCount: 0,
};

const scoreReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SCORES: {
      const { scores, totalCount } = action.payload;
      return produce(state, (draft) => {
        draft.scores = scores;
        draft.totalCount = totalCount;
      });
    }

    default: {
      return state;
    }
  }
};

export default scoreReducer;
