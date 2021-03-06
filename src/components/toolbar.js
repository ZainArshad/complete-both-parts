import React, { useRef } from 'react';
import { connect } from 'react-redux';

import styles from '../../styles/Toolbar.module.css';
import Checkbox from './input/checkbox';
import Dropdown from './input/dropdown';
import TextInput from './input/text-input';
import FileUpload from './input/file-upload';


import {
  AVAILABLE_Y_FORMATS,
  AVAILABLE_X_FORMATS,
  AVAILABLE_Y_FORMATS_BAR,
  AVAILABLE_X_FORMATS_BAR,
  SCALE,
  AVAILABLE_GRAPHS,
  CURVE_TYPES,
  IS_CSV,
} from '../utility/constants';

import {
  setGraphType,
  setGrid,
  unsetGrid,
  setColorScheme,
  setSpecificColor,
  setXVal,
  setXFormat,
  setYVal,
  setYFormat,
  setCurveType,
  setData,
  setXLabel,
  setYLabel,
  addGraph,
  setHighestId,
  setSelectedGraph,
  setHorizontal,
  unsetHorizontal,
  setBackfill,
  unsetBackfill,
  addDataPlot,
  setPointShape,
} from '../redux/actions/toolbar-action';
import { getCurrentConfig, getHighestId, getCurrentData } from '../redux/reducer/graph-reducer';
import { handleCSVIinputFile, handleJSONIinputFile } from './input/input-utility';
import { addDays } from '../utility/svg';

