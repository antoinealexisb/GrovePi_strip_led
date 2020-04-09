/*
###########################################
#
# change the color of a led strip on the GrovePi+
#
# Author : Antoine-Alexis Bourdon
# Link : www.github.com/antoinealexisb/
# Version : 1.0.0
# Dependency : socket.io(~1.2.1)
# 
# NodeJs Website.
###########################################
*/


var http = require('http');
//var fs = require('fs'); not use
var url = require('url');
//GrovePi Module
var GrovePi = require('grovepi').GrovePi;

/*############ INFORMATION SERVER ############# */
var ipServer = "192.168.0.5";
var portServer = "8080";


//led connected to GrovePi+
//change your pins, if you didn't do the same as me. (me : Red=D5, Green=D6, Blue=D3)
var ledR = new GrovePi.sensors.base.Analog(5);
var ledG = new GrovePi.sensors.base.Analog(6);
var ledB = new GrovePi.sensors.base.Analog(3);

// loading page for the users.
var server = http.createServer(function(req, res) {
    var page = url.parse(req.url).pathname;
    if (page == '/'){ //you can use fs ;)
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write('<!DOCTYPE html>\n'+
        '<html>\n'+
        '    <head>\n'+
        '        <meta charset="utf-8" />\n'+
        '        <title>Change color!</title>\n'+
        '    </head>\n'+ 
        '    <body>\n'+
        '     	<h1>Change color GrovePi+ and NodeJs!</h1>\n'+
        '       <input id="colorId" type="color" value="#ffffff"/>\n'+
        '       <p><input type="button" value="Send color" id="poke" /></p>\n'+
        '       <script src="http://code.jquery.com/jquery-1.10.1.min.js"></script>\n'+
        '       <script src="/socket.io/socket.io.js"></script>\n'+
        '       <script>\n'+
        '           var socket = io.connect("http://'+ipServer+':8080");\n'+
        '           socket.on("message", function(message) {\n'+
        '               alert("The server has a message for you : " + message);\n'+
        '           })\n'+
        '           socket.on("send", function(message) {\n'+
        '               alert(message);\n'+
        '           })\n'+
        '           var pseudo = prompt("What you name ?");\n'+
        '           socket.emit("newBody", pseudo);\n'+
        '           $("#poke").click(function() {\n'+
        '               socket.emit("color", $("#colorId").val());\n'+
        '           })\n'+
        '       </script>\n'+
        '    </body>\n'+
        '</html>\n');
        res.end();
    }
});


// loading socket.io and GrovePi+
var io = require('socket.io').listen(server);
function start() {
    board = new GrovePi.board({
      debug: true,
      onError: function(err) {
        console.log('TEST ERROR')
      },
      onInit: function(res) {
          if (res) {
            io.sockets.on('connection', function (socket) {
                socket.emit('message', 'You are connected !');
                socket.broadcast.emit('message', 'Another client just connected !');
                    socket.on('newBody', function(pseudo) {
                       socket.pseudo = pseudo;
                    });
                socket.on('color', function (message) {
                    console.log(socket.pseudo + ' give color : ' + message);
                    if (verif(message)){
                        changeColor(message);
                        socket.emit('send', 'Ok its send 😊');
                    }
                    else{
                        socket.emit('send', 'Send bad !!!');
                    }
                });	
            });
          }
      }
    })
  
    board.init();
}

start();

/**
 * Fonction to exist.
 * @param {*} err 
 */
function onExit(err) {
    console.log('ending')
    board.close()
    process.removeAllListeners()
    process.exit()
    if (typeof err != 'undefined')
      console.log(err)
  }


  /**
   * Function that writes the new color.
   * @param {*} message (it's color code example : #AB1200)
   */
function changeColor(message){
    ledR.write(parseInt(message[1]+message[2], 16));
    ledG.write(parseInt(message[3]+message[4], 16));
    ledB.write(parseInt(message[5]+message[6], 16));
}

/**
 * function that returns true the character is a hex.
 * @param {Character} x 
 * @param {Base} base 
 */
function roughScale(x, base) {
    const parsed = parseInt(x, base);
    if (isNaN(parsed)) { return false }
    return true;
  }

  /**
   * Function that checks whether the value sent is valid.
   * @param {it's color code example : #AB1200} message 
   */
function verif(message){
    if (message.length == 7){
        for (var i = 1; i<7; i++){
            if (!roughScale(message[i],16)){
                return false;
            }
        }
        return true;
    }
    else {
        return false;
    }
}

//launch server
server.listen(portServer);
process.on('SIGINT', onExit)
