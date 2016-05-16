//(function() {

	/* UI Components */

	var isRunning = true;
	var button = document.getElementById('toggle');

	button.addEventListener('click', function(e){
		if(isRunning) {
			pubnub.unsubscribe({
				channel: channel
			});
			button.value = 'Stream again';
			isRunning = false;
		} else {
			getData();
			button.value = 'Stop me!';
			isRunning = true;
		}
		
	}, false);


	/* Emotional Data */

	var tally = {};

	var positiveColor = '#00FF00';
	var negativeColor = '#FF0000';
	var neutralColor = '#00FFFF';

	var positive = {
		type: 'positive'
	};
	var happy = {
		type: 'positive'
	};
	var lovely = {
		type: 'positive'
	};
	var negative = {
		type: 'negative'
	};
	var sad = {
		type: 'negative'
	};
	var angry = {
		type: 'negative'
	};
	var sick = {
		type: 'negative'
	};

	var positiveWords = [
		 'excellent', 'amazing', 'beautiful', 'nice', 'marvelous', 'magnificent', 'fabulous', 'astonishing', 'fantastic', 'peaceful', 'fortunate', 'brilliant', 'glorious', 'cheerful', 'gracious', 'grateful', 'splendid', 'superb', 'honorable', 'thankful', 'inspirational','ecstatic', 'victorious', 'virtuous', 'proud', 'wonderful', 'lovely', 'delightful' 
	];
	var happyWords = [
		'happy', 'lucky', 'awesome', 'excited', 'fun', 'amusing', 'amused', 'pleasant', 'pleasing', 'glad', 'enjoy',
		'jolly', 'delightful', 'joyful', 'joyous', ':-)', ':)', ':-D', ':D', '=)','☺' 
	];
	var lovelyWords = [
		'love', 'adore', 'blissful', 'heartfelt', 'loving', 'lovable', 'sweetheart', 'darling', 'kawaii', 'married', 'engaged' 
	];
	var negativeWords = [
		'unhappy', 'bad', 'sorry', 'annoyed', 'dislike', 'anxious', 'ashamed', 'cranky', 'crap', 'crappy', 'envy', 
		'awful', 'bored', 'boring', 'bothersome', 'bummed', 'burned', 'chaotic', 'defeated', 'devastated', 'stressed',
		'disconnected', 'discouraged', 'dishonest', 'doomed', 'dreadful', 'embarrassed', 'evicted', 'freaked out', 'frustrated', 'stupid',
		'guilty', 'hopeless', 'horrible', 'horrified', 'humiliated', 'ignorant', 'inhumane', 'cruel', 'insane', 'insecure',
		'nervous', 'offended', 'oppressed', 'overwhelmed', 'pathetic', 'powerless', 'poor', 'resentful', 'robbed', 'screwed','looser','sucks'
	];
	var sadWords = [
		'sad', 'alone', 'anxious', 'depressed', 'disappointed', 'disappointing', 'sigh', 'sobbing', 'crying', 'cried', 
		'dumped', 'heartbroken', 'helpless', 'hurt', 'miserable', 'misunderstood', 'suicidal', ':-(', ':(', '=(', ';(' 
	];
	var angryWords = [
		'hate', 'damn', 'angry', 'betrayed', 'bitched','disgust', 'disturbed', 'furious', 'harassed', 'hateful', 'hostile', 'insulted',
		'irritable', 'jealous', ' rage ', 'pissed' 

	];
	var sickWords = [
		'sick', ' ill ', 'under weather', 'throw up', 'threw up', 'throwing up', 'puke', 'puking', 'pain', 'hangover', 'intoxicated' 	
	];
	var USAstates=new Array();
	var statecodes=['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LS','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'];
	var west=['WA','OR','MT','ID','WY','CA','NV','UT','CO','AZ','NM'],
	midwest=['ND','SD','NE','KS','MN','IA','MO','WI','IL','MI','IN','OH'],
	south=['OK','TX','AR','LA','MS','AL','TN','KY','GA','FL','WV','DC','MD','DE','NC','SC'],
	northeast=['PA','NY','NJ','VT','CT','MA','NH','VT','ME','RI'];
	var westArray= {sum:0, count:0},midwestArray= {sum:0, count:0},southArray= {sum:0, count:0},northeastArray= {sum:0, count:0};
	var midwestLayerArray= new Array();
	var westLayerArray= new Array();
	var southLayerArray= new Array();
	var northeastLayerArray= new Array();
	var timer=Date.now()+60000;
	
	//westArray
	for(i=0;i<statecodes.length;i++){
		USAstates[statecodes[i]]=0;
	}
	/* D3  */

	var width = 700;
	var height = 400;

	var projection = d3.geo.albersUsa();
		//.scale(900);

	var color = d3.scale.linear()
		.domain([0, 15])
		.range(['#FFA500']);

	var svg = d3.select('#map').append('svg')
			.attr('width', width)
			.attr('height', height);

	var path = d3.geo.path()
	    .projection(projection);

	var g = svg.append('g')
			.attr('transform','scale(0.65)');

	d3.json('json/us-states.json', function(error, topology) {
	    g.selectAll('path')
			.data(topojson.feature(topology, topology.objects.usStates).features)
			.enter()
			.append('path')
			.attr('class', function(d){ return 'states ' + d.properties.STATE_ABBR;} )
			.attr('d', path)
			.attr('fill', function(d, i) { return color(i); });
	});

	var channel = 'pubnub-twitter';

	var pubnub = PUBNUB.init({
		subscribe_key: 'sub-c-78806dd4-42a6-11e4-aed8-02ee2ddab7fe',
		ssl: true
	});

	// fetching previous 100 data, then realtime stream
	function getData() {
		pubnub.history({
	    	channel: channel,
	    	count: 100,
	    	callback: function(messages) {
	    		pubnub.each( messages[0], processData );
	    		getStreamData();
	    	},
	    	error: function(error) {
	    		console.log(error);
	    		if(error) {
	    			getStreamData();
	    		}
	    	}
	    });
	}

	function getStreamData() {
		pubnub.subscribe({
			channel: channel,
			callback: processData
		});
	}

	function getUserInfo(data, callback) {
		if(!data.geo) return;

		var userInfo = {};

		userInfo.lat = data.geo.coordinates[0];
		userInfo.lon = data.geo.coordinates[1];

		if(userInfo.lat === 0 && userInfo.lon === 0) return;

		var city = data.place.full_name;
		userInfo.city = city;
		userInfo.state = city.substring(city.lastIndexOf(',')+1).trim();

		userInfo.name = data.user.name;
		userInfo.screenname = data.user.screen_name;
		userInfo.avatar = data.user.profile_image_url;
		userInfo.tweet = data.text;
		userInfo.id_str = data.id_str;

		var date = new Date(parseInt(data.timestamp_ms));
		var d = date.toDateString().substr(4);
		var t = (date.getHours() > 12) ? date.getHours()-12 + ':' + date.getMinutes() + ' PM' : date.getHours() + ':' + date.getMinutes() +' AM;';

		userInfo.timestamp = t + ' - ' + d;
		callback(userInfo);
	}

	function insertLinks(text) {            
        return text.replace(/((https?|s?ftp|ssh)\:\/\/[^"\s\<\>]*[^.,;'">\:\s\<\>\)\]\!])/g, function(url){return '<a href="'+url+'" >'+url+'</a>';});                      
    }

	function displayData(data, emotion) {

		getUserInfo(data, function(user){
			//console.log('-------------------------------------------------------------------');
			//console.log(data);
			//console.log(user);
			document.querySelector('.button').href = 'https://twitter.com/' + user.screenname;
			document.querySelector('.header').style.backgroundImage = 'url('+ user.avatar +')';
			document.querySelector('.name').textContent = user.name;
			document.querySelector('.screenname').textContent = '@' + user.screenname;
			document.querySelector('.text').innerHTML = twemoji.parse(insertLinks(user.tweet));
			document.querySelector('.timestamp').textContent = user.timestamp;
			
			document.querySelector('.tweet').style.opacity = 0.9;
			//New Code
			if(USAstates[user.state]==''){
				USAstates[user.state]=0
			}
			var val=0;
			if(emotion.type=='positive'){			
				USAstates[user.state]=USAstates[user.state]+1
				val=1;	
			}else if(emotion.type=='negative'){
				USAstates[user.state]=USAstates[user.state]-1				
				val=-1;
			}
			if(west.indexOf(user.state)>=0){
					westArray.sum+=1;				
					westArray.count+=1;
			}else if(midwest.indexOf(user.state)>=0){
					midwestArray.sum+=1;				
					midwestArray.count+=1;
			}else if(south.indexOf(user.state)>=0){
					southArray.sum+=1;				
					southArray.count+=1;
			}else if(northeast.indexOf(user.state)>=0){
					northeastArray.sum+=1;				
					northeastArray.count+=1;
			}
			
			if(timer<=Date.now()){
				var el;
				if (westArray.count==0 || westArray.sum < 0)
					el=0.1;
				else
					el=westArray.sum/westArray.count;
				if (el==1)
					el=0.9
				westArray.sum=0;
				westArray.count=0;
				westLayerArray.push(el);
				if (midwestArray.count==0 || midwestArray.sum < 0)
					el=0.1;
				else
					el=midwestArray.sum/midwestArray.count;
				if (el==1)
					el=0.9
				midwestArray.sum=0;
				midwestArray.count=0;
				midwestLayerArray.push(el);
				if (southArray.count==0 || southArray.sum < 0)
					el=0.1;
				else
					el=southArray.sum/southArray.count;
				if (el==1)
					el=0.9
				southArray.sum=0;
				southArray.count=0;
				southLayerArray.push(el);
				if (northeastArray.count==0 || northeastArray.sum < 0)
					el=0.1;
				else
					el=northeastArray.sum/northeastArray.count;
				if (el==1)
					el=0.9	
				northeastArray.sum=0;
				northeastArray.count=0;
				northeastLayerArray.push(el);
				

				console.log('generating stream with :');
				console.log(westLayerArray);
				console.log(midwestLayerArray);
				console.log(southLayerArray);
				console.log(northeastLayerArray);
				var bar=d3.select("#stream");
				bar.select('svg').remove();
				generateStream(westLayerArray,midwestLayerArray,southLayerArray,northeastLayerArray);
				timer=Date.now()+60000;
			}
		
			var bar=d3.select("#bar");
			bar.select('svg').remove();
			svg= d3.select("#bar")
				.append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom);
			
			var yScale = d3.scale.linear()
					.domain([10,-10])
					.range([80,280]);		

			var yAxis = d3.svg.axis().scale(yScale).orient("left");
			svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(0,0)")
			.call(yAxis);
			
			draw_bar(USAstates);
			console.log(scalarFlag)
			if(scalarFlag){ 
				scalar=scaler*2;
				scalarFlag=false;
			}
			if(document.querySelector('.'+user.state)) {
				tally[user.state] = (tally[user.state] || {positive: 0, negative: 0});
				tally[user.state][emotion.type] = (tally[user.state][emotion.type] || 0) + 1;

				var stateEl = document.querySelector('.'+user.state);
				stateEl.style.fill = (tally[user.state].positive > tally[user.state].negative) ? positiveColor : ((tally[user.state].positive < tally[user.state].negative) ? negativeColor :neutralColor); 

				stateEl.setAttribute('data-positive', tally[user.state].positive);
				stateEl.setAttribute('data-negative', tally[user.state].negative);
			}	
		
		})	
	}
	
	function processData(data) {
		if(!data || !data.place || !data.lang) return; 
		if(data.place.country_code !== 'US') return;
		//if(data.lang !== 'en') return;

		if (positiveWords.some(function(v) { return data.text.toLowerCase().indexOf(v) !== -1; })) {
			displayData(data, positive);
		} else if (happyWords.some(function(v) { return data.text.toLowerCase().indexOf(v) !== -1; })) {
			displayData(data, happy);
		} else if (lovelyWords.some(function(v) { return data.text.toLowerCase().indexOf(v) !== -1; })) {
			displayData(data, lovely);
		} else if (negativeWords.some(function(v) { return data.text.toLowerCase().indexOf(v) !== -1; })) {
			displayData(data, negative);
		} else if (sadWords.some(function(v) { return data.text.toLowerCase().indexOf(v) !== -1; })) {
			displayData(data, sad);
		} else if (angryWords.some(function(v) { return data.text.toLowerCase().indexOf(v) !== -1; })) {
			displayData(data, angry);
		} else if (sickWords.some(function(v) { return data.text.toLowerCase().indexOf(v) !== -1; })) {
			displayData(data, sick);
		}
	}

	getData();
	
	var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 1500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;
	
	svg= d3.select("#bar")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		//.append("g")
		//.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	var yScale = d3.scale.linear()
						.domain([10,-10])
						.range([80,height]);		
	
	var yAxis = d3.svg.axis().scale(yScale).orient("left");
	svg.append("g")
	.attr("class", "y axis")
	.attr("transform", "translate(0,0)")
	.call(yAxis);
	var scaler=1;
	var scalarFlag=false;
	
	function draw_bar(USAstates1) {
	
			var barPadding = 1;
			
			var dataset = new Array();
			for(i=0;i<statecodes.length;i++){
			dataset[i]= {state:statecodes[i],rate:USAstates1[statecodes[i]]};
			}
			//Create SVG element
				
			var rec=svg.selectAll("rect")
			   .data(dataset)
			   .enter();
			   rec.append("text")
			   .text(function(d){return d.state})
			   .attr("font-family","Verdana")
			   .attr("font-size","8")
			   .attr("text-anchor","start")
			   .attr("x", function(d, i) {
			   		return i * (width / dataset.length)+(width / dataset.length - barPadding)/3;
			   })
			   .attr("y", function(d) {
					if(d.rate<0)
						return yScale(d.rate) + 10;
					else
						return yScale(d.rate) - 5;
			   });
			   rec.append("rect")
			   .attr("x", function(d, i) {
			   		return i * (width / dataset.length);
			   })
			   .attr("y", function(d) {
					var val=yScale(Math.max(0,d.rate))/scaler;
					console.log('val:'+val);
					if(val<=0){
						scalarFlag=true;
					}  
					return val;
			   })
			   .attr("width", width / dataset.length - barPadding)
			   .attr("height", function(d) {
					return Math.abs(yScale(d.rate)-yScale(0));
			   })
			   .attr("fill", function(d) {
					if(d.rate > 0){
						//return "rgb(0, 0, " + (d * 10) + ")";
						return "rgb(0, 0, 255)";
					}else{
						return "rgb(255, 0, 0)";
						//return "rgb(" + (d * 10) + ",0, 0)";
					}
			   });
			   
			   svg.append("line")
				.attr("x1", 0)
				.attr("x2", width * dataset.length)
				.attr("y1", yScale(0))
				.attr("y2", yScale(0))
				.attr("stroke", "#000");
	}

