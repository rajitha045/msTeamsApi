const crypto = require('crypto');
const fs = require('fs');

var tls = require('tls');

var options = {
	key: fs.readFileSync('newkey.pem'),
	cert: fs.readFileSync('cert.pem')
  };

const sharedSecret = "efPqewVgkk1T+gSI2ck9McIrDNLTTFSOFMK24r2hhp8="; // e.g. "+ZaRRMC8+mpnfGaGsBOmkIFt98bttL5YQRq3p2tXgcE="
const bufSecret = Buffer(sharedSecret, "base64");

var PORT = process.env.port || process.env.PORT || 8080;



tls.createServer(options,function(request, response) { 
	var payload = '';
	// Process the request
	request.on('data', function (data) {
		payload += data;
	});
	
	// Respond to the request
	request.on('end', function() {
		try {
			// Retrieve authorization HMAC information
			var auth = this.headers['authorization'];
			// Calculate HMAC on the message we've received using the shared secret			
			var msgBuf = Buffer.from(payload, 'utf8');
			var msgHash = "HMAC " + crypto.createHmac('sha256', bufSecret).update(msgBuf).digest("base64");
			// console.log("Computed HMAC: " + msgHash);
			// console.log("Received HMAC: " + auth);
			
			response.writeHead(200);
			if (msgHash === auth) {
				var receivedMsg = JSON.parse(payload);                                console.log(receivedMsg);

				var responseMsg = '{ "type": "message", "text": "You typed: ' + receivedMsg.text + '" }';	
			} else {
				var responseMsg = '{ "type": "message", "text": "Error: message sender cannot be authenticated." }';
			}
			response.write(responseMsg);
			response.end();
		}
		catch (err) {
			response.writeHead(400);
			return response.end("Error: " + err + "\n" + err.stack);
		}
	});
		
}).listen(PORT);

console.log('Listening on port %s', PORT);
