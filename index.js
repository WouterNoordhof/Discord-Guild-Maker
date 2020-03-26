const { Client, MessageEmbed } = require('discord.js')
const fs = require('fs')
let config = require('./config.json')

const bot = new Client()
const token = config.token

// When the bot is ready for use, set the playing status to the help command, and log in the console that the bot has started.
bot.on('ready', () => {
    bot.user.setActivity(`@Guild-Maker prefix`, { type: 'PLAYING' } )
    console.log("Bot started")
})

// Start the bot
bot.login(token)

// Message handler for the bot
bot.on('message', async msg => {

    // Check if server has changed the prefix, if not, then use the default.
    let prefixes = JSON.parse(fs.readFileSync('./prefixes.json', 'utf8'))
    if(!prefixes[msg.guild.id]) {
        prefixes[msg.guild.id] = {
            prefixes: config.prefix
        }
    }
    
    let prefix = prefixes[msg.guild.id].prefixes
    if(msg.cleanContent.startsWith(`@${bot.user.username}`)) {
        if(msg.content.includes("prefix")) {
            msg.reply(`The ${bot.user.username}'s prefix in this server is: \`${prefix}\``)
        }
    } //return msg.reply(`It appears you lost the Use ${prefix}help for more info`)

    // Check if the message starts with the prefix if not, do nothing
    if(!msg.content.startsWith(prefix) || msg.author.bot) return
    // Cut the sent message in parts where [0] is the base command 
    let args = msg.content.substring(prefix.length).split(" ")
    // Switch cases for all commands
    switch(args[0]) {
        // Code for the guild command
        case 'g':
        case 'guild':
            // if(msg.member.roles._roles.array().some(role => adminRoles.indexOf(role.id) >= 0)) {
            // Check if the message author has permissions to create channels
            if(msg.member.permissions.has("MANAGE_CHANNELS")) {
                // Code for the guild create command
                if(args[1] === 'create' || args[1] === 'c') {
                    // Check if the author has specified a guild name
                    if(!args[2]) return msg.reply("Please specify a guild name")
                    // Check if the author sent a guild name with spaces, if so, reply with an error
                    if(args[3]) return msg.reply("I'm sorry, spaces in guild names are not supported, use dashes (-) instead.")
                    // Set the guild name
                    let guildName = args[2]
                    // Generate a random color for the roles
                    let color = getRandomColor()
                    // Create the roles, category and channels
                    let roles = await createRoles(msg, guildName, color)
                    let category = await createCategory(msg, guildName, roles)
                    createChannels(msg, guildName, category, roles)
                    // Prepare text for the embed
                    let channelNames = `#${guildName.toLocaleLowerCase()}-chat, #${guildName.toLowerCase()}-anouncements and :speaker:${guildName}-Voice`
                    let roleNames = `@${guildName} and @${guildName} Leader`
                    // Make and send the embed
                    sendGuildSummary(msg, guildName, roleNames, channelNames, color)
                } else {
                    // If the command wasn't an existing one, send a reply with an error.
                    msg.reply(`I'm sorry, this command doesn't exist. Use ${prefix}help for more info`)
                }
            } else {
                // If the author of the message has no permission, send a reply with an error.
                msg.reply("I'm sorry, you don't have permission to execute this command.")
            }
            break
        // Code for the help command
        case 'h':
        case 'help':
            // Code for the help guild command
            if(args[1] === 'g' || args[1] === 'guild') {
                // Make and send an embed with help for the guild commands
                const guildHelpEmbed = new MessageEmbed()
                    .setTitle('Guild Help')
                    .setColor(`0x45DDC0`)
                    .addField(`${prefix}guild create <guild name>`, `\`\`\`Alternative: ${prefix}guild c <guild name>\`\`\`\`\`\`Creates new roles and channels based on the guild name. \nDon't use spaces in the guild name. \nCommand can only be used by Staff\`\`\``)
                    // .addField(`${prefix}guild delete <guild name>`, `\`\`\`Alternative: ${prefix}guild d <guild name>\`\`\`\`\`\`**WIP** Deletes all roles and channels based on the guild name. \nCommand can only be used by Staff.\`\`\``)
                msg.channel.send(guildHelpEmbed)
            } else {
                // If no spcific help is asked, make and send an embed with general help
                const helpEmbed = new MessageEmbed()
                    .setTitle('Help')
                    .setColor(`0x45DDC0`)
                    .addField(`${prefix}guild`, `\`\`\`Alternative: ${prefix}g \nGuild commands, use ${prefix}help guild for more info.\`\`\``)
                    .addField(`${prefix}help`, `\`\`\`Alternative: ${prefix}h \nShows this help message.\`\`\``)
                    .addField(`${prefix}prefix <new prefix>`, "```Change the prefix to the specified prefix```")
                msg.channel.send(helpEmbed)
            }
            break
        // Code for the prefix command
        case 'prefix':
            // Check if the author of the message has administrator permissions
            if(msg.member.permissions.has("ADMINISTRATOR")) {
                // If no new prefix is sent, reply with an error
                if(!args[1]) return msg.reply(`Please specify a new prefix`)
                // If more than one prefix is sent, reply with an error
                if(args[2]) return msg.reply(`I'm sorry, this command doesn't exist. Use ${prefix}help for more info`)
                try{
                    // Read the current config and set the prefix to the new prefix
                    let prefixes = JSON.parse(fs.readFileSync('./prefixes.json', 'utf8'))
                    prefixes[msg.guild.id] = {
                        prefixes: args[1]
                    }

                    fs.writeFileSync('./prefixes.json', JSON.stringify(prefixes), err => err ? console.log(err) : null)

                    // Make and send an embed with the new prefix
                    const newPrefixEmbed = new MessageEmbed()
                        .setTitle('Prefix Changed')
                        .setColor(`0x45DDC0`)
                        .addField('New Prefix:', args[1])
                    msg.channel.send(newPrefixEmbed)
                } catch(e) {
                    // If anything goes wrong, reply with the error
                    msg.reply("Something went wrong while changing the prefix." + e)
                }
            } else {
                // If the author doesn't have the administrator permission, reply with an error
                msg.reply("I'm sorry, you don't have permission to change the prefix.")
            }
            break
        default:
            msg.reply(`I'm sorry, this command doesn't exist. Use ${prefix}help for more info`)
    }
})

