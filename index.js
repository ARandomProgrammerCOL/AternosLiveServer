const mineflayer = require("mineflayer");
const request = require('request')
const express = require('express')
const livereload = require('livereload')
const connectLivereload = require('connect-livereload')
const path = require('path')

const liveReloadServer = livereload.createServer();

liveReloadServer.watch(path.join(__dirname, 'public'));

// ping browser on Express boot, once browser has reconnected and handshaken
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

const app = express()


let port = process.env.PORT || 3000;


const config = require("./settings.json");
const usernames = require('./names.js')

createBot(usernames[Math.floor(Math.random() * usernames.length)])


function createBot(name) {

  const bot = mineflayer.createBot({

    username: name,

    host: config.server.ip,

    port: config.server.port,

    version: config.server.version,
  });

  bot.configFile = config;
  bot.settings.colorsEnabled = true;

  bot.once("spawn", function() {

    const onSpawn = new Date()

    const onSpawnCurrent = onSpawn.getHours() + ':' + onSpawn.getMinutes() + ':' + onSpawn.getSeconds()

    console.log(`\x1b[33m[${onSpawnCurrent} - BotLog] ${bot.username} joined to the server ${config.server.ip}:${config.server.port} in the version ${config.server.version}`, "\x1b[0m");
  
    
    app.get('/', (req, res) => {

      res.send(`${bot.username} is in the server`, 5, 5)

    })
    app.use(connectLivereload());
    app.listen()

    if (config.utils["auto-auth"].enabled) {

      console.log("[INFO] Started auto-auth module");


      var password = config.utils["auto-auth"].password;

      setTimeout(function() {

        bot.chat(`/register ${password} ${password}`)

        bot.chat(`/login ${password}`);

        console.log(`[Auth] Authentification commands executed.`);

      }, 5000);

      if (config.utils["chat-messages"].enabled) {

        console.log("[INFO] Started chat-messages module");

        var messages = config.utils["chat-messages"]["messages"];

        if (config.utils["chat-messages"].repeat) {

          var delay = config.utils["chat-messages"]["repeat-delay"];

          let i = 0;

          let msg_timer = setInterval(() => {

            bot.chat(`${messages[i]}`);

            if (i + 1 == messages.length) {

              i = 0;

            } else i++;

          }, delay * 1000);

        } else {

          messages.forEach(function(msg) {

            bot.chat(msg);

          });

        }

      }

      if (config.utils["anti-afk"].enabled) {

        if (config.utils["anti-afk"].sneak) {

          bot.setControlState("sneak", true);

        } else if (config.utils["anti-afk"].jump) {

          bot.setControlState("jump", true);

        }

      }

    };

    bot.on("chat", function(username, message) {

      if (config.utils["chat-log"]) {

        console.log(`[ChatLog] <${username}> ${message.toString()}`);

      }

    });

    bot.on("death", function() {

      const now = new Date();

      const current = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

      console.log(

        `\x1b[33m[${current} - BotLog] Bot has been died and was respawned ${bot.entity.position}`,
        "\x1b[0m"

      );

    });

    if (config.utils["auto-reconnect"]) {

      bot.on("end", function() {

        setTimeout(() => {

          createBot(usernames[Math.floor(Math.random() * usernames.length)])

        }, 60 * 1000)

      });

    }

    bot.on("kicked", (reason) => {

      const now = new Date();

      const current = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

      console.log(

        "\x1b[33m",
        `[${current} - BotLog] Bot was kicked from the server. Reason: \n${reason}`,
        "\x1b[0m")

    })

    bot.on("error", (err) =>

      console.log(`\x1b[31m[ERROR] ${err.message}`, "\x1b[0m")

    );

    bot.on("playerDeath", (data) => {

      if (!data) return

      console.log('Death')

      console.log(data)

    });

  })

}