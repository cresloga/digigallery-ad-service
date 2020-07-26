const AWS = require('aws-sdk');
var request = require('request');

AWS.config.update({
  region: process.env.DB_REGION,
  endpoint: process.env.DB_ENDPOINT
});

var docClient = new AWS.DynamoDB.DocumentClient();


exports.handler = function(event, context,callback) {
    console.log("Request Received : "+JSON.stringify(event));

    var table = process.env.DB_TABLE_NAME;
    var fileName = event.queryStringParameters.fileName;    
    var params = {
        TableName:table,
        Key:{
            fileName: fileName
        }
    };

    var responseBody = {};  
	var responseStatus = 200;
    var responseContentType = "application/json";
    
    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            responseBody = err;
            responseStatus = 417;
			respond(responseStatus, responseContentType, responseBody, callback);
        } else {
            console.log("Read item:", JSON.stringify(data, null, 2));
            responseBody = data;
			if(data.Item.category.length>0)  
				findDeals(data, callback);
			else
				respond(404, responseContentType, responseBody, callback);          
        }
        
    });
}


function findDeals(data, callback){

	var responseBody = {};  
	var responseStatus = 200;
	var categoryId = data.Item.category[0].id;	
	var requestUrl = "https://amazon-deals.p.rapidapi.com/amazon-offers/category/"+categoryId;

	var headerData = {
		"x-rapidapi-key": process.env.ADS_API_KEY
	};

	console.log(requestUrl);
	request({
		headers: headerData,
		uri: requestUrl,		
		method: 'GET'
	  }, function (error, response, body) {
         if(error) {
			responseBody = err;
            responseStatus = 417;
            respond(responseStatus, responseContentType, responseBody, callback);     
         }
         else
         {
          console.log("received result :"+body)
          if(response.statusCode===200){
			responseBody = body
          }     
		  respond(responseStatus, responseContentType, responseBody, callback);        
         }
    });	
}

function respond(responseStatus, responseContentType, responseBody, callback){
	var response = {
		"statusCode": responseStatus,
		"headers": {
			"Access-Control-Allow-Headers": '*',
        	"Access-Control-Allow-Origin": '*',
        	"Access-Control-Allow-Methods": '*',
			"Content-Type": responseContentType
		},
		"body": JSON.stringify(responseBody),
		"isBase64Encoded": false
	}
	console.log(response);
	callback(null,response);
}
