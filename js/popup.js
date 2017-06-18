function getRadios() {
	return chrome.extension.getBackgroundPage().getRadios();
}

function getCurrentRadio() {
	return chrome.extension.getBackgroundPage().getCurrentRadio();
}
function setCurrentRadio(currentRadio) {
	chrome.extension.getBackgroundPage().setCurrentRadio(currentRadio);
}

function getAudio() {
	return chrome.extension.getBackgroundPage().getAudio();
}

function isStalledAudio() {
	return chrome.extension.getBackgroundPage().isStalledAudio();
}

function setStalledAudio(stalledAudio) {
	chrome.extension.getBackgroundPage().setStalledAudio(stalledAudio);
}

(function createRadiosDOM() {

	for (var i = 0, leng = getRadios().length; i < leng; i++) {
		// create main <a> element
		var aElement = $(document.createElement('a'));
		aElement.addClass("radio-item list-group-item");

		// create <i> element for the icon
		var iElement = $(document.createElement('i'));

		// check if current radio played, loaded or not
		if(getCurrentRadio() == getRadios()[i] && !getAudio().paused) {
			if(!getAudio().readyState || isStalledAudio()) {
				iElement.addClass("radio-item-icon fa fa-refresh fa-spin fa-fw");
			} else {
				iElement.addClass("radio-item-icon fa fa-volume-up");
			}
		} else {
			iElement.addClass("radio-item-icon fa fa-play");
		}
		iElement.attr("aria-hidden", "true");

		if(getCurrentRadio() == getRadios()[i]) {
			aElement.addClass("active");
		}

		// append <i> to <a>
		aElement.append(iElement);

		// create <b> element for the name of Radio
		// append the current name of radio in it
		var bElement = $(document.createElement('b'));
		// we've added a space so that the icon and the name don't stuck
		bElement.append(" " + getRadios()[i].name);

		// add click listener to current item
		aElement.bind("click", clickPlay);

		// append <b> to <a>
		aElement.append(bElement);

		// finish him !
		$("#radio-list").append(aElement);
	}

	// Set main button
	if (getAudio().paused) {
		setPlayBtn();
	} else {
		setStopBtn();
	}

	// set backward button event
	$("#backward-button").click(function () {
		clickBackward();
	});

	// set forward button event
	$("#forward-button").click(function () {
		clickForward();
	});

	// set last volume selected by user
	$("#volume").val(getVolume());
	// add event to change volume
	$("#volume").change(function() {
		setVolume($(this).val());
	});
	// select the played radio
	selectCurrentRadio();

	// stop focus on the first button (backward)
	$("#backward-button").focus(function() {
		$( this ).blur();
	});

	getAudio().addEventListener("stalled", onStalled);
	getAudio().addEventListener("loadeddata", onLoadedData);
	getAudio().addEventListener("timeupdate", onTimeUpdate);
})();

function onLoadedData() {
	if(!getAudio().paused) {
		$("#radio-list").children('.active').children('i').removeClass().addClass("radio-item-icon fa fa-volume-up");
	} else {
		$("#radio-list").children('.active').children('i').removeClass().addClass("radio-item-icon fa fa-play");
	}
}

function onTimeUpdate() {
	if (isStalledAudio()) {
		setStalledAudio(false);
		$(".radio-item.list-group-item.active").find(".fa-refresh").removeClass("fa-refresh fa-spin fa-fw").addClass("fa-volume-up");
	}
}

function onStalled() {
	setStalledAudio(true);
	$(".radio-item.list-group-item.active").find(".fa-volume-up").removeClass("fa-volume-up").addClass("fa-refresh fa-spin fa-fw");
}

function scrollToCurrentRadio() {
	var container = $('#radio-list'), scrollTo = $('.radio-item.active');

	container.scrollTop(
		scrollTo.offset().top - container.offset().top + container.scrollTop()
	);

	$('#radio-list').animate({
		scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
	}, 50);
}

