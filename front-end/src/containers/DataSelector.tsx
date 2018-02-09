import * as React from 'react';
import { connect } from 'react-redux';
import { Tag } from 'antd';
import {
  Dispatch,
  SelectDatasetAction,
  SelectedDataType,
  fetchDatasetIfNeeded,
  selectDataset,
  getSelectedDataNames,
  DataBaseState,
  RootState,
  getData,
} from '../store';
import './DataSelector.css';

const { CheckableTag } = Tag;

type DatasetType = SelectedDataType;

const dataNames = ['train', 'test'] as DatasetType[];

export interface DataSelectorStateProp {
  selectedDataNames: Set<DatasetType>;
  dataBase: DataBaseState;
}

const mapStateToProps = (state: RootState): DataSelectorStateProp => {
  return {
    selectedDataNames: new Set(getSelectedDataNames(state)),
    dataBase: getData(state),
  };
};
export interface DataSelectorDispatchProp {
  selectData: (names: DatasetType[]) => SelectDatasetAction;
  loadData: (datasetName: string, isTrain: boolean) => Dispatch;
}

const mapDispatchToProps = (dispatch: Dispatch, ownProps: any): DataSelectorDispatchProp => {
  return {
    // loadModel: bindActionCreators(getModel, dispatch),
    selectData: (names: DatasetType[]): SelectDatasetAction => dispatch(selectDataset(names)),
    loadData: (datasetName: string, isTrain: boolean): Dispatch =>
      dispatch(fetchDatasetIfNeeded({ datasetName, isTrain }))
  };
};

export interface DataSelectorProps extends DataSelectorStateProp, DataSelectorDispatchProp {
  datasetName: string;
  key: string;
}

export interface DataSelectorState {

}

class DataSelector extends React.Component <DataSelectorProps, DataSelectorState> {
  constructor(props: DataSelectorProps) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }
  componentDidMount() {
    this.props.loadData(this.props.datasetName, true);
    this.props.loadData(this.props.datasetName, false);
  }
  render() {
    return (
      <div style={{ paddingLeft: 24 }}>
      {dataNames.map((dataName: DatasetType, i: number) => {
        return (
          <CheckableTag 
            key={i} 
            checked={this.props.selectedDataNames.has(dataName)} 
            onChange={(checked: boolean) => this.onChange(dataName, checked)}
          >
            {dataName}
          </CheckableTag>
        );
      })}
      </div>
    );
  }

  onChange = (dataName: DatasetType, checked: boolean) => {
    // do shallow copy
    const selectedDataNames = new Set(this.props.selectedDataNames);
    if (checked) selectedDataNames.add(dataName);
    else selectedDataNames.delete(dataName);
    this.props.selectData([...selectedDataNames]);
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DataSelector);