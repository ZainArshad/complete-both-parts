import React, { useEffect } from 'react';
import styles from '../../styles/GraphFrame.module.css';
import html2canvas from 'html2canvas';

const GraphFrame = (props) => {
  const { id, setSelectedGraph, selected, handleDelete } = props;

  useEffect(() => {
    if (selected) {
      handleClick();
    }
  }, [selected]);



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

  const takeshot=(id) =>{
    var svgElements = document.body.querySelectorAll('svg');
    svgElements.forEach(function(item) {
      item.setAttribute("width", item.getBoundingClientRect().width);
      item.setAttribute("height", item.getBoundingClientRect().height);
      item.style.width = null;
      item.style.height= null;
    });


    let div1 =
      document.getElementById(`frame-${id}`);
    html2canvas(div1).then(
      function (canvas) {
        saveAs(canvas.toDataURL(), 'canvas.png');
        // document
        //   .getElementById('out')
        //   .appendChild(canvas);
      })}


  const handleClick = () => {
    document.querySelector(`.${styles.highlight}`)?.classList.remove(styles.highlight);
    document.querySelector(`#frame-${id}`).classList.add(styles.highlight);
    setSelectedGraph(id);
  };

  return (
    <div className={styles.graphFrame} id={`frame-${id}`} onClick={handleClick}>
      <div className={styles.frameHeader}>
        <h2 className={styles.title}>Chart Title</h2>
        <button onClick={() => takeshot( id )}>Save Image</button>
        <button className={styles.deleteGraph} onClick={() => handleDelete({ id })}>
          X
        </button>
      </div>
      <div className={styles.wrapper}>{props.children}</div>
      <div className={styles.descriptionDiv}>
        <p className={styles.description}>
          Description: This is a graph using mock data. Upload your own and start playing around!
        </p>
      </div>
    </div>
  );
};

export default GraphFrame;
