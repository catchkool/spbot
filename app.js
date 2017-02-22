var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));

// Server index page
app.get("/", function (req, res) {
  res.send("Deployed Sreejith TUV!");
});

// Facebook Webhook
// Used for verification
app.get("/webhook", function (req, res) {
  if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
    console.log("Verified webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Verification failed. The tokens do not match.");
    res.sendStatus(403);
  }
});

// All callbacks for Messenger will be POST-ed here
app.post("/webhook", function (req, res) {
  // Make sure this is a page subscription
  if (req.body.object == "page") {
    // Iterate over each entry
    // There may be multiple entries if batched
    req.body.entry.forEach(function(entry) {
      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.postback) {
          processPostback(event);
        }else if (event.message) {
          processMessage(event);
        }
      });
    });

    res.sendStatus(200);
  }
});

function processPostback(event) {
  var senderId = event.sender.id;
  var payload = event.postback.payload;

  if (payload === "Greeting") {
    // Get user's first name from the User Profile API
    // and include it in the greeting
    request({
      url: "https://graph.facebook.com/v2.6/" + senderId,
      qs: {
        access_token: process.env.PAGE_ACCESS_TOKEN,
        fields: "first_name"
      },
      method: "GET"
    }, function(error, response, body) {
      var greeting = "";
      if (error) {
        console.log("Error getting user's name: " +  error);
      } else {
        var bodyObj = JSON.parse(body);
        name = bodyObj.first_name;
        greeting = "Hi " + name + ". ";
      }
      var formattedMsg = greeting + "I am your personal Bot. I can tell you various details regarding insurance.";
      //sendMessage(senderId, {text: formattedMsg});
	    //var formattedMsg = message.text.toLowerCase().trim();
	  var url="http://172.31.19.91:8080/BootAppn/botData";
     callRestService(formattedMsg,url,senderId)
    });
  }
}

// sends message to user
function sendMessage(recipientId, message) {
  request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: "POST",
    json: {
      recipient: {id: recipientId},
      message: message,
    }
  }, function(error, response, body) {
    if (error) {
      console.log("Error sending message: " + response.error);
    }
  });
}


function processMessage(event) {
  if (!event.message.is_echo) {
    var message = event.message;
    var senderId = event.sender.id;

    console.log("Received message from senderId: " + senderId);
    console.log("Message is: " + JSON.stringify(message));

    // You may get a text or attachment but not both
    if (message.text) {
      var formattedMsg = message.text.toLowerCase().trim();
	  var url="http://172.31.19.91:8080/BootAppn/botData";
      callRestService(formattedMsg,url,senderId)
      
    } else if (message.attachments) {
      sendMessage(senderId, {text: "Sorry, I don't understand your request."});
    }
  }
}




function callRestService (message,URL,senderId) {
  var args = {
    data: { inputMessage: message },
    headers: { "Content-Type": "application/json" }
};
 
//client.registerMethod("postMethod", URL, "POST");
 
//client.methods.postMethod(args, function (data, response) {
    // parsed response body as js object
   
    // raw response
             //   console.log("hey data"+data.responseMessage);
  // var information =data.responseMessage.split("<br/>")
  //console.log('yo1'+information[1])
  
 
// for(var i = 0; i <information.length; i++) {
//console.log(information[i]);
//}
////////////////////////////////////////////////////////////////////////
var message1 = {
              attachment: {
                type: "template",
                payload: {
                  template_type: "generic",
                  elements: [{
                    title: "Insurance",
                    subtitle: "select the option?",
                    //image_url: movieObj.Poster === "N/A" ? "http://placehold.it/350x150" : movieObj.Poster,
                    buttons: [{
                      type: "postback",
                      title: "Get Insured",
                      payload: "Correct"
                    }, {
                      type: "postback",
                      title: "change Address",
                      payload: "Incorrect"
                    }]
                  }]
                }
              }
            };
			
			sendMessage(senderId, message1);

             
}

