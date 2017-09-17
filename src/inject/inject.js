var clickedEl = null;

document.body.style.position="relative";

document.addEventListener("mousedown", function(event){
	//right click
	if(event.button == 2) {
		clickedEl = event.target;
	}
}, true);


var defaultPosition = 'center';
var defaultFontSize = 'medium';
var selectedTextType, selectedText;
var memeOptionSelected = false;

var memeOptions = {
	'top': {
		'size': defaultFontSize,
		'pos': defaultPosition
	},
	'bottom': {
		'size': defaultFontSize,
		'pos': defaultPosition
	}
};

function setMemeOptionsBoxPosition(memeOptionsBox) {
	memeOptionsBox.style.top = (selectedTextType === 'bottom' ? selectedText.offsetTop - memeOptionsBox.offsetHeight - 10: selectedText.offsetTop + selectedText.offsetHeight) + 'px';
}


function adjustHeight(el, minHeight) {
	// compute the height difference which is caused by border and outline
	var outerHeight = parseInt(window.getComputedStyle(el).height, 10);
	var diff = outerHeight - el.clientHeight;

	// set the height to 0 in case of it has to be shrinked
	el.style.height = 0;

	// set the correct height
	// el.scrollHeight is the full height of the content, not just the visible part
	el.style.height = Math.max(minHeight, el.scrollHeight + diff) + 'px';
}

function setMemeTextHeight(memeText) {
	// we adjust height to the initial content
	memeText.style.height = 0;
	memeText.minHeight = memeText.scrollHeight;
	adjustHeight(memeText, memeText.minHeight);
}

function showMemeOptionsBox(memeOptionsBox) {
	memeOptionsBox.style.display = 'block';
	memeOptionsBox.setAttribute('type', selectedTextType);
}

function hideMemeOptionsBox(memeOptionsBox) {
	memeOptionsBox.style.display = 'none';
}

function setMemeOptionsBox(optionType, memeOptionsBox) {
	var memeGroupOptions = memeOptionsBox.querySelectorAll('[data-' + optionType + ']');
	[].forEach.call(memeGroupOptions, function (memeGroupOption) {
		memeGroupOption.classList.remove('selected');
		if (memeGroupOption.getAttribute('data-' + optionType) === memeOptions[selectedTextType][optionType]) {
			memeGroupOption.classList.add('selected');
		}
	});
}

function setMemeBoxOption(memeOptionsBox) {
	['size', 'pos'].forEach(function (optionType) {
		setMemeOptionsBox(optionType, memeOptionsBox);
	});
}

function setMemeBoxContent(memeBox) {
	var memeTexts = memeBox.querySelectorAll('.js-meme-text');
	var memeOptionsBox = memeBox.querySelector('.js-meme-options');
	var memePosBtns = memeBox.querySelectorAll('.js-pos-btn');
	var memeSizeBtns = memeBox.querySelectorAll('.js-size-btn');
	var memeDownloadBtn = memeBox.querySelector('.js-download-meme');
	var memeCancelBtn = memeBox.querySelector('.js-cancel-meme');
	var memeBoxOverlay = document.querySelector('.js-meme-box-overlay');

	[].forEach.call(memeTexts, function (memeText) {
		memeText.setAttribute('data-pos', defaultPosition);
		memeText.setAttribute('data-size', defaultFontSize);

		setMemeTextHeight(memeText);

		memeText.addEventListener('input', function () {
			adjustHeight(this, this.minHeight);
			setMemeOptionsBoxPosition(memeOptionsBox);
		});

		memeText.addEventListener('focus', function () {
			var type = this.getAttribute('data-type');
			memeText.classList.add('selected');
			selectedTextType = type;
			selectedText = memeText;
			setMemeBoxOption(memeOptionsBox);
			showMemeOptionsBox(memeOptionsBox);
			setMemeOptionsBoxPosition(memeOptionsBox);
		});

		memeText.addEventListener('blur', function (e) {
			if(!memeOptionSelected) {
				memeText.classList.remove('selected');
				hideMemeOptionsBox(memeOptionsBox);
			}
		});
	});

	[].forEach.call(memePosBtns, function (memePosBtn) {
		memePosBtn.addEventListener('mousedown', function () {
			memeOptionSelected = true;
			var position = this.getAttribute('data-pos');
			console.log(position);
			selectedText.setAttribute('data-pos', position);
			memeOptions[selectedTextType]['pos'] = position;
			setMemeOptionsBox('pos', memeOptionsBox);
			setTimeout(function () {
				selectedText.focus();
			}, 0);
		});

		memePosBtn.addEventListener('mouseout', function (e) {
			memeOptionSelected = false;
		});
	});

	[].forEach.call(memeSizeBtns, function (memeSizeBtn) {
		memeSizeBtn.addEventListener('mousedown', function () {
			memeOptionSelected = true;
			var fontSize = this.getAttribute('data-size');
			console.log(fontSize);
			selectedText.setAttribute('data-size', fontSize);
			memeOptions[selectedTextType]['size'] = fontSize;
			setMemeOptionsBox('size', memeOptionsBox);
			setMemeTextHeight(selectedText);
			setMemeOptionsBoxPosition(memeOptionsBox);
			setTimeout(function () {
				selectedText.focus();
			}, 0);
		});

		memeSizeBtn.addEventListener('mouseout', function (e) {
			memeOptionSelected = false;
		});
	});

	memeCancelBtn.addEventListener('click', function () {
		memeBoxOverlay.parentNode.removeChild(memeBoxOverlay);
		memeBox.parentNode.removeChild(memeBox);
	});

	memeDownloadBtn.addEventListener('click', function () {

		chrome.runtime.sendMessage({msg: 'love charger'}, function (response) {
			console.log('done');
		});

		/*function onImgLoad(image) {
			var c = document.createElement('canvas');
			var iframeBounds = memeBox.getBoundingClientRect();
			c.width = iframeBounds.width;
			c.height = iframeBounds.height;
			var ctx = c.getContext('2d');
			ctx.drawImage(
				image,
				iframeBounds.left,
				iframeBounds.top,
				iframeBounds.width,
				iframeBounds.height,
				0,
				0,
				iframeBounds.width,
				iframeBounds.height
			);
			image.removeEventListener('load', onImgLoad);
			document.body.appendChild(c);
		}

		chrome.tabs.captureVisibleTab(
			null,
			{format: 'png', quality: 100},
			function (dataURI) {
				if (dataURI) {
					var image = new Image();
					image.src = dataURI;
					image.addEventListener('load', function () {
						onImgLoad(image, dataURI)
					});
				}
			}
		);*/
	});
}

