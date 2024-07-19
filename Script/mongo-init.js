// init.js

const DB_NAME = "EXAT2024";
const COLLECTIONS = ["Camera", "Driver", "Emergency", "Report", "RSU", "User", "Car"];

let db = db.getSiblingDB(DB_NAME); // Create or switch to the database

// Create a collection
for(let i=0; i<COLLECTIONS.length; i++){
    db.createCollection(COLLECTIONS[i]);
}

