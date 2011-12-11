var targets = $( '.target' );
var width = $( window ).width();
var height = $( window ).height();

var isDragging = false;
var dragOffset = {
	x: 0,
	y: 0
};

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
	var x1 = $( elem1 ).position().left;
	var y1 = $( elem1 ).position().top;
	var width1 = $( elem1 ).outerWidth();
	var height1 = $( elem1 ).outerHeight();

	var x2 = $( elem2 ).position().left;
	var y2 = $( elem2 ).position().top;
	var width2 = $( elem2 ).outerWidth();
	var height2 = $( elem2 ).outerHeight();

	if( x2 > x1 + 10 &&
			x2 + width2 < x1 + width1 - 10 &&
			y2 > y1 + 10 &&
			y2 + height2 < y1 + height1 - 10 ){
		return true;			
	}else{
		return false;
	}
};

var isComplete = function isComplete(){
	if( $( '.letter.correct' ).length === targets.length ){
		$( 'body' ).css( 'background', '#0f0' );
	}
};

$( 'body' ).css( 'height', $( window ).height() );

$( 'body' ).bind( 'selectstart', function(){
	return false;
});

$( '.letter' ).each(function(){
	var newTop = Math.random() * height;
	var newLeft = Math.random() * width;

	newTop = clamp( newTop, $( targets[ 0 ] ).outerHeight(), height - $( this ).outerHeight() - 20 );
	newLeft = clamp( newLeft, 0, width - $( this ).outerWidth() - 20 );

	$(this).css('top', newTop );
	$(this).css('left', newLeft );
});

$( 'body' ).on( 'mousedown touchstart', '.letter:not(.correct)', function( e ){
	if( e.type === 'touchstart' ){
		e.preventDefault();
		var x = e.originalEvent.targetTouches[ 0 ].pageX;
		var y = e.originalEvent.targetTouches[ 0 ].pageY;
	}else{
		var x = e.pageX;
		var y = e.pageY;
	}

	isDragging = e.target;
	$( isDragging ).addClass( 'dragging' );

	dragOffset.x = x - $( e.target ).offset().left;
	dragOffset.y = y - $( e.target ).offset().top;
});

$( 'body' ).on( 'mouseup touchend', function(){
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

	$( targets ).each(function(){
		if(  this.innerHTML === isDragging.innerHTML ){
			if( contains( this, isDragging ) ){
				$( this ).addClass( 'letter-hover' );
				$( isDragging ).addClass( 'correct' );
				isDragging = false;
				isComplete();
			}
		}
	});

});