var leftbeat = false;
var rightbeat = false;
var startTime = -1;
var lastKeyDown=0;
var NOPREVIOUS=99999999;
var lastKeyDownTime=NOPREVIOUS;
var timeoutId=0;
var canvas;
var beatEvents=Array();
var beatSong=Array();
var beatSongCurrentPosIndex = 0;
var score=0;
var recording = false;
var currentSongId=null;
var adminKey ="aa";

function drawCanvas()
{
	var CANVAS_WIDTH =400;
	var CANVAS_HEIGHT=400;
	var TOP_SIZE     = 20;
	var BOTTOM_SIZE  = 300;
	
	var MS_PER_PIXEL = 5;
	var DOT_SIZE_X   = 50;
	var DOT_SIZE_Y   = 20;
	var TIME_OFFSET  = 1000;
	
	var size=8;
	var now = new Date().getTime()-startTime;

	canvas.fillStyle="#FFFFFF";
	canvas.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);	
	
	for (index = 0; index < beatSong.length; ++index)
	{
		canvas.fillStyle="#AAAAAA";
		if (index==beatSongCurrentPosIndex) canvas.fillStyle="#EEEEEE";
		var beatEvent = beatSong[index];
		var canvasY = (now-beatEvent.t+TIME_OFFSET)/MS_PER_PIXEL;
		if (canvasY > 0 && canvasY < CANVAS_HEIGHT)
		{
			if (beatEvent.e=="L" || beatEvent.e.length>1 )
			{
				canvas.fillRect(50,canvasY,DOT_SIZE_X,DOT_SIZE_Y);
			}
			if (beatEvent.e=="R" || beatEvent.e.length>1 )
			{	
				canvas.fillRect(50+DOT_SIZE_X,canvasY,DOT_SIZE_X,DOT_SIZE_Y);
			}
		};
	}
	for (index = 0; index < beatEvents.length; ++index)
	{
		var beatEvent = beatEvents[index];
		var canvasY = (now-beatEvent.t+TIME_OFFSET)/MS_PER_PIXEL;
		if (canvasY > 0 && canvasY < CANVAS_HEIGHT )
		{
			if (beatEvent.e=="L" || beatEvent.e.length>1 )
			{
				canvas.fillStyle="#FF0000";
				canvas.fillRect(50,canvasY,DOT_SIZE_X,DOT_SIZE_Y);
			}
			if (beatEvent.e=="R" || beatEvent.e.length>1 )
			{	
				canvas.fillStyle="#00FF00";
				canvas.fillRect(50+DOT_SIZE_X,canvasY,DOT_SIZE_X,DOT_SIZE_Y);
			}
		};
	}
	canvas.fillStyle="#FF0000";
	canvas.fillRect(0,TIME_OFFSET/MS_PER_PIXEL,CANVAS_WIDTH,2);
	var ii=beatSongCurrentPosIndex;
	if (beatSongCurrentPosIndex>=0)
		ii=now-beatSong[beatSongCurrentPosIndex].t;
	$('#score').text(score+" punts");
}

function keyPressed(keyDown,keyCode)
{
	if (startTime==-1) return;
	
	var maxError=50;
	var now = new Date().getTime()-startTime;
	while (	beatSongCurrentPosIndex>=0
		&& (beatSong[beatSongCurrentPosIndex].t+maxError<now ))	
	{
		if (beatSongCurrentPosIndex<beatSong.length-1)
			beatSongCurrentPosIndex++;
		else
			beatSongCurrentPosIndex=-1;
	}
	if (keyCode==83 || keyCode==75)
	{
		if (keyCode==83) leftbeat = keyDown;	
		if (keyCode==75) rightbeat = keyDown;
		if (keyDown)
		{
			// queue
			var text = "";
			if (leftbeat) text+="L";
			if (rightbeat) text+="R";	
			lastKeyDownTime = now;
			lastKeyDown=text;

			clearTimeout(timeoutId);
			timeoutId=setTimeout(function(){keyPressed(0,0);},50);
		}
		return;
	}
	if (lastKeyDownTime!=NOPREVIOUS && (now - lastKeyDownTime) > 40)
	{	
		beatEvents.push({t:lastKeyDownTime,e:lastKeyDown});
		lastKeyDownTime=NOPREVIOUS;
		clearTimeout(timeoutId);
		if (beatSongCurrentPosIndex>=0)
		{
			var delta = now-beatSong[beatSongCurrentPosIndex].t;
			if (delta<0) delta=-delta;

			if (delta < maxError) 
				score += (maxError-delta);
			else score -= 20;
		} else score -= 20;
	}
	if (score < 0 ) score=0;
	timeoutId=setTimeout(function(){keyPressed(0,0);},50);
	drawCanvas();	
}

