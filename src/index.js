import ReactDOM from 'react-dom';
import React, {useState, useEffect} from 'react';
import Cropper from 'cropperjs';
import debounce from 'lodash/debounce';
import './ProfileImageWatermarker.css';
import '../node_modules/cropperjs/dist/cropper.css'
const watermark = require('watermarkjs')


const watermarkOptions = ['/watermarks/yang1.png','/watermarks/yang2.png','/watermarks/yang3.png']
let cropper = ''

function ProfileImageWatermarker() {
  const [selectedWatermark, setSelectedWatermark] = useState(0);
  const [watermarkLevel, setWatermarkLevel] = useState(0.85);

  const changeWaterMark = (e) => {
    setSelectedWatermark(parseInt(e.target.id))
  }

useEffect( () => {
    buildCropper();
  },[]);

  const buildCropper = () => {
    let cropBox = document.querySelector('#cropImage')
    let cropPreview = document.querySelector('#cropPreview')
    cropper = new Cropper(cropBox, {
        aspectRatio: 1,
        minCropBoxWidth: 100,
        dragMode: 'move',
        cropBoxMovable: false,
        crop: debounce(() => {
          let canvas = cropper.getCroppedCanvas()
          cropPreview.src = canvas.toDataURL('image/png')
        }, 5)
      });
  }

  const buildWatermarkOptions = watermarkOptions.map( (i,j) => {
      return <img className='watermarkOption' id={`${j}watermarkChoice`} key={`watermarkoption${j}`} alt={i} src={process.env.PUBLIC_URL + i} onClick={changeWaterMark} />
    })

  const makeCropper = (e) => {
      e.preventDefault()
      let upload = e.target.files;
      if(upload.length === 0) return;
      let cropBox = document.querySelector('#cropImage');

      if(!upload[0].name.endsWith('.jpg') && !upload[0].name.endsWith('.png')) {
        alert('Please select a .jpg or .png file.')
        return
      }

      cropper.destroy()

      let reader = new FileReader();
      reader.onload = r => {
          cropBox.alt= 'Image Editor Canvas'
          cropBox.src = r.target.result;
          buildCropper();
          };
          cropBox.alt= 'Loading Image...'
          cropBox.src = '';
      reader.readAsDataURL(upload[0]);
  };

  const downloadImage = (e) => {
    e.preventDefault()
    let cropSelection = cropper.getCroppedCanvas({
      //width: 512, //doesn't work??
      minWidth: 512,
      maxWidth: 512,
    }).toDataURL()
    watermark([cropSelection, process.env.PUBLIC_URL + watermarkOptions[selectedWatermark]])
      .dataUrl(watermark.image.center(watermarkLevel))
      .then(function (url) {
    downloadHelper('YANG2020', url)
      });
    }

    const downloadHelper = (filename, file) => {
     let tempElement = document.createElement('a');
     tempElement.setAttribute('href', file)
     tempElement.setAttribute('download', filename);
     tempElement.style.display = 'none';
     document.body.appendChild(tempElement);
     tempElement.click();
     document.body.removeChild(tempElement);
 }

  return (
    <div id='ProfileImageWatermarker'>
      <div id='watermarkOptions'>
        {buildWatermarkOptions}
      </div>
      <input id='photoUpload' type='file' accept='.png, .jpg' name='photo' onChange={makeCropper} />
      <div id='imageContainer'>
        <div className='cropBox'>
          <img id='cropImage' src={process.env.PUBLIC_URL + '/startImage.jpg'} alt='Editor Canvas' />
        </div>
        <div className='previewBox'>
          <img id='cropPreview' src={process.env.PUBLIC_URL + '/startImage.jpg'} alt='Cropped Preview' />
          <img id='cropWatermark' src={process.env.PUBLIC_URL + watermarkOptions[selectedWatermark]} style={ { opacity: watermarkLevel } } alt='Watermark Preview' />
        </div>
      </div>
      <div id='transparencySlider'/>
      <div id='downloadButton' onClick={downloadImage}>Download</div>
    </div>
  );
}

ReactDOM.render(<ProfileImageWatermarker />, document.getElementById('root'));
