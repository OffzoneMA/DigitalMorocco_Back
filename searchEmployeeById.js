const { MongoClient } = require('mongodb');

// Chaîne de connexion à la base de données MongoDB
const uri = "mongodb+srv://dmdev:G2LUytkAe8uBRoer@dmdev.tixxb5b.mongodb.net/?retryWrites=true&w=majority";

// Identifiant que vous recherchez
const searchId = "64e4c1aa4853956b257cb88e";

// Fonction pour rechercher dans une collection spécifique
async function searchCollection(db, collectionName) {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const database = client.db(db);
        const collection = database.collection(collectionName);

        const query = { 'listEmployee._id.$oid': searchId };
        const result = await collection.findOne(query);

        if (result) {
            console.log("Document trouvé dans la collection '" + collectionName + "' :", result);
        } else {
            console.log("Aucun document trouvé avec l'identifiant spécifié dans la collection '" + collectionName + "'.");
        }

        client.close();
    } catch (err) {
        console.error('Erreur de recherche dans la collection ' + collectionName + ' :', err);
    }
}

// Fonction pour rechercher dans toutes les collections
async function searchAllCollections() {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const database = client.db();
        const collections = await database.listCollections().toArray();

        for (let collection of collections) {
            await searchCollection(database.databaseName, collection.name);
        }

        client.close();
    } catch (err) {
        console.error('Erreur lors de la recherche dans toutes les collections :', err);
    }
}

// Appel de la fonction pour rechercher dans toutes les collections
searchAllCollections();
