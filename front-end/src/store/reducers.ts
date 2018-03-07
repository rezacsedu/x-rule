import { combineReducers } from 'redux';
import { isRuleModel, isTreeModel, RuleList, DataSet, DataTypeX, ConditionalStreams, Streams } from '../models';
import {
  ModelState,
  DataBaseState,
  FeatureState,
  TreeStyles,
  initTreeStyles,
  FeatureStatus,
  RuleStyles,
  initRuleStyles,
  RootState,
  Settings,
  initialSettings
} from './state';
import { collapseInit } from '../service/utils';
import { ReceiveStreamAction } from './actions';
import { initialStreamBaseState, StreamBaseState } from './state';

import {
  ReceiveSupportAction,
  ActionType,
  RequestModelAction,
  ReceiveModelAction,
  // RequestDatasetAction,
  ReceiveDatasetAction,
  SelectDatasetAction,
  SelectFeatureAction,
  ChangeTreeStylesAction,
  ChangeRuleStylesAction,
  ChangeSettingsAction
} from './actions';

export const initialModelState: ModelState = {
  model: null,
  isFetching: false
};

// export const initialModelBaseState: ModelBaseState = {};

export const initialDataBaseState: DataBaseState = {};

export const initialFeaturesState: FeatureState[] = [];

function modelStateReducer(
  state: ModelState = initialModelState,
  action: RequestModelAction | ReceiveModelAction | ReceiveSupportAction
): ModelState {
  switch (action.type) {
    case ActionType.REQUEST_MODEL:
      // console.log("start Fetching...");  // tslint:disable-line
      return { ...state, isFetching: true };
    case ActionType.RECEIVE_MODEL:
      // console.log("receiving model...");  // tslint:disable-line
      let model = action.model;
      if (model !== null) {
        if (isRuleModel(model)) model = new RuleList(model);
        if (isTreeModel(model)) collapseInit(model.root);
      }
      return {
        isFetching: false,
        model
      };
    case ActionType.RECEIVE_SUPPORT:
      const aModel = state.model;
      if (aModel instanceof RuleList) {
        aModel.support(action.support);
      }
      return {
        isFetching: false,
        model: aModel
      };
    default:
      return state;
  }
}

function dataBaseReducer(
  state: DataBaseState = initialDataBaseState,
  action: ReceiveDatasetAction
): DataBaseState {
  switch (action.type) {
    case ActionType.RECEIVE_DATASET:
      const newState: DataBaseState = {};
      newState[action.dataType] = new DataSet(action.data);
      return { ...state, ...newState };

    default:
      return state;
  }
}

function streamBaseReducer( 
  state: StreamBaseState = initialStreamBaseState,
  action: ReceiveStreamAction
): StreamBaseState {
  switch (action.type) {
    case ActionType.RECEIVE_STREAM:
      const streamBase: StreamBaseState[DataTypeX] = {...(state[action.dataType])};
      if (action.conditional) {
        streamBase.conditionalStreams = action.streams as ConditionalStreams;
      } else {
        streamBase.streams = action.streams as Streams;
      }
      const newState: StreamBaseState = {};
      newState[action.dataType] = streamBase;
      return { ...state, ...newState };

    default:
      return state;
  }
}

function selectDatasetReducer(state: DataTypeX[] = [], action: SelectDatasetAction): DataTypeX[] {
  switch (action.type) {
    case ActionType.SELECT_DATASET:
      return action.dataNames;
    default:
      return state;
  }
}

function selectedFeaturesReducer(
  state: FeatureState[] = initialFeaturesState,
  action: SelectFeatureAction
): FeatureState[] {
  switch (action.type) {
    case ActionType.SELECT_FEATURE:
      if (action.deselect) {
        const idx = state.findIndex((f: FeatureState) => f.idx === action.idx);
        if (idx === -1) return state;
        const feature = state[idx];
        feature.status--;
        if (feature.status < FeatureStatus.HOVER) {
          return [...state.slice(0, idx), ...state.slice(idx + 1)];
        }
        return state;
      } else {
        const idx = state.findIndex((f: FeatureState) => f.idx === action.idx);
        if (idx === -1) return [...state, { idx: action.idx, status: FeatureStatus.HOVER }];
        else if (state[idx].status < FeatureStatus.SELECT) {
          state[idx].status++;
        }
        return state;
      }
    default:
      return state;
  }
}

function treeStylesReducer(state: TreeStyles = initTreeStyles, action: ChangeTreeStylesAction): TreeStyles {
  switch (action.type) {
    case ActionType.CHANGE_TREE_STYLES:
      return { ...state, ...action.newStyles };
    default:
      return state;
  }
}

function ruleStylesReducer(state: RuleStyles = initRuleStyles, action: ChangeRuleStylesAction): RuleStyles {
  switch (action.type) {
    case ActionType.CHANGE_RULE_STYLES:
      return { ...state, ...action.newStyles };
    default:
      return state;
  }
}

function settingsReducer(state: Settings = initialSettings, action: ChangeSettingsAction): Settings {
  switch (action.type) {
    case ActionType.CHANGE_SETTINGS:
      return { ...state, ...action.newSettings };
    default:
      return state;
  }
}
// function selectedDataReducer(
//   state: string,
//   action:
// )

export const rootReducer = combineReducers<RootState>({
  model: modelStateReducer,
  dataBase: dataBaseReducer,
  streamBase: streamBaseReducer,
  selectedData: selectDatasetReducer,
  selectedFeatures: selectedFeaturesReducer,
  treeStyles: treeStylesReducer,
  ruleStyles: ruleStylesReducer,
  settings: settingsReducer,
});