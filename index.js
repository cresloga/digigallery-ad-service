var request = require('request');

exports.handler = function(event, context,callback) {
    console.log("get Digi Ads");	
	var adsPossible = false;
	var fileName = 	event.queryStringParameters.fileName;
	console.log("File Name :"+fileName);

    var requestUrl = process.env.GET_METADATA_HOST+"/metadata/"+fileName;
	console.log(requestUrl);
	request(requestUrl, function (error, response, body) {
        if (error) {
            console.error(JSON.stringify(error));
            return new Error(`Error adding metadata: ${JSON.stringify(error)}`);
          } else {
            console.log("Response from getMetadata : "+body);            
            generateDigiAds(body,callback);
          	
        }
    });
}

function generateDigiAds(metadata,callback){
	console.log("generating Digi Ads");	
	console.log(metadata);
	for(var i=0;i<metadata.Item.labels.length;i++){		
		console.log(metadata.Item.labels[i].Name);
		var label = metadata.Item.labels[i].Name;
		var formattedLabel = label.toLowerCase().trim();
		var queryParam="";
		var queryParamValue = "";
		var adIntro = "";		

		switch(formattedLabel){
			case "restaurant":
			case "cafeteria":
			case "food court":	   			
			case "breakfast":	
			case "food":
			case "pizza":
				adIntro="";
				queryParam="MerchantName";
				queryParamValue="Dominos Pizza";
				break;  					
			case "cake":
			case "birthday cake":
				adIntro="Get a Special Gift for your dear one with";
				queryParam="Category";
				queryParamValue="Gifts %26 Flowers>Special Occassions";
				//TODO: Do Something
				break;			   					
			/*case "costume":
				queryParam="Category";
				queryParamValue="Fashion";
				break;*/
			case "sari":
				adIntro="Look good with <br>";
				queryParam="Category";
				queryParamValue="Fashion>Womens Fashion";
				break;
			case "motorcycle":
			case "vehicle":
				adIntro="Time to renew Insurace? Hassle free renewal with <br>";
				//simulateAd(adIntro,"https://s3.ap-south-1.amazonaws.com/digiads-simulated-logos/bajajalianz.jpg","",res);	   					
				break;
			case "billiard room":
			case "bowling":
				adIntro="Be the Game with <br>";
				queryParam="Category";
				queryParamValue="Sports, Fitness %26 Outdoors >Sports Equipment";	   					
				break;
			case "mountain":
			case "outdoors":
			case "valley":
			case "shrine":
			case "architecture":
			case "monastery":
			case "beach":
			case "coast":
				adIntro="Summer again, Plan your Holidays with <br>";
				queryParam="Category";
				queryParamValue="Travel>Holidays";
				break;	   				
		}

		if(queryParam && queryParamValue){
			adsPossible=true;
			findDeals(adIntro,queryParam,queryParamValue,1,callback);	   				
			break;
		}
	}
}

function findDeals(adIntro,queryParam,label,pageNo,callback){
	var responseMsg="";
	var merchantLogoURL="";
	var ideadFeedsKey = process.env.IDEALFEEDS_KEY || "4b49c92e60487fa073802917cb0b9fb1";

	var requestUrl = "http://api.idealfeeds.com/"+ideadFeedsKey+"/GetDeals/Json?"+queryParam+"="+label+"&SortBy=ENDDATE&PageNo="+pageNo+"&PageSize=1";
	console.log(requestUrl);
	request(requestUrl, function (error, response, body) {
         if(error) {
            callback(null, JSON.parse(JSON.stringify(error,null,2)));       
         }
         else
         {
          console.log("received result :"+body)
          if(response.statusCode===200){
          	var dealObj = JSON.parse(body);
	          var dealTitle = "";
	          var deepLinkUrl = "";
	          //responseMsg = "No. of Deals: " +dealObj.TotalRecords;
	          if(dealObj.TotalRecords>0){

	            for (var i=0; i<dealObj.Deals.length;i++){
	              //responseMsg=dealObj.Deals[i].DealTitle;
	              responseMsg = dealObj.Deals[i].DealTitle;
	              if (dealObj.Deals[i].DealType === "Coupon"){
	                responseMsg=responseMsg+"<br>Coupon Code : "+dealObj.Deals[i].CouponCode;
	              }
	                //responseMsg=responseMsg+"\nStart Date : "+dealObj.Deals[i].StartDate;
	                responseMsg=responseMsg+"<br>Valid Till : "+dealObj.Deals[i].EndDate+"<br>";
	                deepLinkUrl = dealObj.Deals[i].DeepLinkUrl;
	                merchantLogoURL=dealObj.Deals[i].MerchantLogoURL;
	                //responseMsg=responseMsg+"\nMore Details : "+dealObj.Deals[i].DeepLinkUrl+"\n\n";              
	            }                 
	          }
          }     
          var returnData = {
          	adIntro:adIntro,
          	merchantLogo:merchantLogoURL,
          	adText:responseMsg
          };
          console.log(returnData);                         
          callback(null,JSON.parse(JSON.stringify(returnData,null,2)));          
         }
    });	
}