const Toolbar = (props) => {
  const fileUploadInput = useRef(null);
  const {
    setGraphType,
    config,
    data,
    setLabelForY,
    setLabelForX,
    setColorScheme,
    setSpecificColor,
    setYVal,
    setXVal,
    setGrid,
    unsetGrid,
    setYFormat,
    setXFormat,
    setCurveType,
    setHorizontal,
    unsetHorizontal,
    setBackfill,
    unsetBackfill,
    setData,
    addDataPlot,
    addGraph,
    highestId,
    setHighestId,
    setSelectedGraph,
    setPointShape,
    takeshot
  } = props;

  if (!config)
    return (
      <div className={styles.toolbarContainer}>
        Choose a graph to work on or create a new one!
        <button onClick={handleNewGraph} className={`${styles.buffer}`}>
          <p className={styles.plusSign}>+</p>
          <p className={styles.addNew}>Add New Graph</p>
        </button>
      </div>
    );

  const {
    id,
    grid,
    type,
    xLabel,
    yLabel,
    curveType,
    horizontal,
    backfill,
    yFormat,
    yVal,
    xFormat,
    xVal,
    colorScheme,
    dataPlots,
  } = config;

  const handleCheckbox = (property, onChange, offChange) => {
    if (!property) {
      return onChange({ id });
    } else {
      return offChange({ id });
    }
  };

  const handleSetLabelCheckbox = (coord) => {
    if (coord == SCALE.X) {
      return xLabel.display
        ? setLabelForX({ display: false, value: '' })
        : setLabelForX({ display: true, value: '' });
    } else {
      return yLabel.display
        ? setLabelForY({ display: false, value: '' })
        : setLabelForY({ display: true, value: '' });
    }
  };

  const handleSetLabelInput = (ev, coord) => {
    if (coord == SCALE.X) {
      return xLabel.display && setLabelForX({ display: true, value: ev.target.value });
    } else {
      return yLabel.display && setLabelForY({ display: true, value: ev.target.value });
    }
  };

  const handleCurveChange = (curve) => {
    return setCurveType({ id, curveType: curve });
  };

  function handleFileUpload(ev) {
    const reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(ev.target.files[0]);
  }

  function onReaderLoad(ev) {
    const inputFileType = fileUploadInput.current.value;
    let uploadedData;
    if (IS_CSV.test(inputFileType)) {
      uploadedData = handleCSVIinputFile(ev.target.result);
    } else {
      uploadedData = handleJSONIinputFile(ev.target.result);
    }
    return setData({ id, data: uploadedData });
  }

  const handleNewGraph = () => {
    const newID = highestId + 1;
    addGraph({ id: newID });
    setData({ id: newID });
    setHighestId(newID);
    setSelectedGraph(newID);
    document.querySelector('.highlight')?.classList.remove('highlight');
  };

// const componentRef = useRef();

  return (
    <div className={styles.toolbarContainer}>
      <div className={`${styles.column} ${styles.buffer}`}>
        <Dropdown
          labelText={'Type of Graph:'}
          changeHandler={(type) => setGraphType({ id, type })}
          options={AVAILABLE_GRAPHS}
          type={type}
          defaultValue={type}
        />
        <FileUpload
          labelText={'Upload File'}
          ref={fileUploadInput}
          className={'file-input'}
          changeHandler={(ev) => handleFileUpload(ev)}
        />
      </div>
      <div className={`${styles.column} ${styles.buffer}`}>
        <div className={styles.pair}>
          <Dropdown
            labelText={'Choose X Scale: '}
            changeHandler={(format) => setXFormat({ id, xFormat: format })}
            options={type == 'bar' ? AVAILABLE_X_FORMATS_BAR : AVAILABLE_X_FORMATS}
            type={type}
            defaultValue={xFormat}
          />
        </div>
        <div className={styles.pair}>
          <Dropdown
            labelText={'Choose Y Scale: '}
            changeHandler={(format) => setYFormat({ id, yFormat: format })}
            options={type == 'bar' ? AVAILABLE_Y_FORMATS_BAR : AVAILABLE_Y_FORMATS}
            type={type}
            defaultValue={yFormat}
          />
        </div>
      </div>
      {dataPlots.map((dataPlot, i, arr) => {
        return (
          <div
            className={`${styles.column} ${styles.smallBuffer} ${styles.rightAlign}`}
            key={`plot-${i}`}
          >
            <Dropdown
              labelText={i == 0 ? 'Choose X Parameter:' : `${i + 1} X: `}
              changeHandler={(val) => setXVal({ id, dataPlotID: i, xVal: val })}
              options={data}
              type={type}
              getAllKeys={true}
              specialObject={true}
              defaultValue={dataPlot.xVal}
              key={`x-param-${i}`}
            />
            <Dropdown
              labelText={i == 0 ? 'Choose Y Parameter:' : `${i + 1} Y: `}
              changeHandler={(val) => setYVal({ id, dataPlotID: i, yVal: val })}
              options={data}
              type={type}
              specialObject={true}
              defaultValue={dataPlot.yVal}
              key={`y-param-${i}`}
            />
            {arr.length > 1 && type != 'bar' && (
              <Dropdown
                labelText={'Color:'}
                changeHandler={(color) => setSpecificColor({ id, dataPlotID: i, color })}
                options={['blue', 'green', 'black', 'red']}
                type={type}
                default={colorScheme}
                key={`color-${i}`}
              />
            )}
            {arr.length > 1 && type == 'point' && (
              <Dropdown
                labelText={'Shape:'}
                changeHandler={(shape) => setPointShape({ id, dataPlotID: i, shape })}
                options={['circle', 'triangle', 'square', 'cross', 'diamond']}
                type={type}
              />
            )}
          </div>
        );
      })}
      <div className={`${styles.column} ${styles.buffer}`}>
        <br/>
         <button onClick={() => addDataPlot({ id })}>Add Other Plot</button>
          <br/>
        <button onClick={takeshot}>Export as PNG</button>
        <Checkbox
          labelText={'Grid'}
          checked={grid}
          changeHandler={() => handleCheckbox(grid, setGrid, unsetGrid)}
        />
        {type == 'bar' ? (
          <Checkbox
            labelText={'Horizontal'}
            checked={horizontal}
            changeHandler={() => handleCheckbox(horizontal, setHorizontal, unsetHorizontal)}
          />
        ) : null}
        {type == 'bar' && horizontal ? (
          <Checkbox
            labelText={'Backfill'}
            checked={backfill}
            changeHandler={() => handleCheckbox(backfill, setBackfill, unsetBackfill)}
          />
        ) : null}
      </div>
      <div className={`${styles.column} ${styles.buffer}`}>
        {dataPlots.length < 2 ||
          (type == 'bar' && (
            <Dropdown
              labelText={'Select a Color Scheme:'}
              options={type == 'line' ? ['blue', 'green'] : ['blue', 'green', 'rainbow']}
              changeHandler={(color) => setColorScheme({ id, colorScheme: color })}
              defaultValue={colorScheme}
            />
          ))}
        {type === 'line' && (
          <Dropdown
            labelText={'Curve Type:'}
            changeHandler={handleCurveChange}
            options={CURVE_TYPES}
            defaultValue={curveType}
          />
        )}
      </div>
      <button onClick={handleNewGraph} className={`${styles.buffer}`}>
        <p className={styles.plusSign}>+</p>
        <p className={styles.addNew}>Add New Graph</p>
      </button>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    config: getCurrentConfig(state.graph),
    highestId: getHighestId(state.graph),
    data: getCurrentData(state.graph),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setGrid: (id) => dispatch(setGrid(id)),
    unsetGrid: (id) => dispatch(unsetGrid(id)),
    setColorScheme: (scheme) => dispatch(setColorScheme(scheme)),
    setSpecificColor: (color) => dispatch(setSpecificColor(color)),
    setLabelForX: (label) => dispatch(setXLabel(label)),
    setLabelForY: (label) => dispatch(setYLabel(label)),
    setGraphType: (type) => dispatch(setGraphType(type)),
    setYVal: (yVal) => dispatch(setYVal(yVal)),
    setYFormat: (format) => dispatch(setYFormat(format)),
    setXVal: (xVal) => dispatch(setXVal(xVal)),
    setXFormat: (format) => dispatch(setXFormat(format)),
    setCurveType: (curveType) => dispatch(setCurveType(curveType)),
    setHorizontal: (id) => dispatch(setHorizontal(id)),
    unsetHorizontal: (id) => dispatch(unsetHorizontal(id)),
    setBackfill: (id) => dispatch(setBackfill(id)),
    unsetBackfill: (id) => dispatch(unsetBackfill(id)),
    setData: (data) => dispatch(setData(data)),
    addGraph: (id) => dispatch(addGraph(id)),
    addDataPlot: (id) => dispatch(addDataPlot(id)),
    setHighestId: (id) => dispatch(setHighestId(id)),
    setSelectedGraph: (id) => dispatch(setSelectedGraph(id)),
    setPointShape: (shape) => dispatch(setPointShape(shape)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
