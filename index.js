const { Client, GatewayIntentBits, Events, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const { token, prefix, botOwnerID, giveawayChannelId } = require('./config.json');
const { loadData, saveData } = require('./utils/functions');
const GiveawayManager = require('./utils/giveawayManager')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
    ],
});

let giveawayManager;
client.once(Events.ClientReady, async readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`);
    giveawayManager = new GiveawayManager(client);
     setInterval(() => {
         giveawayManager.updateGiveaways()
        }, 60 * 1000);
});

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (commandName === "giveaway") {
        const subCommand = args.shift()
       if(subCommand === "create"){
             if (message.author.id !== botOwnerID) return message.reply("Bu komutu sadece bot sahibi kullanabilir.");
             const duration = parseInt(args[0]) || 10;
            const winnerCount = parseInt(args[1]) || 1;
            const prize = args.slice(2).join(" ");
            if(isNaN(duration) || isNaN(winnerCount) || !prize) return message.reply("Lütfen geçerli bir süre, kazanan sayısı ve ödül belirtin.");
             const channel = client.channels.cache.get(giveawayChannelId);
              if(!channel) return message.reply("Çekiliş kanalı bulunamadı, lütfen config.json dosyasını kontrol edin.");
            try {
               await giveawayManager.createGiveaway(channel, duration, winnerCount, prize, message.author);
                message.reply("Çekiliş başarıyla oluşturuldu.");
             }
            catch(error){
              console.error("Çekiliş oluşturulurken bir hata oluştu:", error);
              message.reply("Çekiliş oluşturulurken bir hata oluştu.")
          }
        } else if (subCommand === "end"){
            if (message.author.id !== botOwnerID) return message.reply("Bu komutu sadece bot sahibi kullanabilir.");
             const id = args[0];
             if(!id) return message.reply("Lütfen bir çekiliş id girin.");
            const result = await giveawayManager.endGiveaway(id);
          message.reply(result)
        }  else if (subCommand === "reroll") {
            if (message.author.id !== botOwnerID) return message.reply("Bu komutu sadece bot sahibi kullanabilir.");
            const id = args[0];
            if(!id) return message.reply("Lütfen bir çekiliş id girin.");
             const result = await giveawayManager.rerollGiveaway(id)
            message.reply(result);
        } else if(subCommand === "list"){
            if (message.author.id !== botOwnerID) return message.reply("Bu komutu sadece bot sahibi kullanabilir.");
          const list =  giveawayManager.listGiveaways();
          message.reply(list);
       }else if (subCommand === "delete"){
         if (message.author.id !== botOwnerID) return message.reply("Bu komutu sadece bot sahibi kullanabilir.");
        const id = args[0];
        if(!id) return message.reply("Lütfen bir çekiliş id girin.");
       const result = giveawayManager.deleteGiveaway(id);
       message.reply(result);
       } else if (subCommand === "edit"){
          if (message.author.id !== botOwnerID) return message.reply("Bu komutu sadece bot sahibi kullanabilir.");
          const id = args[0];
        const newPrize = args.slice(1).join(" ");
        if(!id || !newPrize) return message.reply("Lütfen bir çekiliş id ve yeni bir ödül belirtin.");
          const result = giveawayManager.editGiveaway(id, newPrize);
          message.reply(result);
        }
     }
});


client.login(token);