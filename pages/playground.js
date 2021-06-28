import React,  {useRef,createRef, useState} from 'react';
import { connect } from 'react-redux';

import styles from '../styles/Home.module.css';

import { getCurrentConfig, getAllIdAndType } from '../src/redux/reducer/graph-reducer';
import Toolbar from '../src/components/toolbar';
import GraphFrame from '../src/components/graph-frame';
import BarChart from '../src/components/bar-chart';
import PointChart from '../src/components/point-chart';
import LineChart from '../src/components/line-chart';
import { setSelectedGraph } from '../src/redux/actions/toolbar-action';
import { deleteGraph } from '../src/redux/actions/bar-action';
import html2canvas  from 'html2canvas';

const Playground = React.forwardRef((props,ref) => {
  const { allIdAndType, setSelectedGraph, deleteGraph } = props;


  const saveAs=(uri, filename) =>{
    var link = document.createElement('a');
    if (typeof link.download === 'string') {
      link.href = uri;
      link.download = filename;

      //Firefox requires the link to be in the body
      document.body.appendChild(link);

      //simulate click
      link.click();

      //remove the link when done
      document.body.removeChild(link);
    } else {
      window.open(uri);
    }
  }

  const createGraph = (type, id) => {
    switch (type) {
      case 'bar': {
        return <BarChart  key={id} id={id} />;
      }
      case 'line': {
        return <LineChart  key={id} id={id} />;
      }

      case 'point': {
        return <PointChart  key={id} id={id} />;
      }

      default: {
        return <BarChart key={id} id={id} />;
      }
    }
  };

  const takeshot=() =>{
    var svgElements = document.body.querySelectorAll('svg');
    svgElements.forEach(function(item) {
      item.setAttribute("width", item.getBoundingClientRect().width);
      item.setAttribute("height", item.getBoundingClientRect().height);
      item.style.width = null;
      item.style.height= null;
    });


    let div1 =
      document.getElementById('photo');
    html2canvas(div1).then(
      function (canvas) {
        saveAs(canvas.toDataURL(), 'canvas.png');
        // document
        //   .getElementById('out')
        //   .appendChild(canvas);
      })}

  const renderGraphs = (allIdAndType) => {
    return allIdAndType.map((el, i, arr) => {
      let selected = false;
      if (i == arr.length - 1) selected = true;
      return (
        <GraphFrame
          key={`frame-${el.id}`}
          id={el.id}
          setSelectedGraph={setSelectedGraph}
          handleDelete={deleteGraph}
          selected={selected}
        >
          {createGraph(el.type, el.id)}
        </GraphFrame>
      );
    });
  };


  return (
    <>
      <div className="playground-container">
        <Toolbar takeshot={takeshot} />
        <div id="photo"  className="graph-playground">{renderGraphs(allIdAndType)}</div>
      </div>
    </>
  );
});

const mapStateToProps = (state) => {
  return {
    config: getCurrentConfig(state.graph),
    allIdAndType: getAllIdAndType(state.graph),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setSelectedGraph: (id) => dispatch(setSelectedGraph(id)),
    deleteGraph: (id) => dispatch(deleteGraph(id)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Playground);