function makeMemeBox(){
	var bodyRect = document.body.getBoundingClientRect(),
		clickedElRect = clickedEl.getBoundingClientRect(),
		clickedElWidth = clickedElRect.width,
		clickedElHeight = clickedElRect.height,
		clickedElOffsetTop   = clickedElRect.top - bodyRect.top,
		clickedElOffsetLeft   = clickedElRect.left - bodyRect.left;

	var memeBox = document.createElement('div');
	memeBox.classList.add('js-meme-box','meme');
	memeBox.style.width = clickedElWidth + 'px';
	memeBox.style.height = clickedElHeight + 'px';
	memeBox.style.backgroundImage = 'url("' + clickedEl.src + '")';
	/*memeBox.style.top = clickedElOffsetTop + 'px';
	memeBox.style.left = clickedElOffsetLeft + 'px';*/

	memeBox.innerHTML =
		'<textarea rows="1" spellcheck="false" title="Click here to change text" class="meme-text js-meme-text" tabindex="-1" data-type="top">Top Text</textarea> ' +
		'<textarea rows="1" spellcheck="false" title="Click here to change text" class="meme-text  js-meme-text" tabindex="-1" data-type="bottom">Bottom Text</textarea>' +
		'<div id="meme-options" class="js-meme-options">' +
			'<div class="btn js-pos-btn" data-pos="left">L</div>' +
			'<div class="btn js-pos-btn" data-pos="center">C</div>' +
			'<div class="btn js-pos-btn" data-pos="right">R</div>' +
			'<div class="btn js-size-btn" data-size="xsmall">XS</div>' +
			'<div class="btn js-size-btn" data-size="small">S</div>' +
			'<div class="btn js-size-btn" data-size="medium">M</div>' +
			'<div class="btn js-size-btn" data-size="large">L</div>' +
			'<div class="btn js-size-btn" data-size="xlarge">XL</div>' +
		'</div>' +
		'<div class="js-download-meme download-meme">' +
			'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" width="512px" height="512px" viewBox="0 0 433.5 433.5" style="enable-background:new 0 0 433.5 433.5;" xml:space="preserve">' +
				'<g id="icon-download">' +
					'<path d="M395.25,153h-102V0h-153v153h-102l178.5,178.5L395.25,153z M38.25,382.5v51h357v-51H38.25z"/>' +
				'</g>' +
			'</svg>' +
		'</div>' +
		'<div class="js-cancel-meme cancel-meme">' +
			'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 47.971 47.971" style="enable-background:new 0 0 47.971 47.971;" xml:space="preserve" width="512px" height="512px">' +
				'<g id="icon-cancel">' +
					'<path d="M28.228,23.986L47.092,5.122c1.172-1.171,1.172-3.071,0-4.242c-1.172-1.172-3.07-1.172-4.242,0L23.986,19.744L5.121,0.88   c-1.172-1.172-3.07-1.172-4.242,0c-1.172,1.171-1.172,3.071,0,4.242l18.865,18.864L0.879,42.85c-1.172,1.171-1.172,3.071,0,4.242   C1.465,47.677,2.233,47.97,3,47.97s1.535-0.293,2.121-0.879l18.865-18.864L42.85,47.091c0.586,0.586,1.354,0.879,2.121,0.879   s1.535-0.293,2.121-0.879c1.172-1.171,1.172-3.071,0-4.242L28.228,23.986z"/>' +
				'</g>' +
			'</svg>' +
		'</div>';

	document.body.appendChild(memeBox);

	var memeBoxOverlay = document.createElement('div');
	memeBoxOverlay.classList.add('js-meme-box-overlay', 'meme-box-overlay');
	document.body.appendChild(memeBoxOverlay);

	setMemeBoxContent(memeBox);
}

chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
	/* If the received message has the expected format... */
	if (msg.text && (msg.text == "report_back")) {

		clickedEl.setAttribute('text','invaded');

		makeMemeBox();

		/* Call the specified callback, passing
		 the web-pages DOM content as argument */
		sendResponse({ele: clickedEl.innerHTML});
		return true;
	}
});