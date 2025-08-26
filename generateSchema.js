const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const modelsDir = path.join(__dirname, "models/Requests"); // adapte si besoin

// Fonction pour parser un schema Mongoose récursivement (comme avant)
function parseSchema(schema) {
  const obj = {};
  schema.eachPath((path, schemaType) => {
    if (path.startsWith("__")) return;
    let type = schemaType.instance;
    if (type === "Embedded") {
      obj[path] = parseSchema(schemaType.schema);
    } else if (type === "Array") {
      const caster = schemaType.caster;
      if (!caster) obj[path] = ["Mixed"];
      else if (caster.instance === "Embedded") obj[path] = [parseSchema(caster.schema)];
      else obj[path] = [caster.instance];
    } else {
      obj[path] = type;
    }
  });
  return obj;
}

// Fonction principale
async function extractSchemas() {
  const schemaResults = {};

  // Lire tous les fichiers JS du dossier models
  const files = fs.readdirSync(modelsDir).filter(f => f.endsWith(".js"));

  for (const file of files) {
    const modelPath = path.join(modelsDir, file);
    const model = require(modelPath);

    // Certains fichiers exportent un modèle, d'autres peuvent exporter directement un schema
    let schema;
    if (model.schema) {
      schema = model.schema;
    } else if (model instanceof mongoose.Schema) {
      schema = model;
    } else {
      console.warn(`Le fichier ${file} n'exporte pas un modèle Mongoose valide.`);
      continue;
    }

    const schemaJson = parseSchema(schema);
    const modelName = model.modelName || path.basename(file, ".js");
    schemaResults[modelName] = schemaJson;
  }

  // Afficher tout en JSON
  console.log(JSON.stringify(schemaResults, null, 2));
}

extractSchemas();
