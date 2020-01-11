import ReactDOM from 'react-dom';
import React, {useState, useEffect} from 'react';
import Cropper from 'cropperjs';
import debounce from 'lodash/debounce';
import './ProfileImageWatermarker.css';
import '../node_modules/cropperjs/dist/cropper.css'
//const watermark = require('watermarkjs')

const watermarkOptions = ['/watermarks/yang1.png','/watermarks/yang2.png','/watermarks/yang3.png','/watermarks/yang4.png','/watermarks/yang5.png','/watermarks/yang6.png','/watermarks/yang7.png','/watermarks/yang8.png','/watermarks/yang9.png', '/watermarks/yang10.png']
let cropper = ''

function ProfileImageWatermarker() {
  const [currentDisplay, setcurrentDisplay] = useState(1);
  const [selectedWatermark, setSelectedWatermark] = useState(0);
  const [watermarkLevel, setWatermarkLevel] = useState(0.75);
  const [watermarkSize, setWatermarkSize] = useState(100);

  const outputSizeSmall = 128;
//  const outputSizeMedium = 256;
  const outputSizeLarge = 512;

  useEffect( () => {
        buildCropper();
        dragWatermark();
    },[]);

  const changeWaterMark = (e) => {
    setSelectedWatermark(parseInt(e.target.id))
  }
  const adjustWatermarkLevel = (e) => {
    setWatermarkLevel(e.target.value / 100)
  }
  const adjustWatermarkSize = (e) => {
    let watermarkTarget = document.getElementById("cropWatermark");
    let watermarkTargetInfo = document.getElementById("cropWatermark").getBoundingClientRect();
    let containerTargetInfo = document.getElementById('cropPreview').getBoundingClientRect();
    let containerDim = containerTargetInfo.width;
    let watermarkDim = containerDim * (watermarkSize/100);

    let yCenter = (watermarkTargetInfo.top - containerTargetInfo.top) + (watermarkDim/2);
    let xCenter = (watermarkTargetInfo.left - containerTargetInfo.left) + (watermarkDim/2);
      watermarkDim = containerDim * (e.target.value/100)
    let newYOffset = yCenter - (watermarkDim/2)
    let newXOffset = xCenter - (watermarkDim/2)
    watermarkTarget.style.top = newYOffset+'px';
    watermarkTarget.style.left = newXOffset+'px';

    setWatermarkSize(e.target.value)
  }

  const buildCropper = () => {
    let cropBox = document.getElementById('cropImage')
    let cropPreview = document.getElementById('cropPreview')
    cropper = new Cropper(cropBox, {
        aspectRatio: 1,
        minCropBoxWidth: 100,
        dragMode: 'move',
        cropBoxMovable: false,
        crop: debounce(() => {
          let canvas = cropper.getCroppedCanvas({
            minWidth: 512,
            imageSmoothingQuality: 'high'
          })
          cropPreview.src = canvas.toDataURL('image/png')
        }, 5)
      });
  }

  const buildWatermarkOptions = watermarkOptions.map( (i,j) => {
      return <img className={selectedWatermark === j ? 'watermarkOption selectedWatermark' : 'watermarkOption'} id={`${j}watermarkChoice`} key={`watermarkoption${j}`} alt={i} src={process.env.PUBLIC_URL + i} onClick={changeWaterMark} />
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

      cropBox.alt= 'Loading Image...'
      cropBox.src = '';
      let reader = new FileReader();
      reader.onload = r => {
          cropBox.alt= 'Image Editor Canvas'
          cropBox.src = r.target.result;
          buildCropper();
          };
      reader.readAsDataURL(upload[0]);
  };


  const createImage = (e, size) => {
    e.preventDefault()
    setcurrentDisplay(2)
    buildDownloadLinks('downloadLinkSmall',outputSizeSmall)
  //  buildDownloadLinks('downloadLinkMedium',outputSizeMedium)
    buildDownloadLinks('downloadLinkLarge',outputSizeLarge)
    };

  const buildDownloadLinks = (downloadLinkTarget, outputSize) => {
    let resultTarget = document.getElementById('resultImage');
    let backgroundImage = document.getElementById('cropPreview');
    let watermarkImage = document.getElementById('cropWatermark');
    let containerDim = document.getElementById('cropPreview').getBoundingClientRect().width;
    let watermarkYDim = watermarkImage.offsetTop * (outputSize/containerDim);
    let watermarkXDim = watermarkImage.offsetLeft * (outputSize/containerDim);

    resultTarget.setAttribute('width', outputSize);
    resultTarget.setAttribute('height', outputSize);
    resultTarget = resultTarget.getContext('2d');
    resultTarget.globalAlpha = 1;
    resultTarget.imageSmoothingQuality = 'high';
    resultTarget.drawImage(backgroundImage,
              0, 0, backgroundImage.naturalWidth, backgroundImage.naturalWidth,
              0, 0, outputSize, outputSize);
    resultTarget.globalAlpha = watermarkLevel;
    resultTarget.drawImage(watermarkImage,
             0, 0, 512, 512,
             watermarkXDim, watermarkYDim, outputSize*(watermarkSize/100), outputSize*(watermarkSize/100));

    resultTarget = document.getElementById('resultImage');
    let downloadAnchor = document.getElementById(downloadLinkTarget);
    downloadAnchor.setAttribute('href', resultTarget.toDataURL('image/png', 1.0));
    downloadAnchor.setAttribute('download', 'YANG2020');
  }

  const goBack = () => {
    document.getElementById('resultImage')
      .getContext('2d')
      .clearRect(0,0,outputSizeLarge,outputSizeLarge);
    setcurrentDisplay(1)
  };

  const dragWatermark = () => {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let watermarkTarget = document.getElementById("cropWatermark");
    watermarkTarget.onmousedown = startWatermarkDrag;
    watermarkTarget.ontouchstart = startWatermarkDrag;

    function startWatermarkDrag(e) {
      e.preventDefault();
      pos3 = e.clientX || e.targetTouches[0].clientX;
      pos4 = e.clientY || e.targetTouches[0].clientY;

      document.onmouseup = endWatermarkDrag;
      document.onmousemove = watermarkDrag;
      document.ontouchend = endWatermarkDrag;
      document.ontouchmove = watermarkDrag;
    }

    function watermarkDrag(e) {

      pos1 = e.clientX ? (pos3 - e.clientX) : (pos3 - e.targetTouches[0].clientX);
      pos2 = e.clientY ? (pos4 - e.clientY) : (pos4 - e.targetTouches[0].clientY);
      pos3 = e.clientX || e.targetTouches[0].clientX;
      pos4 = e.clientY || e.targetTouches[0].clientY;

      let watermarkDim = watermarkTarget.getBoundingClientRect().width;
      let containerDim = document.getElementById('cropPreview').getBoundingClientRect().width;
      let overtravel = watermarkTarget.width / 2;
      let maxDim = (containerDim - watermarkDim) + overtravel;
      let yOffset = (watermarkTarget.offsetTop - pos2) > maxDim ? maxDim+'px'
                  : (watermarkTarget.offsetTop - pos2) < - overtravel
                  ? -overtravel+'px'
                  : (watermarkTarget.offsetTop - pos2) + 'px';

      let xOffset = (watermarkTarget.offsetLeft - pos1) > maxDim ? maxDim+'px'
                  : (watermarkTarget.offsetLeft - pos1) < - overtravel
                  ? -overtravel+'px'
                  : (watermarkTarget.offsetLeft - pos1) + 'px';

      watermarkTarget.style.top = yOffset;
      watermarkTarget.style.left = xOffset;
    }

    const endWatermarkDrag = () => {
      document.onmouseup = null;
      document.onmousemove = null;
      document.ontouchend = null;
      document.ontouchmove = null;
    }
}

  return (
    <div id='ProfileImageWatermarker'>
      <header>
        <picture>
          <source media='(max-width: 749px)' srcSet={process.env.PUBLIC_URL + '/headerSmall.png'} />
          <source media='(min-width: 750px)' srcSet={process.env.PUBLIC_URL + '/headerLarge.png'} />
          <img src={process.env.PUBLIC_URL + '/headerLarge.png'} alt='Yang2020 Banner' />
        </picture>
      </header>

      <div id='infoContainer'>
        { currentDisplay === 1 &&
          <>
            <p>Show your support on social media with a Yang2020 watermarked avatar.</p>
            <label className='actionButton'>
              <h2><i className="fas fa-cloud-upload-alt"></i> UPLOAD</h2>
              <input id='photoUpload' type='file' accept='.png, .jpg' name='photo' onChange={makeCropper} hidden />
            </label>
          </>
        }
          <p style={ {'display': currentDisplay === 2 ? 'block' : 'none'} }>Download your new Yang2020 avatar and upload to your social platforms.</p>
        <div id='downloadButtonContainer' style={ {'display': currentDisplay === 2 ? 'flex' : 'none'} }>
          <a id='downloadLinkSmall' className='actionButton' href='empty' download=''>
            <h2><i className="fas fa-cloud-download-alt"></i> (128²)</h2>
          </a>
      {//    <a id='downloadLinkMedium' className='actionButton' href='empty' download='' >
      //      <h2><i className="fas fa-cloud-download-alt"></i> (256²)</h2>
      //    </a>
      }
          <a id='downloadLinkLarge' className='actionButton' href='empty' download='' >
            <h2><i className="fas fa-cloud-download-alt"></i> (512²)</h2>
          </a>
        </div>

      </div>
      <div id='headerContainer'>
        <h3 className='headerLeft'>{currentDisplay === 1 ? 'Drag/Zoom/Crop' : 'Upload your image:' }</h3>
        <h3 className='headerRight'>{currentDisplay === 1 ? 'Drag' : 'Result' }</h3>
      </div>
      <div id='imageContainer'>
        <div className={ currentDisplay === 1 ? 'cropBox' : 'cropBoxHide'} >
          <img id='cropImage' src={process.env.PUBLIC_URL + '/startImage.jpg'} alt='Editor Canvas' />
        </div>
        <div className='cropBox' style={ {'display': currentDisplay === 2 ? 'block' : 'none'} }>
          <ul>
            <li><a href='https://twitter.com/settings/profile' target='_blank' rel="noopener noreferrer"><i className="fab fa-twitter"></i> Twitter (Use: 512²)</a></li>
            <li><a href='https://facebook.com/settings/profile' target='_blank' rel="noopener noreferrer"><i className="fab fa-facebook-f"></i> Facebook (Use: ??)</a></li>
            <li><a href='https://support.discordapp.com/hc/en-us/articles/204156688-How-do-I-change-my-avatar-' target='_blank' rel="noopener noreferrer"><i className="fab fa-discord"></i> Discord (Use: 128²)</a></li>
            <li><a href='https://counter.social/settings/profile' target='_blank' rel="noopener noreferrer"><i className="fas fa-fire-extinguisher"></i> CounterSocial (512²)</a></li>
          </ul>
        </div>

        <div className='previewBox' style={ {'display': currentDisplay === 1 ? 'block' : 'none'} }>
          <img id='cropPreview' src={process.env.PUBLIC_URL + '/startImage.jpg'} alt='Cropped Preview' />
          <img id='cropWatermark' src={process.env.PUBLIC_URL + watermarkOptions[selectedWatermark]} style={ { opacity: watermarkLevel, width: watermarkSize+'%' } } alt='Watermark Preview' />
        </div>
        <div className='previewBox' style={ {'display': currentDisplay === 2 ? 'block' : 'none'} }>
          <canvas id="resultImage" alt='Final Preview' ></canvas>
        </div>

      </div>

      {currentDisplay === 1 &&
      <>
      <p className='optionInfoText'>Choose A Watermark:</p>
      <div id='watermarkOptions'>
         {buildWatermarkOptions}
      </div>
      </>
      }

      { currentDisplay === 1 &&
      <>
      <div id="watermarkSizeSlider">
        <input type="range" min="25" max="100" value={watermarkSize} className="slider" onInput={adjustWatermarkSize} />
        <p className='optionInfoText'>Watermark Size: {watermarkSize}%</p>
      </div>
      <div id="transparencySlider">
        <input type="range" min="10" max="100" value={Math.round(watermarkLevel * 100)} className="slider" onInput={adjustWatermarkLevel} />
        <p className='optionInfoText'>Watermark Transparency: {Math.round(watermarkLevel * 100)}%</p>
      </div>
      </>
      }
      <div className='navContainer'>
      { currentDisplay === 1 &&
        <div className='navButton' onClick={createImage}><p>CREATE <i className="far fa-hand-point-right"></i></p></div>
      }
      { currentDisplay === 2 &&
        <>
        <div className='navButton' onClick={goBack}><p><i className="far fa-hand-point-left"></i> BACK</p></div>
        </>
      }
      </div>
    </div>
  );
}

ReactDOM.render(<ProfileImageWatermarker />, document.getElementById('root'));
