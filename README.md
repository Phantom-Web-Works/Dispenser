# Dispenser
A Discord bot designed to manage and dispense links.

## Prerequisites
Make sure you have the following installed: 
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (Node Package Manager)
- [MongoDB](https://www.mongodb.com/try/download/community) (Make sure MongoDB is running)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/NCCoder2/Dispenser.git
   ```

2. Navigate to the project folder:

   ```bash
   cd Dispenser
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

## Configuration

1. Open the `config.json` file and configure the following settings:

   - `db.uri`: MongoDB connection URI.
   - `bot.token`: Discord bot token.
   - `bot.client_id`: Discord bot client ID.
   - `bot.guild_id`: Discord guild ID. 
   -  Fill in all the blank/non-filled values in the config.json as well. 

## Running the Bot

1. Start the bot:

   ```bash
   node index.js
   ```

   If you've followed all the directions correctly, you should see messages indicating MongoDB and Discord Bot connection.

## Adding Links

1. Open the `./links/free.txt` and `./links/premium.txt` files.

2. Add links to the respective files, each link on a new line.

3. Restart the bot:

   ```bash
   node index.js
   ```

   The bot will read the links from the files and add them to the database.



## LICENSE
MIT LICENSE in the LICENSE file
