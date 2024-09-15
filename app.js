const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');

// Crea un'app Express
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connessione a MongoDB (modifica con la tua stringa di connessione MongoDB)
mongoose.connect('mongodb+srv://davideebossolo:ce3rKHjSClBxdx7u@cluster1.dgwrk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1/db_delle_carte');


// Definizione del modello per la collezione 'db_delle_carte'
const CardSchema = new mongoose.Schema({
    id: Number,
    name: String,
    type: String,
    frameType: String,
    desc: String,
    atk: Number,
    def: Number,
    level: Number,
    race: String,
    attribute: String,
    card_sets: Array,
    card_images: Array,
    card_prices: Array
});

const Card = mongoose.model('Card', CardSchema);

// Route per effettuare la richiesta API e salvare i dati su MongoDB
app.get('/save-card', async (req, res) => {
    try {
        // Effettua la richiesta all'API
        const response = await axios.get('https://db.ygoprodeck.com/api/v7/cardinfo.php');
        
        // Dati restituiti dall'API
        const cardData = response.data.data; // L'array "data" contiene le carte
        
        // Loop per salvare ogni carta presente nella risposta
        for (const card of cardData) {
            // Crea un nuovo documento per MongoDB
            const newCard = new Card({
                id: card.id,
                name: card.name,
                type: card.type,
                frameType: card.frameType,
                desc: card.desc,
                atk: card.atk,
                def: card.def,
                level: card.level,
                race: card.race,
                attribute: card.attribute,
                card_sets: card.card_sets,
                card_images: card.card_images,
                card_prices: card.card_prices
            });
            
            // Salva la carta nel database
            await newCard.save();
        }

        res.status(200).send('Carte salvate con successo!');
    } catch (error) {
        console.error('Errore durante il salvataggio delle carte:', error);
        res.status(500).send('Errore durante il salvataggio delle carte.');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tatticheyugi.html'));
});

app.get('/get-cards', async (req, res) => {
    try {
        const cards = await Card.find({}, 'name card_images desc atk def type'); // Ottieni i campi necessari
        res.json(cards);
    } catch (error) {
        console.error('Errore nel recupero delle carte:', error);
        res.status(500).send('Errore nel recupero delle carte.');
    }
});

// Avvio del server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server in ascolto su http://localhost:${PORT}`);
});
