var targets = $( '.target' );

var isDragging = false;
var dragOffset = {
	x: 0,
	y: 0
};
var lastZIndex = 100;
var fudgeFactor = 40;
var levelCount = 0;
var levelData;
var levelName = location.hash.substr( 1 ) || 'levels';
var confirmationMessage = 'Hooray! You spelled the word correctly!<br /><small>Click or tap anywhere to continue.</small>';
var finishMessage = 'You\'ve finished all of the levels!<br /><small>Click or tap anywhere to start over.</small>';

var clamp = function clamp( num, min, max ){
	if( num < min ){
		return min;
	}else if( num > max ){
		return max;
	}else{
		return num;
	}
};

var contains = function contains( elem1, elem2 ){
	if( !elem1 || !elem2 ){
		return false;
	}
	try{
		var x1 = $( elem1 ).offset().left;
		var y1 = $( elem1 ).offset().top;
		var width1 = $( elem1 ).outerWidth();
		var height1 = $( elem1 ).outerHeight();

		var x2 = $( elem2 ).position().left;
		var y2 = $( elem2 ).position().top;
		var width2 = $( elem2 ).outerWidth();
		var height2 = $( elem2 ).outerHeight();

		if( x2 > x1 - fudgeFactor &&
				x2 + width2 < x1 + width1 + fudgeFactor &&
				y2 > y1 - fudgeFactor &&
				y2 + height2 < y1 + height1 + fudgeFactor ){
			return true;			
		}else{
			return false;
		}
	}catch( e ){
		console.error( 'Error checking whether %o contains %o: %s', elem1, elem2, e );
	}
};

var intersects = function intersects( elem1, elem2 ){
	var x1 = $( elem1 ).offset().left;
	var y1 = $( elem1 ).offset().top;
	var width1 = $( elem1 ).outerWidth();
	var height1 = $( elem1 ).outerHeight();

	var x2 = $( elem2 ).position().left;
	var y2 = $( elem2 ).position().top;
	var width2 = $( elem2 ).outerWidth();
	var height2 = $( elem2 ).outerHeight();

	if( (
			( x2 > x1 - fudgeFactor && x2 < x1 + width1 + fudgeFactor ) ||
			( x2 + width2 > x1 - fudgeFactor && x2 + width2 < x1 + width1 + fudgeFactor )
		) && (
			( y2 > y1 - fudgeFactor && y2 < y1 + height1 + fudgeFactor ) ||
			( y2 + height2 > y1 - fudgeFactor && y2 + height2 < y1 + height1 + fudgeFactor )
		) ){
		return true;			
	}else{
		return false;
	}
};

var intersectsAny = function intersectsAny( elem, rivals ){
	var i, len;

	for( i = 0, len = rivals.length; i < len; i++ ){
		if( intersects( elem, rivals[ i ] ) ){
			return true;
		}
	}
	return false;
};

var isComplete = function isComplete(){
	if( $( '.letter.correct' ).length !== $( '.target' ).length ){
		return false;
	}

	if( levelCount < levelData.length - 1 ){
		popupConfirmation( confirmationMessage, function(){
			levelCount++;
			getNextWord( initializeLevel );
		});
	}else{
		popupConfirmation( finishMessage, function(){
			window.location.reload();
		});
	}
};

var popupConfirmation = function popupConfirmation( message, callback ){
	$( '<div>' )
		.addClass( 'overlay' )
		.css({
			width: $(window).width(),
			height: $(window).height()
		})
		.bind( 'touchstart click', function(){
			$('.overlay').remove();
			callback();
		})
		.appendTo( '#bspellContainer' );
	
	$( '<div>' )
		.addClass( 'popup' )
		.html( message )
		.appendTo( '.overlay' );
};

var getRandomPosition = function getRandomPosition( elem ){
	var width = $( window ).width();
	var height = $( window ).height();
	var newTop = Math.random() * height;
	var newLeft = Math.random() * width;

	newTop = clamp( newTop, 200, height - $( elem ).outerHeight() - 200 );
	newLeft = clamp( newLeft, 200, width - $( elem ).outerWidth() - 200 );
	return {
		x: newLeft,
		y: newTop
	}
};

var getRandomLetter = function getRandomLetter(){
	return String.fromCharCode( 97 + Math.round( Math.random() * 25 ) );	
};

var alignTargetSizes = function alignTargetSizes(){
	var maxWidth = 0;
	var maxHeight = 0;
	$( '.letter' ).each(function(){
		var thisWidth = $( this ).outerWidth();
		if( thisWidth > maxWidth ){
			maxWidth = thisWidth;
		}
		var thisHeight = $( this ).outerHeight();
		if( thisHeight > maxHeight ){
			maxHeight = thisHeight;
		}
	});
	$( '.target' ).each(function(){
		$(this).css({
			width: maxWidth,
			height: maxHeight
		});
	});
};