/*streamgraph code*/
function generateStream(westLayerArray,midwestLayerArray,southLayerArray,northeastLayerArray){
	
	var margin = {
		top: 50,
		right: 50,
		bottom: 50,
		left: 50
	},
	width = 960 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;

	//Important, each row is one "signal"
	n=4;//number of layers
	m=100;//samples per layer
	var data=new Array();
	for (i=0;i<4;i++){
		data[i]=new Array();
		for(j=0;j<100;j++){
			data[i][j]=0;
		}
	}

	var layers=[westLayerArray,midwestLayerArray,southLayerArray,northeastLayerArray];
	for(i=0;i<layers.length;i++){
		for(j=0;j<layers[i].length;j++){
			data[i][j]=layers[i][j];
		}
	}
	console.log(data);
	//get the max y of the domain, so that itll never go beyond screen
	var sum = new Array(data.length); //placeholder array
	for(var x=0; x<data.length; x++) {
		sum[x] = 0;
		for(var y=0; y<data.length; y++) {
			sum[x] += data[y][x];   //sum up values vertically
		}
	}

	// permute the data
	data = data.map(function (d) {
		return d.map(function (p, i) {
			return {
				x: i,
				y: p,	
				y0: 0
			};
		});
	});

	console.log(data);
	var color = ["#00FFAF", "#0078FF", "#8C00FF", "#FF0082"];

	var x = d3.scale.linear()
		.range([0, width])
		.domain([0, data[0].length]);

	var y = d3.scale.linear()
		.range([height, 0])
		.domain([0, d3.max(sum)]); //max y is the sum we calculated earlier
	console.log('y:'+y(0));
	var svg = d3.select("#stream").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var stack = d3.layout.stack()
		.offset("wiggle") //<-- creates a streamgraph

	var layers = stack(data);

	//vis type
	var area = d3.svg.area()
		.interpolate('cardinal')
		.x(function (d, i) {
		return x(i);
	})
		.y0(function (d) {
		return y(d.y0);
	})
		.y1(function (d) {
		return y(d.y0 + d.y);
	});

	svg.selectAll(".layer")
		.data(layers)
		.enter().append("path")
		.attr("class", "layer")
		.attr("d", function (d) {
		return area(d);
	})
		.style("fill", function (d, i) {
		console.log('color:'+i);
		return color[i];
	});
	
}
//Initialize
generateStream([0],[0],[0],[0]);
draw_bar(USAstates);