// Create roles based on the guild name with a random color
let createRoles = async (msg, guildName, color) => {
    try {
        let roles = []
        let leaderRole = await msg.guild.roles.create({
            data: {
                name: `${guildName} Leader`,
                color: `0x${lightenDarkenColor(color, -20)}`
            }
        })
        let memberRole = await msg.guild.roles.create({
            data: {
                name: guildName,
                color: `0x${color}`,
                hoist: true
            }
        })
        roles.push(leaderRole)
        roles.push(memberRole)
        
        return roles
    } catch(e) {
        msg.reply("Something went wrong while creating roles" + e)
    }
}

// Create categories based on the guild name, and make it private for the roles which were created
let createCategory = async (msg, guildName, roles) => {
    try {
        let category = await msg.guild.channels.create(guildName, {
            type: 'category',
            permissionOverwrites: [
                {
                    id: msg.guild.id,
                    deny: ['VIEW_CHANNEL']
                },
                {
                    id: roles[0].id,
                    allow: [
                        'MANAGE_CHANNELS', 
                        'VIEW_CHANNEL', 
                        'MANAGE_NICKNAMES',
                        'MANAGE_MESSAGES', 
                        'MANAGE_ROLES',
                        'MENTION_EVERYONE',
                        'DEAFEN_MEMBERS',
                        'MUTE_MEMBERS',
                        'MOVE_MEMBERS'
                    ]
                },
                {
                    id: roles[1].id,
                    allow: ['VIEW_CHANNEL']
                }
            ]
        })
        return category
    } catch(e) {
        msg.reply("Something went wrong while creating a category" + e)
    }
    
}

// Create the channels based on the guild name, as part of the created category, and with permissions for the roles
let createChannels = (msg, guildName, parent, roles) => {
    try {
        msg.guild.channels.create(`${guildName}-chat`, {
            type: 'text',
            parent: `${parent.id}`
        })

        msg.guild.channels.create(`${guildName}-announcements`, {
            type: 'text',
            parent: parent.id,
            permissionOverwrites: [
                {
                    id: msg.guild.id,
                    deny: ['VIEW_CHANNEL']
                },
                {
                    id: roles[0].id,
                    allow: ['SEND_MESSAGES']
                },
                {
                    id: roles[1].id,
                    deny: ['SEND_MESSAGES']
                }
            ]
        })
        
        msg.guild.channels.create(`${guildName}-Voice`, {
            type: 'voice',
            parent: parent.id
        })
    } catch(e) {
        msg.reply("Something went wrong while making the channels " + e)
    }
}

// Create and make a summary embed for the creation of the guild
let sendGuildSummary = (msg, guildName, roleNames, channelNames, color) => {
    const embed = new MessageEmbed()
        .setTitle('Guild created')
        .setColor(`0x${color}`)
        .addField('Guild name:', guildName)
        .addField('Roles Created:', roleNames)
        .addField('Channels created:', channelNames)
    msg.channel.send(embed);
}

// Get a random HEX color
let getRandomColor = () => {
    var letters = '0123456789ABCDEF';
    var color = '';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Lighten or darken a hex color by a percentage
let lightenDarkenColor = (color, percent) => {
    var num = parseInt(color,16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      B = (num >> 8 & 0x00FF) + amt,
      G = (num & 0x0000FF) + amt;

      return (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
};