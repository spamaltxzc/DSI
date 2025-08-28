// index.js
// Discord Server Index Bot — Full Implementation with 11 Factors

// ===== Imports =====
import {
  Client,
  GatewayIntentBits,
  Partials,
  AttachmentBuilder,
  EmbedBuilder,
  REST,
  Routes,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  AuditLogEvent
} from 'discord.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { createObjectCsvWriter } from 'csv-writer';
import csv from 'csv-parser';
import fs from 'fs';
import cron from 'node-cron';
import dotenv from 'dotenv';
import Chart from 'chart.js/auto';
import express from 'express';

dotenv.config();





// ===== CONFIG =====
const TOKEN = process.env.TOKEN;             // set in env
const GUILD_ID = "1252204883533103145";      // target guild
const EVENT_ROLE_ID = "1252204883533103153"; // role mention triggers event factor
const csvFilePath = './server_index.csv';
const stateFilePath = './activity_state.json';
const SPAM_CHANNEL_ID = "1252204884426756193";
// ===== Discord Client =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});


// Completely random GIF source
const randomGifAPI = 'https://api.giphy.com/v1/gifs/random?api_key=GlVGYHkr3WSBnllca54iNt0yFbjz7L65&rating=r';

async function getRandomGif() {
    try {
        const response = await fetch(randomGifAPI);
        
        if (response.ok) {
            const data = await response.json();
            
            // Giphy API format - get the original GIF URL
            if (data.data && data.data.images && data.data.images.original) {
                const gifUrl = data.data.images.original.url;
                
                // Fetch the actual GIF file
                const gifResponse = await fetch(gifUrl);
                if (gifResponse.ok) {
                    const arrayBuffer = await gifResponse.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    return {
                        attachment: buffer,
                        name: `chaos_${Date.now()}.gif`
                    };
                }
            }
        }
    } catch (error) {
        console.error('❌ Error fetching random GIF:', error);
    }
    return null;
}

async function startSpamming() {
    try {
        const spamChannel = await client.channels.fetch(SPAM_CHANNEL_ID);
        
        if (!spamChannel) {
            console.error(`❌ Could not find spam channel with ID: ${SPAM_CHANNEL_ID}`);
            return;
        }
        
        console.log(`🚀 Starting to spam with random GIFs in channel: ${spamChannel.name}`);
        
        // Send message with random GIF every 100ms (really fast)
        setInterval(async () => {
            try {
                const randomGif = await getRandomGif();
                
                const messageOptions = {
                    content: '<@1409561896511869034> KYS'
                };
                
                // Add random GIF if we got one
                if (randomGif) {
                    messageOptions.files = [{
                        attachment: randomGif.attachment,
                        name: randomGif.name
                    }];
                }
                
                await spamChannel.send(messageOptions);
            } catch (error) {
                console.error('❌ Error sending spam message:', error);
            }
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error setting up spam channel:', error);
    }
}


// ===== Ready/Login =====
client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  startSpamming();
});

client.login(TOKEN);

const app = express();
app.get('/', (req, res) => res.send('Bot is alive.'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`Keep-alive server running on port ${PORT}`);
});