function reloadSongs()
{
	$.getJSON( "/api/songs", function( data ) {
		var songTableItems = [];
		var songSelectItems = [];

		for (var i = 0; i < data.length; i++) {
			songTableItems.push('<tr><td>'+data[i].songname+'</td></td>');
			songTableItems.push('<td><button type="button" class="btn btn-primary btn-sm btn-danger" onclick=\'javascript:deleteSong("'+data[i].id+'")\'>Esborrar</button>&nbsp;');

			if (("score" in data[i]) || adminKey!='')
				songSelectItems.push('<option value=\''+data[i].id+'|'+JSON.stringify(data[i].score)+'\'>'+data[i].songname+'</option>');

			songTableItems.push('</td></tr>');
		}
		$("#song-table").html(songTableItems.join(''));
		$("#song-select").html(songSelectItems.join(''));
		$("#song-select").change();
	});	
}

function deleteSong(id)
{
	$.ajax({
		url: '/api/songs/'+id,
		type: 'DELETE',
		success: function(result) {
			reloadSongs();
		}
	});	
}


function emptySong(id)
{
	alert("empty "+id);
}

function setAdminMode(pass)
{
	if (pass!='1111')
	{
		adminKey='';
		$("#record").hide();
		reloadSongs();
		return false;
	} else
	{
		adminKey=pass;
		$("#record").show();
		reloadSongs();
		return true;
	}
}

$(function()
{
	if (navigator.userAgent.indexOf("Chrome")==-1)
	{
		var msg = "Aquesta aplicaciò nomes funciona amb Google Chrome!";
		bootbox.alert("Aquesta aplicaciò nomes funciona amb Google Chrome!", function() 
		{
			document.location.href = "http://www.google.com/intl/ca/chrome/";
		});
	}
	canvas = document.getElementById('drawingCanvas').getContext("2d");
	$('#start').click(function(){
		recording = false;
		var audio = $('#audio').get(0);
		startTime=new Date().getTime();
		beatEvents=Array();
		beatSongCurrentPosIndex=0;
		score=0;
		audio.currentTime = 0;
		audio.play();
		keyPressed(0,0);
		$('#start').prop('disabled', true);
		$('#record').prop('disabled', true);
		$('#stop').prop('disabled', false);
	});    
	$('#stop').click(function(){
		var audio = $('#audio').get(0);
		audio.pause();
		startTime=-1;
		$('#beat-log').val(JSON.stringify(beatEvents));
		$('#start').prop('disabled', false);
		$('#record').prop('disabled', false);
		$('#stop').prop('disabled', true);
		if (recording)
		{
			bootbox.confirm("Desar-ho?",function(result){
			$.ajax({
				url: '/api/songs/'+currentSongId,
				type: 'PUT',
				contentType: "application/json; charset=utf-8",
    			dataType: "json",
				data: JSON.stringify({ score: beatEvents }),
				success: function(result) { }
			});	
				

			});
		}
	});
	$('#record').click(function(){
		recording = true;
		var audio = $('#audio').get(0);
		startTime=new Date().getTime();
		beatEvents=Array();
		beatSongCurrentPosIndex=0;
		score=0;
		audio.currentTime = 0;
		audio.play();
		keyPressed(0,0);
		$('#record').prop('disabled', true);
		$('#start').prop('disabled', true);
		$('#stop').prop('disabled', false);
	});
	$('#lbeat').click(function(){
		keyPressed(true,83);
		setTimeout(function(){keyPressed(false,83);},50);
		
	}) ;    
	$('#rbeat').click(function(){
		keyPressed(true,75);
		setTimeout(function(){keyPressed(false,75);},50);
	}) ;    
	
	$("body").keydown(function(e){keyPressed(true,e.keyCode);});
	$("body").keyup(function(e){keyPressed(false,e.keyCode);});
	$('#start').prop('disabled', false);
	$('#stop').prop('disabled', true);
	
	$('#menu a').click(function (e) {
		if ($(this).text()=='Gestio' && adminKey=='')
		{
			bootbox.prompt("Contrassenya?", function(result)
			{
				if (setAdminMode(result))
					$('#menu-gestio').trigger('click');
			});
		} else
		{
			if($(this).parent('li').hasClass('active')){
				$( $(this).attr('href') ).hide();
			}
			else {
				e.preventDefault();
				$(this).tab('show');
			}
		}
	});

	$('#upload').click(function (e) {
		$('#file_upload').ajaxSubmit(function() { 
			reloadSongs();
			$('#songname').val('');
			$('#mp3').val('');
			$('#admin-tab-header-songs').trigger('click');
			bootbox.alert("Canco afegida", function() {});
		}); 
	});

	$('#admin-tabs .tab a').each(function() {
		var $this = $(this);
		$this.click(function (e) {
			e.preventDefault();
			$this.tab('show');
		});
	});

	$( "#song-select" )
	.change(function () {
		var id = '';
		var idsongbeat = '';
		$( "select option:selected" ).each(function(){
			var v = $( this ).val().split("|"); 
			id = v[0];
			idsongbeat = v[1];
		});
		if (id!='')
		{
			$("#audiodiv").html('<audio src="/api/songs/'+id+'/mp3" id="audio" controls="controls"></audio>');
			currentSongId = id;
			beatSong=JSON.parse(idsongbeat);
		}
	});

	setAdminMode('');
	reloadSongs();
});
