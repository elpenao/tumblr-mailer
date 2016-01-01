var fs = require('fs');
var ejs = require('ejs');
// var getPosts = require('./getPosts.js');
var tumblr = require('tumblr.js');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('_99Rf7n-RD6L3jbdTdzSbQ');

var client = tumblr.createClient({
  consumer_key: 'YaUpeQnTYE9tDq6fCdPejzHld8DI7X7dvh1LbopiihbDCONw7c',
  consumer_secret: 'hKJdv3ITMDZAzK2xIEAMBeKsqYNArqxQZe38TyVO5tDCbn0ari',
  token: 'sbsTQd7y4O4pf9SzTFLgIvqWechBdddMr19KpJzTGeejCm2Jww',
  token_secret: '6QU5NBjmILxDni5mxIC11s6nPu4dfzYOVVCsy5G15A3J19Gj4P'
});

var csvFile = fs.readFileSync("friend_list.csv","utf8");

// parse list of friends
function csvParse(csvFile){
  var rows = csvFile.split('\n');
  var data = [];
  var headers = rows[0].split(',');
  // loop through rows starting on second line
  for (var i = 1; i < rows.length; i++) {
  	var rowArray = rows[i].split(',');
  	var object = {};
  	// loop through columns
  	for (var j = 0; j < rowArray.length; j++) {
  		object[headers[j]] = rowArray[j];
   	};
   	data.push(object);
  };
  return data;
}

var csv_data = csvParse(csvFile);

// generate initial email template
var emailTemplate = fs.readFileSync("email_template.html","utf8");

// use tumbler api to get latest posts
client.posts('elpenao.tumblr.com', { type: 'text' }, function (err, data){
	var latestPosts = [];
	var dateDiff = 0;
	var day = 86400000;
    var posts = data.posts;
    for (var i = 0; i < posts.length; i++) {
    	var postObject = {};
    	postObject.post_url = posts[i].post_url;
    	postObject.title = posts[i].title;
    	postObject.date = posts[i].date;
    	var now = new Date(postObject.date);
    	dateDiff = Date.now() - now;
    	if (dateDiff < (day * 30)){
    	 	latestPosts.push(postObject);
    	}
    }
    for (var i = 0; i < csv_data.length; i++) {
    	csv_data[i].latestPosts = latestPosts;
		var customEmail = ejs.render(emailTemplate, csv_data[i]);
		sendEmail(csv_data[i].firstName, csv_data[i].emailAddress, "elpenao", "oscarpena@livhub.com", "Hey it's me", customEmail);	
	};
});

// use mandrill api to send emails
function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
	var message = {
	    "html": message_html,
	    "subject": subject,
	    "from_email": from_email,
	    "from_name": from_name,
	    "to": [{
	            "email": to_email,
	            "name": to_name
	        }],
	    "important": false,
	    "track_opens": true,    
	    "auto_html": false,
	    "preserve_recipients": true,
	    "merge": false,
	    "tags": [
	        "Fullstack_Tumblrmailer_Workshop"
	    ]    
	};
	var async = false;
	var ip_pool = "Main Pool";
	mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
	    	      
	}, function(e) {
	    // Mandrill returns the error as an object with name and message keys
	    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
	    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
	});
}












