# Guild Maker by MicroMelone

## Information
This bot is made for Discord servers which have a guild system.

With a simple command, you can create a guild which consists of:
- 2 roles: `{guild name}` and `{guild name} Leader` with a random color. The Leader role has a slightly darker version of the color.
- A chat category which only the previously created roles can access. This category contains:
    - A text channel called `#{guild name}-chat` where the previously created roles can chat.
    - A text channel called `#{guild name}-announcements` where only the `{guild name} Leader` can chat.
    - A voice channel called `#{guild name}-Voice` where the previously created roles can have a voice call.

Default prefix: `-`
## Commands

> ### `-guild create {guild name}`

- `-g` can be used instead of `-guild`
- `c` can be used instead of `create`

Creates a new guild based on the guild name.

> ### `-help`

- `-h` can be used instead of `-help`

Shows more information about the commands.

> ### `-help guild`

- `-h` can be used instead of `-help`
- `g` can be used instead of `guild`

Shows more information about the guild commands.

> ### `-prefix <new prefix>`
Changes the prefix for all the commands

## Creating a new bot

1. Go to [https://discordapp.com/developers/applications](https://discordapp.com/developers/applications)
2. On this page, create a new application by clicking "New Application"
3. On the left side of the page, go to "Bot" it has a puzzle piece icon.
4. On the Bot page, add a new bot by clicking "Add Bot"
5. Copy the token on the Bot page and paste it in the config file.