function displayCurrentRadio() {
	$("#current-radio-header").text(getCurrentRadio().name);
	$("#current-radio-img").attr("src", getCurrentRadio().icon);
}

function selectCurrentRadio() {
	displayCurrentRadio();
	scrollToCurrentRadio();
}

function setPlayBtn() {
	$("#main-button").children('i').removeClass().addClass("fa fa-play");
	// remove all event attached to the button
	$("#main-button").unbind();
	$("#main-button").click(function () {
		clickPlay();
	});
}

function setStopBtn() {
	$("#main-button").children('i').removeClass().addClass("fa fa-stop");
	// remove all event attached to the button
	$("#main-button").unbind();
	$("#main-button").click(function () {
		clickStop();
	});
}

function clickPlay() {
	// get the last children of <a> element
	// which will be the <b> element that contains the name of radio
	var radioName = $(this).children(':last').text();

	if(getCurrentRadio().name != radioName && $(this).is('a')) {
		$("#radio-list").children('a').removeClass("active");

		// add "active" class to the clicked item list
		$(this).addClass("active");

		// get the info of the
		$.each(getRadios(), function (i, v) {
			if (v.name == radioName.trim()) {
				setCurrentRadio(getRadios()[i]);
				return;
			}
		});
		selectCurrentRadio();
	}
	play();
}

function clickStop() {
	stop();
}

function clickBackward(){
	var indexCurrentRadio = getRadios().indexOf(getCurrentRadio());
	var indexPreviousRadio = indexCurrentRadio == 0 ? getRadios().length-1 : indexCurrentRadio - 1;
	var newCurrentRadio = getRadios()[indexPreviousRadio];

	setCurrentRadio(newCurrentRadio);

	if(indexCurrentRadio === 0) {
		$(".radio-item.active").removeClass("active");
		$(".radio-item").last().addClass("active");
	} else {
		$(".radio-item.active").removeClass("active").prev().addClass("active");
	}

	selectCurrentRadio();
	play();
}

function clickForward() {
	var indexCurrentRadio = getRadios().indexOf(getCurrentRadio());
	var indexNextRadio = indexCurrentRadio == getRadios().length-1 ? 0 : indexCurrentRadio + 1;
	var newCurrentRadio = getRadios()[indexNextRadio];

	setCurrentRadio(newCurrentRadio);

	if(indexCurrentRadio === getRadios().length -1) {
		$(".radio-item.active").removeClass("active");
		$(".radio-item").first().addClass("active");
	} else {
		$(".radio-item.active").removeClass("active").next().addClass("active");
	}

	selectCurrentRadio();
	play();
}

function getVolume() {
	if(getAudio().volume == 0) {
		$("#volume-icon").removeClass().addClass("fa fa-volume-off");
	} else if (getAudio().volume < 0.5) {
		$("#volume-icon").removeClass().addClass("fa fa-volume-down");
	} else {
		$("#volume-icon").removeClass().addClass("fa fa-volume-up");
	}

	return getAudio().volume * 100;
}

function setVolume(volume) {
	if(volume == 0) {
		$("#volume-icon").removeClass().addClass("fa fa-volume-off");
	} else if (volume < 50) {
		$("#volume-icon").removeClass().addClass("fa fa-volume-down");
	} else {
		$("#volume-icon").removeClass().addClass("fa fa-volume-up");
	}

	getAudio().volume = volume / 100;
}

function play() {
	var stream = getCurrentRadio().stream;
	var audio = getAudio();
	if((audio.src == stream && audio.paused) || audio.src !== stream) {
		stop();
		audio.src = stream;
		audio.play();
		// to change
		$("#radio-list").children('.active').children('i').removeClass("fa-play").addClass("fa fa-refresh fa-spin fa-fw");
		setStopBtn();
	}
}

function stop() {
	if (!getAudio().paused) {
		getAudio().pause();
		// for user interaction
		$(".radio-item").children('i').removeClass().addClass("radio-item-icon fa fa-play");
		setPlayBtn();
	}
}