var getLevelData = function getLevelData( onComplete ){
	$.getJSON(
		levelName + '.json',
		null,
		function( data ){
			levelData = data;
			onComplete();
		}
	);
};

var getNextWord = function getNextWord( onComplete ){
	onComplete(
		levelData[ levelCount ].word,
		levelData[ levelCount ].extraLetters,
		levelData[ levelCount ].img,
		levelData[ levelCount ].text
	);
};

var getLetterHTML = function getLetterHTML( letter ){
	return '<div class="letter">' + letter + '</div>';
};
var getTargetHTML = function getTargetHTML( letter ){
	return '<div class="target"><span class="target-inner">' + letter + '</span></div>';
};

var initializeLevel = function initializeLevel( letters, dummyLetterCount, img, text ){
	var i, len;
	dummyLetterCount = dummyLetterCount || 0;
	var dummyLetter = getRandomLetter();
	var dummyLetters = [];

	$( '#letterContainer' ).empty();
	$( '#targetContainer' ).empty();

	for( i = 0, len = letters.length; i < len; i++ ){
		$( '#letterContainer' ).append( getLetterHTML( letters[ i ] ) );
		$( '#targetContainer' ).append( getTargetHTML( letters[ i ] ) );
	}

	for( i = 0; i < dummyLetterCount; i++ ){
		while( $.inArray( dummyLetter, letters ) !== -1 || $.inArray( dummyLetter, dummyLetters ) !== -1 ){
			dummyLetter = getRandomLetter();
		}
		dummyLetters.push( dummyLetter );
		$( '#letterContainer' ).append( getLetterHTML( dummyLetter ) );
	}

	$( '#bspellContainer img' ).remove();
	$( '#bspellContainer' ).append( '<img src="' + img + '" height="300" />' );

	alignTargetSizes();
	randomizeLetters();
	$( 'body' ).removeClass( 'loading' );
};

var randomizeLetters = function randomizeLetters(){
	$( '.letter' ).each(function(){		
		do{
			var newPos = getRandomPosition( this );

			$(this).css('top', newPos.y );
			$(this).css('left', newPos.x );
		} while ( intersectsAny( this, $(this).siblings() ) )
	});
};


getLevelData( function(){
	getNextWord( initializeLevel );
});



$( document ).bind( 'hashchange', function(){
	getNextWord( initializeLevel );
});
$( window ).bind( 'orientationchange', randomizeLetters );

$( 'body' ).css( 'height', $( window ).height() );

$( window ).bind( 'selectstart selectend', function( e ){
	e.preventDefault();
});

$( window ).bind( 'touchstart', function( e ){
	e.preventDefault();
});

$( 'body' ).on( 'mousedown touchstart', '.letter:not(.correct)', function( e ){
	if( e.type === 'touchstart' ){
		var x = e.originalEvent.targetTouches[ 0 ].pageX;
		var y = e.originalEvent.targetTouches[ 0 ].pageY;
	}else{
		var x = e.pageX;
		var y = e.pageY;
	}

	lastZIndex++;
	isDragging = e.target;
	$( isDragging )
		.addClass( 'dragging' )
		.css( 'z-index', lastZIndex )

	dragOffset.x = x - $( e.target ).offset().left;
	dragOffset.y = y - $( e.target ).offset().top;
});

$( 'body' ).on( 'mouseup touchend', function(){

	$( '.target' ).each(function(){
		if( contains( this, isDragging ) ){
			if(  $( this ).find( '.target-inner' )[ 0 ].innerHTML === isDragging.innerHTML ){
				$( this ).addClass( 'correct' );
				$( isDragging ).addClass( 'correct' );

				isDragging = false;
				isComplete();
			}else{
				var newPos = getRandomPosition( isDragging );
				$( isDragging ).animate({
					top: newPos.y,
					left: newPos.x
				}, 'fast' );
			}
		}
	});

	$( isDragging ).removeClass( 'dragging' );
	isDragging = false;
});

$( 'body' ).bind( 'mousemove touchmove', function( e ){
	if( !isDragging ){
		return;
	}

	if( e.type === 'touchmove' ){
		e.preventDefault();
		var x = e.originalEvent.targetTouches[ 0 ].pageX;
		var y = e.originalEvent.targetTouches[ 0 ].pageY;
	}else{
		var x = e.pageX;
		var y = e.pageY;
	}

	$( isDragging ).css({
		left: x - dragOffset.x,
		top: y - dragOffset.y
	});

});

WebFontConfig = {
	google: { families: [ 'Andika::latin' ] }
};
$(  '<script>' )
	.attr('src', '//ajax.googleapis.com/ajax/libs/webfont/1/webfont.js' )
	.appendTo( 'head' );